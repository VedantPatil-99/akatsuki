import { NextRequest, NextResponse } from "next/server";

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { Groq } from "groq-sdk";

// Run on the Edge for zero cold starts globally
export const runtime = "edge";

// Initialize Supabase Admin for secure backend DB queries without JWTs
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

// Initialize AI Clients
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // For Vision OCR
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); // For High-Speed Prediction

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    const memory = formData.get("memory") as string | null;
    const userId = formData.get("userId") as string | null;

    // OPTIMIZATION: Extract the cached context from the frontend
    const cachedContext = formData.get("cachedContext") as string | null;

    // 1. Validate required fields
    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing required fields (file or userId)" },
        { status: 400 }
      );
    }

    // 2. Prepare Image Blob for Gemini Vision
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    // 3. OCR via Gemini 2.5 Flash Vision
    const ocrResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        "You are an expert OCR engine. Read the handwritten text in this image. Return ONLY the exact text you see. Do not add markdown, quotes, punctuation that isn't there, or conversational filler. If it is just a shape, scribble, or blank, return 'EMPTY'.",
        { inlineData: { data: base64Image, mimeType: "image/png" } },
      ],
    });

    const ocrText = ocrResponse.text?.trim() || "";

    // 4. Fail-Fast: Abort on empty or scribble reads to save DB/LLM costs
    if (ocrText === "EMPTY" || ocrText.length < 2) {
      return NextResponse.json({ predictedText: null, ocrText: "" });
    }

    const fullContextQuery = `${memory || ""} ${ocrText}`.trim();

    // OPTIMIZATION: Initialize textbook context with the cache
    let textbookContext = cachedContext;

    // OPTIMIZATION: Only hit Cohere and Supabase if the cache is empty!
    if (!textbookContext) {
      // 5. Embed the Context Query (Cohere)
      const cohereRes = await fetch("https://api.cohere.com/v2/embed", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          texts: [fullContextQuery],
          model: "embed-v4.0",
          input_type: "search_query",
          embedding_types: ["float"],
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
        : cohereData.embeddings[0];

      // 6. RAG Search (Supabase Hybrid Match)
      const { data: searchResults, error: searchError } =
        await supabaseAdmin.rpc("match_documents_hybrid", {
          query_embedding: queryEmbedding,
          query_text: fullContextQuery,
          match_count: 3,
          p_user_id: userId,
        });

      if (searchError) {
        throw new Error(`Supabase search failed: ${searchError.message}`);
      }

      textbookContext =
        searchResults && searchResults.length > 0
          ? searchResults
              .map((row: SearchResultRow) => row.content)
              .join("\n\n---\n\n")
          : "No specific textbook context found.";
    }

    // 7. Prediction via Groq (llama-3.1-8b-instant)
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.2, // Low temp for deterministic accuracy
      max_completion_tokens: 90, // Hard limit to ensure fast 1-4 word responses
      messages: [
        {
          role: "system",
          content: `You are an intelligent whiteboard autocomplete AI.
          
          TEXTBOOK CONTEXT:
          ${textbookContext}
          
        ASK:
          Predict the rest of the current line, sentence, or code block the user is writing.

          STRICT RULES & EDGE CASES:
          1. COMPLETE THE STRUCTURE: Do not stop early. If the context contains an math formula, array, matrix, or code block (e.g., '{ {1,4,9}... }') and the user is writing a variable assignment like "nums = ", you MUST output the ENTIRE array or value including the closing brackets and semicolons.
          2. EXACT CODE/MATH: You must output the exact mathematical symbols, brackets, and numbers from the context. Do NOT output English descriptions like "the array".
          3. MATRICES & FORMATTING: Preserve the exact spaces, newlines, and layout of matrices if the user is drawing one. 
          4. PARTIAL WORDS: If the user's last input is incomplete, your prediction MUST seamlessly complete it first.
          5. NO REPETITION: Do NOT repeat the words or variables the user has already written.
          6. NO CHATTER: Output ONLY the predicted continuation, nothing else. No markdown, no quotes.
          
          If the context doesn't strongly suggest a logical completion, return the exact word "NONE".`,
        },
        {
          role: "user",
          content: `USER'S CURRENT WRITING: "${fullContextQuery}"`,
        },
      ],
      stream: false,
    });

    let prediction: string | null =
      chatCompletion.choices[0]?.message?.content?.trim() || "NONE";

    // Clean formatting anomalies
    prediction = prediction.replace(/^["']|["']$/g, "").trim();

    if (prediction === "NONE" || prediction === "") {
      prediction = null;
    }

    // 8. Return results to frontend
    return NextResponse.json({
      predictedText: prediction,
      ocrText: ocrText,
      ragContext: textbookContext, // OPTIMIZATION: Send context back to frontend to be cached!
    });
  } catch (error) {
    console.error("Autocomplete API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
