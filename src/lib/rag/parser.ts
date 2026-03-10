import LlamaCloud from "@llamaindex/llama-cloud";

export const parseDocumentToMarkdown = async (
  fileUrl: string,
  isPremium: boolean
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

  // 1. Extract the clean filename from the Supabase URL (ignoring the ?token=... query params)
  const urlObj = new URL(fileUrl);
  const cleanFileName = decodeURIComponent(
    urlObj.pathname.split("/").pop() || "document.pdf"
  );

  // 2. Convert the response to a Blob
  const blob = await response.blob();

  // 3. Wrap it in a native File object so LlamaCloud correctly reads the .pdf/.docx extension
  const file = new File([blob], cleanFileName, { type: blob.type });

  // 4. Upload the explicitly named file to LlamaCloud
  const fileObj = await client.files.create({
    file: file,
    purpose: "parse",
  });

  // 5. Trigger the parsing job
  const parseResult = await client.parsing.parse({
    file_id: fileObj.id,
    tier: isPremium ? "agentic_plus" : "cost_effective",
    version: "latest",
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
