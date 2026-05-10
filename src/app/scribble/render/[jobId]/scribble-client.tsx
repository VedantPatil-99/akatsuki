"use client";

import { useEffect, useRef, useState } from "react";

import mermaid from "mermaid";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import rough from "roughjs";

import { OrchestrationResult } from "@/lib/ai/scribble-pipeline";

export function ScribbleClientRenderer({
  pages,
}: {
  pages: OrchestrationResult[];
}) {
  const [isRendered, setIsRendered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Initialize Mermaid with a hand-drawn looking theme if possible
    mermaid.initialize({ startOnLoad: false, theme: "neutral" });

    // 2. Run Prism Syntax Highlighting
    Prism.highlightAll();

    // 3. Draw Rough.js Sketches
    if (containerRef.current) {
      const sketchContainers =
        containerRef.current.querySelectorAll(".sketch-container");
      sketchContainers.forEach((container) => {
        container.innerHTML = "";
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        container.appendChild(svg);

        const rc = rough.svg(svg);
        const sketchType =
          container.getAttribute("data-sketch-type")?.toLowerCase() || "";

        if (
          sketchType.includes("table") ||
          sketchType.includes("matrix") ||
          sketchType.includes("array")
        ) {
          svg.appendChild(
            rc.rectangle(10, 10, 40, 40, {
              fill: "rgba(59, 130, 246, 0.2)",
              fillStyle: "zigzag",
            })
          );
          svg.appendChild(rc.line(10, 30, 50, 30));
          svg.appendChild(rc.line(30, 10, 30, 50));
        } else if (
          sketchType.includes("arrow") ||
          sketchType.includes("swap")
        ) {
          svg.appendChild(
            rc.line(10, 25, 50, 25, { stroke: "blue", strokeWidth: 2 })
          );
          svg.appendChild(
            rc.line(40, 15, 50, 25, { stroke: "blue", strokeWidth: 2 })
          );
          svg.appendChild(
            rc.line(40, 35, 50, 25, { stroke: "blue", strokeWidth: 2 })
          );
        } else if (sketchType.includes("calc") || sketchType.includes("math")) {
          svg.appendChild(rc.rectangle(15, 10, 30, 40));
          svg.appendChild(
            rc.rectangle(20, 15, 20, 10, { fill: "solid", fillWeight: 1 })
          );
        } else {
          svg.appendChild(
            rc.circle(30, 30, 40, {
              stroke: "green",
              strokeWidth: 1.5,
              fillStyle: "cross-hatch",
            })
          );
        }
      });
    }

    // 4. Render Mermaid Diagrams and Signal Browserless
    const renderVisuals = async () => {
      try {
        await mermaid.run({ querySelector: ".mermaid" });
      } catch (err) {
        console.error("Mermaid parsing error:", err);
      }
      setIsRendered(true);
    };

    const timer = setTimeout(renderVisuals, 800);
    return () => clearTimeout(timer);
  }, [pages]);

  return (
    <div ref={containerRef} className="flex w-full flex-col items-center">
      {pages.map((pageData, index) => (
        <ScribblePage
          key={`page-${pageData.pageNumber}-${index}`}
          data={pageData}
          // Fix for the blank page! Tell the component if it's the last page.
          isLastPage={index === pages.length - 1}
        />
      ))}

      {isRendered && <div id="render-complete-marker" className="hidden" />}
    </div>
  );
}

function ScribblePage({
  data,
  isLastPage,
}: {
  data: OrchestrationResult;
  isLastPage: boolean;
}) {
  const { semanticData, visualData, researchEnhancements } = data;
  const layout = visualData.page_layout;

  return (
    <article
      className="relative mb-8 overflow-hidden bg-white shadow-xl print:mb-0 print:shadow-none"
      style={{
        width: "210mm",
        height: "297mm",
        // BUG FIX: Only page break if it's NOT the last page
        pageBreakAfter: isLastPage ? "auto" : "always",
      }}
    >
      <header className="absolute top-0 left-0 flex h-12 w-full items-center border-b-2 border-gray-200 px-8 font-mono text-sm text-gray-400">
        <span>Akatsuki Scribble Notes</span>
        <span className="ml-auto">Page {data.pageNumber}</span>
      </header>

      <div className="absolute top-12 bottom-0 left-0 flex w-full">
        {/* LEFT GUTTER */}
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

        {/* MAIN CONTENT */}
        <main
          className="overflow-y-auto p-8 pb-32 font-sans"
          style={{ width: `${layout.main_content_width}%` }}
        >
          {semanticData.page_concepts.map((concept) => (
            <section key={concept.concept_id} className="mb-8">
              <h2 className="font-geist mb-2 border-b border-gray-200 pb-1 text-xl font-bold text-gray-900">
                {concept.title}
              </h2>
              <p className="text-sm leading-relaxed text-gray-700">
                {concept.definition}
              </p>

              {/* NEW: Render AI Generated Examples (Code or Text) */}
              {concept.example && (
                <div className="mt-4">
                  <strong className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
                    Example
                  </strong>
                  {concept.example.type === "code" ? (
                    <pre className="overflow-x-auto rounded-md bg-gray-800 p-4 text-sm text-gray-100">
                      <code
                        className={`language-${concept.example.language || "javascript"}`}
                      >
                        {concept.example.content}
                      </code>
                    </pre>
                  ) : (
                    // FIX: Added whitespace-pre-wrap and font-mono so Math spacing is respected
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 font-mono text-sm whitespace-pre-wrap text-gray-800">
                      {concept.example.content}
                    </div>
                  )}
                </div>
              )}

              {/* NEW: Render Inline Mermaid Diagrams for this specific concept */}
              {visualData.diagram_requirements
                ?.filter(
                  (d) =>
                    d.concept_id === concept.concept_id &&
                    d.position === "inline"
                )
                .map((diagram) => (
                  <div
                    key={diagram.diagram_id}
                    className="my-6 flex w-full justify-center"
                  >
                    <div className="mermaid text-sm">
                      {diagram.mermaid_syntax}
                    </div>
                  </div>
                ))}

              {researchEnhancements[concept.concept_id] && (
                <div className="font-caveat mt-4 rounded-md border border-dashed border-yellow-200 bg-yellow-50 p-3 text-sm text-gray-800">
                  <strong className="mb-1 block font-sans text-xs text-yellow-600 uppercase">
                    Analogy
                  </strong>
                  {researchEnhancements[concept.concept_id]}
                </div>
              )}
            </section>
          ))}
        </main>

        {/* RIGHT GUTTER */}
        <aside
          className="font-caveat p-4 text-emerald-700"
          style={{ width: `${layout.gutter_right_width}%` }}
        >
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
                  className="sketch-container mx-auto h-16 w-16"
                  data-sketch-type={element.content.icon_suggestion}
                />
                <span className="mt-2 block font-semibold">
                  {element.content.label}
                </span>
              </div>
            ))}
        </aside>
      </div>

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
