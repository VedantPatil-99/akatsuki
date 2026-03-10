import { NextRequest, NextResponse } from "next/server";

import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

import { embedAndStoreChunks } from "@/lib/rag/embedder";
import { parseDocumentToMarkdown } from "@/lib/rag/parser";
import { splitTextDualChunking } from "@/lib/rag/splitter";
import { supabaseAdmin } from "@/lib/supabase/admin";

const processDocument = async (req: NextRequest) => {
  const body = await req.json();
  const { documentId, userId, fileUrl, isPremium } = body;

  if (!documentId || !userId || !fileUrl) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    // 1. Parse PDF/PPTX to Markdown via LlamaCloud
    const markdownContent = await parseDocumentToMarkdown(fileUrl, isPremium);

    // 2. Protect tables/diagrams with Dual-Chunking
    const documentChunks = await splitTextDualChunking(markdownContent);

    // 3. Generate vectors and insert into pgvector
    await embedAndStoreChunks(documentChunks, documentId, userId);

    // 4. Update the document status to ready
    await supabaseAdmin
      .from("documents")
      .update({ status: "ready" })
      .eq("id", documentId);

    // Tell QStash the job was successful so it removes it from the queue
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Background Processing Failed for ${documentId}:`, error);

    // Mark as failed in the DB so the frontend stops polling
    await supabaseAdmin
      .from("documents")
      .update({ status: "failed" })
      .eq("id", documentId);

    // Returning 500 tells QStash to retry the job automatically!
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};

// Wrap the handler with QStash's strict security verifier
export const POST = verifySignatureAppRouter(processDocument);
