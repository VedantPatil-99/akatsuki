import { NextResponse } from "next/server";

import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

import { runScribblePipeline } from "@/lib/ai/scribble-pipeline";
import { captureScribblePdf } from "@/lib/pdf/generate-pdf";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

async function handler(req: Request) {
  const body = await req.json();
  const { jobId, documentId } = body;

  try {
    // 1. Mark job as Processing
    await supabase
      .from("scribble_jobs")
      .update({ status: "processing" })
      .eq("id", jobId);

    // 2. Retrieve parsed text chunks from existing RAG pipeline
    // Assuming your ingestion pipeline stores vectors in `document_sections`
    const { data: chunks, error: chunksError } = await supabase
      .from("document_sections")
      .select("content, metadata")
      .eq("document_id", documentId)
      .order("id", { ascending: true });

    if (chunksError || !chunks || chunks.length === 0) {
      throw new Error(
        "Failed to fetch document sections. Ensure the document is fully parsed."
      );
    }

    const documentChunks = chunks.map(
      (
        c: { content: string; metadata?: Record<string, unknown> | null },
        index: number
      ) => ({
        // Safely cast the metadata property since it's loosely typed in JSONB
        pageNumber: (c.metadata?.page_number as number) || index + 1,
        content: c.content,
      })
    );

    // 3. Execute the Multi-Agent LLM Orchestration (Step 2)
    const orchestratedLayouts = await runScribblePipeline(documentChunks);

    // 4. Update status to 'rendering' and store the AI outputs
    await supabase
      .from("scribble_jobs")
      .update({
        status: "rendering",
        metadata: { agent_outputs: orchestratedLayouts },
      })
      .eq("id", jobId);

    // ====================================================================
    // Step 5: Browserless PDF Capture & Supabase Storage Upload
    // ====================================================================

    // 1. Generate the PDF Buffer via Browserless
    const pdfBuffer = await captureScribblePdf(jobId);

    // 2. Upload to Supabase Storage
    // CRITICAL: Ensure you have created a PUBLIC bucket named 'scribble-notes' in Supabase!
    const fileName = `${body.userId}/${documentId}/${jobId}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("scribble-notes")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError || !uploadData) {
      throw new Error(`Storage upload failed: ${uploadError?.message}`);
    }

    // Get the public URL for the newly uploaded PDF
    const {
      data: { publicUrl },
    } = supabase.storage.from("scribble-notes").getPublicUrl(fileName);

    // 3. Create the Final Notes Record
    const { error: notesError } = await supabase.from("scribble_notes").insert({
      user_id: body.userId,
      job_id: jobId,
      source_document_id: documentId,
      pdf_url: publicUrl,
      page_count: orchestratedLayouts.length,
      metadata: { agent_outputs: orchestratedLayouts },
    });

    if (notesError)
      throw new Error("Failed to insert final scribble_notes record");

    // 4. Mark the Job as Ready
    await supabase
      .from("scribble_jobs")
      .update({
        status: "ready",
        pdf_url: publicUrl,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    return NextResponse.json({ success: true, jobId, pdfUrl: publicUrl });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown processing error";

    console.error(`[Scribble Worker] Failed for job ${jobId}:`, error);

    // Catch-all error state update so the frontend doesn't poll forever
    await supabase
      .from("scribble_jobs")
      .update({
        status: "failed",
        error_message: errorMessage,
      })
      .eq("id", jobId);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// QStash Middleware ensures only Upstash can trigger this route
export const POST = verifySignatureAppRouter(handler);
