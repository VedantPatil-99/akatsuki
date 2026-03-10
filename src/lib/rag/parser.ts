import { LlamaParseReader } from "@llamaindex/llama-cloud";

export const parseDocumentToMarkdown = async (
  fileUrl: string,
  isPremium: boolean
): Promise<string> => {
  if (!fileUrl) {
    throw new Error("File URL is required for parsing");
  }

  const reader = new LlamaParseReader({
    resultType: "markdown",
    premiumMode: isPremium,
    apiKey: process.env.LLAMA_CLOUD_API_KEY,
    parsingInstruction:
      "Extract all text, code blocks, tables, and mathematical formulas accurately. If premium mode is active, heavily prioritize converting diagrams to Mermaid.js syntax.",
  });

  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
  }

  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const documents = await reader.loadDataAsContent(buffer);

  return documents.map((doc) => doc.text).join("\n\n");
};
