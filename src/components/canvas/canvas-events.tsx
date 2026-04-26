"use client";

import { useEffect, useRef } from "react";

import { type TLShapeId, useEditor } from "tldraw";

import { useHandwritingCapture } from "@/lib/hooks/use-handwriting-capture";
import { useAIStore } from "@/lib/stores/use-ai-store";
import { GhostTextManager } from "@/lib/utils/ghost-text-manager";

interface CanvasEventsProps {
  userId: string;
  onError?: (error: Error) => void;
  previewInNewWindow?: boolean;
}

export function CanvasEvents({
  userId,
  onError,
  previewInNewWindow = false,
}: CanvasEventsProps) {
  const editor = useEditor();
  const activeShapeIds = useRef<TLShapeId[]>([]);
  const ghostManager = useRef<GhostTextManager | null>(null);
  const isAIAvailable = useAIStore((state) => state.isAIAvailable);

  useEffect(() => {
    if (editor && !ghostManager.current) {
      ghostManager.current = new GhostTextManager(editor);
    }
  }, [editor]);

  // Clean up existing ghosts instantly if AI is toggled OFF mid-drawing
  useEffect(() => {
    if (!isAIAvailable && ghostManager.current) {
      ghostManager.current.cleanupGhostsOnNewInput();
    }
  }, [isAIAvailable]);

  const { captureHandwriting } = useHandwritingCapture(editor, {
    userId,
    previewInNewWindow,
    onError,
    onCaptureComplete: (predictedText, position) => {
      // Secondary guard: Don't spawn text if turned off during API call
      if (!useAIStore.getState().isAIAvailable) return;
      ghostManager.current?.createGhostText(predictedText, position);
    },
  });

  useEffect(() => {
    if (!editor) return;

    const cleanup = editor.store.listen((entry) => {
      // PRIMARY GUARD: Do not process changes if AI is disabled
      if (!useAIStore.getState().isAIAvailable) return;

      const removedIds = Object.keys(entry.changes.removed);
      if (removedIds.length > 0) {
        console.log("Shapes removed:", removedIds);
      }

      if (editor.getCurrentToolId() === "eraser") return;

      const newShapeIds: TLShapeId[] = [];

      Object.values(entry.changes.added).forEach((record) => {
        if (record.typeName === "shape" && record.type === "draw") {
          newShapeIds.push(record.id);
        }
      });

      Object.values(entry.changes.updated).forEach((updateTuple) => {
        const toRecord = updateTuple[1];
        if (toRecord.typeName === "shape" && toRecord.type === "draw") {
          newShapeIds.push(toRecord.id);
        }
      });

      if (newShapeIds.length > 0) {
        ghostManager.current?.cleanupGhostsOnNewInput();

        activeShapeIds.current = [
          ...new Set([...activeShapeIds.current, ...newShapeIds]),
        ];

        captureHandwriting(activeShapeIds.current);

        setTimeout(() => {
          activeShapeIds.current = activeShapeIds.current.filter(
            (id) => !newShapeIds.includes(id)
          );
        }, 500);
      }
    });

    return () => cleanup();
  }, [editor, captureHandwriting]);

  return null;
}
