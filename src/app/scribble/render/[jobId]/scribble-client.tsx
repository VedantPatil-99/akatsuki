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

  // Extract all questions and group them into chunks of 6 per page
  const allQuestions = pages.flatMap(
    (p) => p.semanticData.active_recall_questions
  );
  const questionsPerPage = 6;
  const questionPages = [];
  for (let i = 0; i < allQuestions.length; i += questionsPerPage) {
    questionPages.push(allQuestions.slice(i, i + questionsPerPage));
  }

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false });
    Prism.highlightAll();

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
      {/* 1. Render all standard note pages (Never the last page anymore) */}
      {pages.map((pageData, index) => (
        <ScribblePage
          key={`page-${pageData.pageNumber}-${index}`}
          data={pageData}
          isLastPage={false}
        />
      ))}

      {/* 2. Append the Active Recall pages at the very end */}
      {questionPages.map((qChunk, index) => (
        <ActiveRecallPage
          key={`qa-page-${index}`}
          questions={qChunk}
          pageNumber={pages.length + index + 1}
          isLastPage={index === questionPages.length - 1} // Actual last page check
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
        pageBreakAfter: isLastPage ? "auto" : "always",
      }}
    >
      <header className="absolute top-0 left-0 flex h-12 w-full items-center border-b-2 border-gray-200 px-8 font-mono text-sm text-gray-400">
        <span>Akatsuki Scribble Notes</span>
        <span className="ml-auto">Page {data.pageNumber}</span>
      </header>

      {/* Removed the footer constraint so main content flows to the bottom */}
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

        {/* MAIN CONTENT (Padding bottom adjusted since footer is gone) */}
        <main
          className="overflow-y-auto p-8 pb-8 font-sans"
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
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 font-mono text-sm whitespace-pre-wrap text-gray-800">
                      {concept.example.content}
                    </div>
                  )}
                </div>
              )}

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
    </article>
  );
}

// NEW COMPONENT: Active Recall Appendix Pages
function ActiveRecallPage({
  questions,
  pageNumber,
  isLastPage,
}: {
  questions: OrchestrationResult["semanticData"]["active_recall_questions"];
  pageNumber: number;
  isLastPage: boolean;
}) {
  return (
    <article
      className="relative mb-8 overflow-hidden bg-white shadow-xl print:mb-0 print:shadow-none"
      style={{
        width: "210mm",
        height: "297mm",
        pageBreakAfter: isLastPage ? "auto" : "always",
      }}
    >
      <header className="absolute top-0 left-0 flex h-12 w-full items-center border-b-2 border-gray-200 px-8 font-mono text-sm text-gray-400">
        <span>Akatsuki Scribble Notes - Active Recall Appendix</span>
        <span className="ml-auto">Page {pageNumber}</span>
      </header>

      <main className="absolute top-12 bottom-0 left-0 w-full p-12">
        <h1 className="font-geist mb-8 border-b-2 border-gray-200 pb-2 text-2xl font-bold text-gray-900">
          Test Your Knowledge
        </h1>
        <div className="flex flex-col gap-8">
          {questions.map((q, index) => (
            <div
              key={q.question_id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-6"
            >
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                <span className="mr-2 text-blue-500">Q{index + 1}.</span>
                {q.question_text}
              </h3>
              <div className="mt-3 pl-7">
                <strong className="mb-1 block text-xs tracking-wider text-gray-400 uppercase">
                  Answer Summary
                </strong>
                <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                  {q.expected_answer_summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </article>
  );
}
