import LlamaCloud from "@llamaindex/llama-cloud";

export const parseDocumentToMarkdown = async (
  fileUrl: string,
  isPremium: boolean,
  pageRange?: string | null
): Promise<string> => {
  if (!fileUrl) {
    throw new Error("File URL is required for parsing");
  }

  const client = new LlamaCloud({
    apiKey: process.env.LLAMA_CLOUD_API_KEY,
  });

  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
  }

  // Extract the clean filename from the Supabase URL
  const urlObj = new URL(fileUrl);
  const cleanFileName = decodeURIComponent(
    urlObj.pathname.split("/").pop() || "document.pdf"
  );

  // Convert the response to a Blob
  const blob = await response.blob();

  // Wrap it in a native File object
  const file = new File([blob], cleanFileName, { type: blob.type });

  // Upload the explicitly named file to LlamaCloud
  const fileObj = await client.files.create({
    file: file,
    purpose: "parse",
  });

  // Trigger the parsing job with V2 configuration blocks
  const parseResult = await client.parsing.parse({
    file_id: fileObj.id,
    version: "latest",
    tier: isPremium ? "agentic_plus" : "cost_effective",

    // Enable Cost Optimizer for Deep Scan (Premium)
    // Agentic Plus automatically includes specialized chart parsing
    ...(isPremium && {
      processing_options: {
        cost_optimizer: { enable: true },
      },
    }),

    // Safely inject page ranges if provided by the user
    ...(pageRange && {
      page_ranges: {
        target_pages: pageRange,
      },
    }),

    expand: ["markdown"],
  });

  if (!parseResult.markdown || !parseResult.markdown.pages) {
    return "";
  }

  // Safely extract and combine the markdown
  return parseResult.markdown.pages
    .map((page) => ("markdown" in page ? page.markdown : null))
    .filter((text): text is string => text !== null)
    .join("\n\n");
};
