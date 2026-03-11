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

  const { captureHandwriting } = useHandwritingCapture(editor, {
    previewInNewWindow,
    onCaptureComplete: onHandwritingCaptured,
    onError,
  });

  useEffect(() => {
    if (!editor) return;

    // Listen to every change on the whiteboard
    const cleanup = editor.store.listen((entry) => {
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

      // If we found any valid pen strokes, update the ref and restart the timer
      if (newShapeIds.length > 0) {
        activeShapeIds.current = [
          ...new Set([...activeShapeIds.current, ...newShapeIds]),
        ];
        captureHandwriting(activeShapeIds.current);

        // Clear the ref after triggering capture for next batch
        setTimeout(() => {
          activeShapeIds.current = activeShapeIds.current.filter(
            (id) => !newShapeIds.includes(id)
          );
        }, 1100); // Slightly longer than the debounce delay
      }
    });

    return () => cleanup();
  }, [editor, captureHandwriting]);

  // This component renders nothing visually
  return null;
}
