"use client";

import { useEffect, useRef } from "react";

import { type TLShapeId, useEditor } from "tldraw";

import { useHandwritingCapture } from "@/lib/hooks/use-handwriting-capture";

interface CanvasEventsProps {
  onHandwritingCaptured?: (blob: Blob, shapeIds: TLShapeId[]) => void;
  onError?: (error: Error) => void;
  previewInNewWindow?: boolean;
}

export function CanvasEvents({
  onHandwritingCaptured,
  onError,
  previewInNewWindow = false,
}: CanvasEventsProps) {
  const editor = useEditor();
  const activeShapeIds = useRef<TLShapeId[]>([]);

  const { captureHandwriting, getMemoryContext, addMemoryChunk } =
    useHandwritingCapture(editor, {
      previewInNewWindow,
      onCaptureComplete: onHandwritingCaptured,
      onError,
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
        // Remove ghost text when user starts drawing
        const allShapes = editor.getCurrentPageShapes();
        const ghostShapes = allShapes.filter(
          (shape) => shape.type === "text" && shape.meta?.isGhost === true
        );
        if (ghostShapes.length > 0) {
          editor.deleteShapes(ghostShapes.map((s) => s.id));
        }

        activeShapeIds.current = [
          ...new Set([...activeShapeIds.current, ...newShapeIds]),
        ];
        captureHandwriting(activeShapeIds.current);

        // Clear captured shapes after debounce
        setTimeout(() => {
          activeShapeIds.current = activeShapeIds.current.filter(
            (id) => !newShapeIds.includes(id)
          );
        }, 1100); // Slightly longer than the debounce delay
      }
    });

    return () => cleanup();
  }, [editor, captureHandwriting]);

  // Component handles canvas events only
  return null;
}
