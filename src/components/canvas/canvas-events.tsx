"use client";

import { useEffect, useRef } from "react";

import { type TLShapeId, useEditor } from "tldraw";

import { useHandwritingCapture } from "@/lib/hooks/use-handwriting-capture";
import { GhostTextManager } from "@/lib/utils/ghost-text-manager";

interface CanvasEventsProps {
  userId: string; // <-- Needs userId to pass to the hook
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

  useEffect(() => {
    if (editor && !ghostManager.current) {
      ghostManager.current = new GhostTextManager(editor);
    }
  }, [editor]);

  const { captureHandwriting } = useHandwritingCapture(editor, {
    userId,
    previewInNewWindow,
    onError,
    // The hook hands us the final AI prediction and exact coordinates
    onCaptureComplete: (predictedText, position) => {
      ghostManager.current?.createGhostText(predictedText, position);
    },
  });

  useEffect(() => {
    if (!editor) return;

    // Listen to whiteboard changes
    const cleanup = editor.store.listen((entry) => {
      // Check if deleted shapes were part of memory
      const removedIds = Object.keys(entry.changes.removed);
      if (removedIds.length > 0) {
        // TODO: Implement memory management for deleted shapes
        console.log("Shapes removed:", removedIds);
      }

      // Skip capture when using eraser
      if (editor.getCurrentToolId() === "eraser") return;

      const newShapeIds: TLShapeId[] = [];

      // Handle newly added shapes
      Object.values(entry.changes.added).forEach((record) => {
        if (record.typeName === "shape" && record.type === "draw") {
          newShapeIds.push(record.id);
        }
      });

      // Handle updated shapes (these are arrays: [fromRecord, toRecord])
      Object.values(entry.changes.updated).forEach((updateTuple) => {
        const toRecord = updateTuple[1]; // Get the newest version of the shape
        if (toRecord.typeName === "shape" && toRecord.type === "draw") {
          newShapeIds.push(toRecord.id);
        }
      });

      // Handle new pen strokes
      if (newShapeIds.length > 0) {
        // User started drawing again! Instantly destroy any visible ghost text
        ghostManager.current?.cleanupGhostsOnNewInput();

        activeShapeIds.current = [
          ...new Set([...activeShapeIds.current, ...newShapeIds]),
        ];

        captureHandwriting(activeShapeIds.current);

        // Clear captured shapes after debounce
        setTimeout(() => {
          activeShapeIds.current = activeShapeIds.current.filter(
            (id) => !newShapeIds.includes(id)
          );
        }, 1100);
      }
    });

    return () => cleanup();
  }, [editor, captureHandwriting]);

  // Component handles canvas events only
  return null;
}
