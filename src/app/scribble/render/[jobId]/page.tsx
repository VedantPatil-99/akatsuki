import { notFound } from "next/navigation";

import { OrchestrationResult } from "@/lib/ai/scribble-pipeline";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

interface RenderPageProps {
  // 1. Wrap the params in a Promise
  params: Promise<{
    jobId: string;
  }>;
}

export default async function ScribbleRenderPage({ params }: RenderPageProps) {
  // 2. Await and extract the jobId FIRST
  const { jobId } = await params;

  // 1. Fetch the Job and AI Metadata
  const { data: job, error } = await supabase
    .from("scribble_jobs")
    .select("metadata, source_document_id")
    .eq("id", jobId) // 3. Use the unwrapped jobId here!
    .single();

  if (error || !job || !job.metadata?.agent_outputs) {
    return notFound();
  }

  const pages = job.metadata.agent_outputs as OrchestrationResult[];

  return (
    // We force a specific background and reset margins for clean PDF rendering
    <main className="flex min-h-screen flex-col items-center bg-gray-100 py-10 print:bg-white print:py-0">
      {pages.map((pageData, index) => (
        <ScribblePage
          key={`page-${pageData.pageNumber}-${index}`}
          data={pageData}
        />
      ))}

      {/* This hidden div acts as a signal to Puppeteer that React has finished mounting 
        and rendering the DOM tree, so it's safe to run Rough.js/Mermaid.
      */}
      <div id="render-complete-marker" className="hidden" />
    </main>
  );
}

/**
 * Individual A4 Page Component
 */
function ScribblePage({ data }: { data: OrchestrationResult }) {
  const { semanticData, visualData, researchEnhancements } = data;
  const layout = visualData.page_layout;

  return (
    <article
      className="relative mb-8 overflow-hidden bg-white shadow-xl print:mb-0 print:shadow-none"
      // Standard A4 dimensions at 96 DPI
      style={{
        width: "210mm",
        height: "297mm",
        pageBreakAfter: "always",
      }}
    >
      {/* Header */}
      <header className="absolute top-0 left-0 flex h-12 w-full items-center border-b-2 border-gray-200 px-8 font-mono text-sm text-gray-400">
        <span>Akatsuki Scribble Notes</span>
        <span className="ml-auto">Page {data.pageNumber}</span>
      </header>

      {/* Main Grid Layout - Driven by Agent B's visual strategy */}
      <div className="absolute top-12 bottom-0 left-0 flex w-full">
        {/* Left Gutter (Mnemonics, Connector Anchors) */}
        <aside
          className="font-caveat border-r border-gray-100 bg-slate-50/50 p-4 text-blue-700"
          style={{ width: `${layout.gutter_left_width}%` }}
        >
          {semanticData.page_concepts.map((concept) =>
            concept.margin_mnemonic ? (
              <div key={concept.concept_id} className="mb-8 -rotate-2">
                <p className="text-lg font-bold">{concept.margin_mnemonic}</p>
                <p className="text-sm leading-tight opacity-80">
                  {concept.title}
                </p>
              </div>
            ) : null
          )}
        </aside>

        {/* Main Content Column */}
        <main
          className="overflow-y-auto p-8 pb-32 font-sans"
          style={{ width: `${layout.main_content_width}%` }}
        >
          {semanticData.page_concepts.map((concept) => (
            <section key={concept.concept_id} className="mb-6">
              <h2 className="font-geist mb-2 border-b border-gray-200 pb-1 text-xl font-bold text-gray-900">
                {concept.title}
              </h2>
              <p className="text-sm leading-relaxed text-gray-700">
                {concept.definition}
              </p>

              {/* Inject Researcher Analogy if available */}
              {researchEnhancements[concept.concept_id] && (
                <div className="font-caveat mt-3 rounded-md border border-dashed border-yellow-200 bg-yellow-50 p-3 text-sm text-gray-800">
                  <strong className="mb-1 block font-sans text-xs text-yellow-600 uppercase">
                    Analogy
                  </strong>
                  {researchEnhancements[concept.concept_id]}
                </div>
              )}
            </section>
          ))}
        </main>

        {/* Right Gutter (Doodles, Advanced Notes) */}
        <aside
          className="font-caveat p-4 text-emerald-700"
          style={{ width: `${layout.gutter_right_width}%` }}
        >
          {/* We will target these IDs with Rough.js in the Puppeteer phase */}
          {visualData.visual_elements
            .filter((e) => e.position.side === "right")
            .map((element) => (
              <div
                key={element.element_id}
                id={element.element_id}
                className="mb-10 text-center text-sm"
                style={{ marginTop: `${element.position.vertical_offset}px` }}
              >
                <div
                  className="sketch-container h-16 w-full border border-transparent"
                  data-sketch-type={element.content.icon_suggestion}
                />
                <span>{element.content.label}</span>
              </div>
            ))}
        </aside>
      </div>

      {/* Active Recall Footer */}
      <footer
        className="absolute bottom-0 left-0 w-full bg-gray-900 p-6 text-white"
        style={{ height: `${layout.footer_height}%` }}
      >
        <h3 className="font-geist mb-4 flex items-center gap-2 text-lg font-bold">
          <span className="rounded bg-blue-500 px-2 py-1 text-xs">
            Active Recall
          </span>
          Test Yourself
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {semanticData.active_recall_questions.slice(0, 4).map((q, i) => (
            <div key={q.question_id} className="text-sm">
              <span className="mr-2 font-mono text-gray-400">{i + 1}.</span>
              {q.question_text}
            </div>
          ))}
        </div>
      </footer>
    </article>
  );
}
