"use client";

import type { TLShapeId } from "tldraw";

import { KnowledgePanel } from "@/components/canvas/ui/knowledge-panel/knowledge-panel";

import { CanvasEvents } from "./canvas-events";
import { TldrawThemeSync } from "./theme-sync";
import { TldrawWrapper } from "./tldraw-wrapper";

interface AkatsukiCanvasProps {
  userId: string;
}

export default function AkatsukiCanvas({ userId }: AkatsukiCanvasProps) {
  const handleHandwritingCaptured = (blob: Blob, shapeIds: TLShapeId[]) => {
    // TODO: Send to OCR service in Phase 3
    console.log("Handwriting captured for OCR:", { blob, shapeIds });
  };

  const handleError = (error: Error) => {
    console.error("Handwriting capture failed:", error);
  };

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <TldrawWrapper style={{ position: "absolute", inset: 0 }}>
        <TldrawThemeSync />
        <CanvasEvents
          userId={userId}
          onError={handleError}
          previewInNewWindow={true}
        />
      </TldrawWrapper>
      <KnowledgePanel userId={userId} />
    </div>
  );
}
