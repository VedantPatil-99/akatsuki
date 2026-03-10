import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";

import { supabaseAdmin } from "@/lib/supabase/admin";

export const embedAndStoreChunks = async (
  chunks: Document[],
  documentId: string,
  userId: string
): Promise<void> => {
  if (!chunks.length || !documentId || !userId) {
    throw new Error("Missing required parameters for embedding");
  }

  const embeddings = new OpenAIEmbeddings({
    modelName: "text-embedding-3-small",
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const texts = chunks.map((chunk) => chunk.pageContent);

  const vectors = await embeddings.embedDocuments(texts);

  const records = chunks.map((chunk, index) => ({
    document_id: documentId,
    user_id: userId,
    content: chunk.pageContent,
    metadata: chunk.metadata,
    embedding: vectors[index],
  }));

  const { error: insertError } = await supabaseAdmin
    .from("document_sections")
    .insert(records);

  if (insertError) {
    throw new Error(
      `Failed to store vector embeddings: ${insertError.message}`
    );
  }
};
