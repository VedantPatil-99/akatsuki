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

    const cleanup = editor.store.listen(
      (entry) => {
        // PRIMARY GUARD: Do not process changes if AI is disabled
        if (!useAIStore.getState().isAIAvailable) return;

        // SOURCE GUARD: Ignore programmatic or remote multiplayer changes
        if (entry.source !== "user") return;

        // TOOL GUARD: Only trigger if the user is actively holding the pen/draw tool.
        // This stops Undo/Redo from triggering the AI.
        if (editor.getCurrentToolId() !== "draw") return;

        const newShapeIds: TLShapeId[] = [];

        // Catch newly drawn lines
        Object.values(entry.changes.added).forEach((record) => {
          if (record.typeName === "shape" && record.type === "draw") {
            newShapeIds.push(record.id);
          }
        });

        // STROKE PROGRESSION GUARD: Differentiate a newly drawn line from a restored one
        Object.values(entry.changes.updated).forEach(([before, after]) => {
          if (
            before.typeName === "shape" &&
            before.type === "draw" &&
            after.typeName === "shape" &&
            after.type === "draw"
          ) {
            // Ensure the actual ink segments changed, ignoring coordinate drags or undo restores
            if (before.props.segments !== after.props.segments) {
              newShapeIds.push(after.id);
            }
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
      },
      { scope: "document", source: "user" }
    );

    return () => cleanup();
  }, [editor, captureHandwriting]);

  return null;
}
