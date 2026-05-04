import { NextRequest, NextResponse } from "next/server";

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { Groq } from "groq-sdk";

// Run on the Edge for zero cold starts globally
export const runtime = "edge";
// Force dynamic execution so Next.js doesn't try to build this statically
export const dynamic = "force-dynamic";

interface SearchResultRow {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

const buildSystemPrompt = (context: string) => `
You are a high-precision, spatial autocomplete engine running inside a digital whiteboard. 
Your singular goal is to seamlessly complete the user's current thought based strictly on the provided context.

<rules>
1. LENGTH & BOUNDARIES: Complete the current sentence and STOP at the first logical boundary (e.g., a full stop '.'). ONLY generate 1-2 additional sentences if they are intrinsically linked (like a multi-part definition or theorem).
2. SPATIAL FORMATTING (CRITICAL): You MUST preserve the exact raw formatting of the context. If the text contains matrices, columns, arrays, or code, you MUST output the exact spaces ( ), tabs, and newlines (\\n) required to align them properly. 
3. CONTINUATION ONLY: Do NOT repeat the text the user has already written. Output ONLY the missing characters, words, or structural brackets.
4. NO CHATTER & NO MARKDOWN: Output strictly the raw continuation text. Do not wrap your response in markdown code blocks (\`\`\`). Do not output conversational filler.
5. FALLBACK: If the context does not contain a logical continuation, output exactly: NONE
</rules>

<context>
${context}
</context>
`;

export async function POST(req: NextRequest) {
  // all client initializations INSIDE the handler so they only run at request time
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // For Vision OCR
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); // For High-Speed Prediction

  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    const memory = formData.get("memory") as string | null;
    const userId = formData.get("userId") as string | null;
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

    // Initialize textbook context with the cache (fallback to empty string to satisfy TS)
    let textbookContext: string = cachedContext || "";

    // Only hit Cohere and Supabase if the cache is empty!
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
          match_count: 5,
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

    //  INFERENCE ENGINE
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_completion_tokens: 150,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(textbookContext),
        },
        {
          role: "user",
          content: `<user_input>${fullContextQuery}</user_input>`,
        },
      ],
      stream: false,
    });

    let prediction: string | null =
      chatCompletion.choices[0]?.message?.content?.trim() || "NONE";

    // Clean formatting anomalies while preserving internal newlines
    prediction = prediction.replace(/^["']|["']$/g, "").trim();

    if (prediction === "NONE" || prediction === "") {
      prediction = null;
    }

    // 8. Return results to frontend
    return NextResponse.json({
      predictedText: prediction,
      ocrText: ocrText,
      ragContext: textbookContext,
    });
  } catch (error) {
    console.error("Autocomplete API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
