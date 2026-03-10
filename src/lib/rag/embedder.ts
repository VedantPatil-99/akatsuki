import { Document } from "@langchain/core/documents";
import { CohereClient } from "cohere-ai";

import { supabaseAdmin } from "@/lib/supabase/admin";

export const embedAndStoreChunks = async (
  chunks: Document[],
  documentId: string,
  userId: string
): Promise<void> => {
  if (!chunks.length || !documentId || !userId) {
    throw new Error("Missing required parameters for embedding");
  }

  // 1. Initialize the official Cohere Client
  const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
  });

  // 2. Extract raw text from the LangChain chunks
  const texts = chunks.map((chunk) => chunk.pageContent);

  // 3. Call Cohere's v2 API for embed-v4.0
  const response = await cohere.v2.embed({
    texts: texts,
    model: "embed-v4.0",
    inputType: "search_document", // Crucial for database storage
    embeddingTypes: ["float"], // Requests standard float arrays for pgvector
  });

  // 4. Extract the 1536-dimensional vectors
  const vectors = response.embeddings.float;

  if (!vectors) {
    throw new Error("Cohere failed to return float embeddings");
  }

  // 5. Prepare the bulk insert payload for Supabase
  const records = chunks.map((chunk, index) => ({
    document_id: documentId,
    content: chunk.pageContent,
    metadata: chunk.metadata,
    embedding: vectors[index],
  }));

  // 6. Securely insert into pgvector using the Service Role Key
  const { error: insertError } = await supabaseAdmin
    .from("document_sections")
    .insert(records);

  if (insertError) {
    throw new Error(
      `Failed to store Cohere embeddings: ${insertError.message}`
    );
  }
};
