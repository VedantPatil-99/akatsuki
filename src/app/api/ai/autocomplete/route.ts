import { NextRequest, NextResponse } from "next/server";

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin Client
// We use the Service Role Key here so the backend can securely query the DB
// on behalf of the user without needing to pass JWT auth headers from the canvas.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

interface SearchResultRow {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

// Initialize Gemini (Ensure GEMINI_API_KEY is in your .env.local)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    const memory = formData.get("memory") as string | null;
    const userId = formData.get("userId") as string | null;

    // 1. Fail-Fast Validation
    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing required fields (file or userId)" },
        { status: 400 }
      );
    }

    // 2. Convert Blob to Base64 for Gemini Vision
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    // 3. STEP A: OCR (Optical Character Recognition) via Gemini 2.5 Flash
    // We use a strict prompt to ensure it ONLY outputs the text it sees.
    const ocrResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        "You are an expert OCR engine. Read the handwritten text in this image. Return ONLY the exact text you see. Do not add markdown, quotes, punctuation that isn't there, or conversational filler. If it is just a shape, scribble, or blank, return 'EMPTY'.",
        { inlineData: { data: base64Image, mimeType: "image/png" } },
      ],
    });

    const ocrText = ocrResponse.text?.trim() || "";

    // 4. Fail-Fast: Ignore scribbles, empty reads, or accidental dots
    // This saves you money by aborting before calling Cohere or Supabase!
    if (ocrText === "EMPTY" || ocrText.length < 2) {
      return NextResponse.json({ predictedText: null, ocrText: "" });
    }

    // Combine the rolling memory with the newly read text
    const fullContextQuery = `${memory || ""} ${ocrText}`.trim();

    // 5. STEP B: Embed the Search Query (Cohere)
    const cohereRes = await fetch("https://api.cohere.ai/v2/embed", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        texts: [fullContextQuery],
        model: "embed-v4.0",
        input_type: "search_query", // FIX: Must be snake_case!
        embedding_types: ["float"], // FIX: Must be snake_case!
      }),
    });

    if (!cohereRes.ok) {
      const errorText = await cohereRes.text();
      console.error("❌ Cohere API Rejected Request:", errorText);
      throw new Error(`Cohere embedding failed: ${errorText}`);
    }

    const cohereData = await cohereRes.json();
    const queryEmbedding = cohereData.embeddings.float
      ? cohereData.embeddings.float[0]
      : cohereData.embeddings[0]; // Fallback depending on exact API version response

    // 6. STEP C: RAG Search (Querying Supabase Hybrid Search)
    const { data: searchResults, error: searchError } = await supabaseAdmin.rpc(
      "match_documents_hybrid",
      {
        query_embedding: queryEmbedding,
        query_text: fullContextQuery,
        match_count: 3, // Fetch the top 3 most relevant textbook chunks
        p_user_id: userId,
      }
    );

    if (searchError) {
      throw new Error(`Supabase search failed: ${searchError.message}`);
    }

    // 7. STEP D: The Prediction (Gemini 2.5 Flash)
    // Combine the retrieved chunks into a single textbook context block
    const textbookContext =
      searchResults && searchResults.length > 0
        ? searchResults
            .map((row: SearchResultRow) => row.content)
            .join("\n\n---\n\n")
        : "No specific textbook context found.";

    const completionResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an intelligent whiteboard autocomplete AI.
      
      TEXTBOOK CONTEXT:
      ${textbookContext}
      
      USER'S CURRENT WRITING (Memory + Current Stroke):
      "${fullContextQuery}"
      
      TASK:
      Predict the next 1 to 4 words the user is going to write based on the context.
      Do NOT repeat the words the user has already written. Only output the continuation.
      If the context doesn't strongly suggest a logical completion, return the exact word "NONE".
      Output ONLY the predicted words, nothing else.`,
    });

    let prediction: string | null = completionResponse.text?.trim() || "NONE";

    // Clean up the prediction (remove surrounding quotes if the LLM got overzealous)
    prediction = prediction.replace(/^["']|["']$/g, "").trim();

    if (prediction === "NONE" || prediction === "") {
      prediction = null; // Look ma, no 'as any'!
    }

    // 8. Return the goods to the frontend!
    return NextResponse.json({
      predictedText: prediction,
      ocrText: ocrText,
    });
  } catch (error) {
    console.error("Autocomplete API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
