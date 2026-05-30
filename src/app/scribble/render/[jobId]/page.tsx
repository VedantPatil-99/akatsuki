// src/app/scribble/render/[jobId]/page.tsx
import { notFound } from "next/navigation";

import { OrchestrationResult } from "@/lib/ai/scribble-pipeline";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

import { ScribbleClientRenderer } from "./scribble-client";

interface RenderPageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default async function ScribbleRenderPage({ params }: RenderPageProps) {
  const { jobId } = await params;

  const { data: job, error } = await supabase
    .from("scribble_jobs")
    .select("metadata, source_document_id")
    .eq("id", jobId)
    .single();

  if (error || !job || !job.metadata?.agent_outputs) {
    return notFound();
  }

  const pages = job.metadata.agent_outputs as OrchestrationResult[];

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-100 py-10 print:bg-white print:py-0">
      {/* Pass the data to the Client Component that handles the DOM manipulation */}
      <ScribbleClientRenderer pages={pages} />
    </main>
  );
}
