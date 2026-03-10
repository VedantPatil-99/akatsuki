import { Document } from "@langchain/core/documents";
import { MarkdownTextSplitter } from "@langchain/textsplitters";

export const splitTextDualChunking = async (
  markdownText: string
): Promise<Document[]> => {
  if (!markdownText) {
    return [];
  }

  // MarkdownTextSplitter natively acts as a Dual-Chunker in the JS/TS ecosystem.
  // It splits structurally by Headers first, and falls back to character limits
  // only when a single section is too large.
  const markdownSplitter = new MarkdownTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  // createDocuments takes an array of strings and returns LangChain Document objects
  const finalChunks = await markdownSplitter.createDocuments([markdownText]);

  return finalChunks;
};
