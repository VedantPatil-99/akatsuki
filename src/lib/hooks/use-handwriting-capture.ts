import { useCallback, useMemo, useRef } from "react";

import type { Editor, TLShapeId } from "tldraw";

import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";

import {
  calculateShapeBounds,
  expandBounds,
  findShapesInBounds,
} from "../spatial-utils";
import { MemoryChunk } from "../types/handwriting";

export interface HandwritingCaptureOptions {
  contextPadding?: number;
  exportOptions?: {
    format?: "png" | "jpeg" | "webp" | "svg";
    background?: boolean;
    padding?: number;
  };
  onCaptureComplete?: (blob: Blob, shapeIds: TLShapeId[]) => void;
  onError?: (error: Error) => void;
  previewInNewWindow?: boolean;
  maxMemoryChunks?: number;
}

const DEFAULT_OPTIONS: Required<HandwritingCaptureOptions> = {
  contextPadding: 400,
  exportOptions: {
    format: "png",
    background: true,
    padding: 32,
  },
  onCaptureComplete: () => {},
  onError: () => {},
  previewInNewWindow: false,
  maxMemoryChunks: 5, // Keep 5 chunks
};

export function useHandwritingCapture(
  editor: Editor,
  options: HandwritingCaptureOptions = {}
) {
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);

  // Memory chunks for context awareness
  const contextMemory = useRef<MemoryChunk[]>([]);

  // Get memory context as string
  const getMemoryContext = useCallback(() => {
    return contextMemory.current.map((m) => m.text).join(" ");
  }, []);

  // Add memory chunk with cleanup
  const addMemoryChunk = useCallback(
    (shapeIds: TLShapeId[], text: string) => {
      contextMemory.current.push({
        shapeIds,
        text,
        timestamp: Date.now(),
      });

      // Keep only last N chunks
      if (contextMemory.current.length > opts.maxMemoryChunks!) {
        contextMemory.current.shift(); // Remove oldest
      }
    },
    [opts.maxMemoryChunks]
  );

  const captureHandwriting = useDebouncedCallback(
    useCallback(
      async (shapeIds: TLShapeId[]) => {
        if (shapeIds.length === 0) return;

        try {
          // Dynamic padding for zoom levels
          const camera = editor.getCamera();
          const contextPadding = opts.contextPadding! / camera.z;

          // 1. Calculate shape boundaries
          const shapeBounds = calculateShapeBounds(editor, shapeIds);

          // 2. Expand for context aura
          const contextBounds = expandBounds(shapeBounds, contextPadding);

          // 3. Find shapes in context
          const contextShapeIds = findShapesInBounds(editor, contextBounds);

          // 4. Determine shapes to export
          const shapesToExport =
            contextShapeIds.length > 0 ? contextShapeIds : shapeIds;

          // 5. Export as image
          const { blob } = await editor.toImage(
            shapesToExport,
            opts.exportOptions
          );

          // 6. Preview if requested
          if (opts.previewInNewWindow) {
            const imageUrl = URL.createObjectURL(blob);
            window.open(imageUrl, "_blank");
          }

          // API integration placeholder
          const memoryContext = getMemoryContext();
          console.log(
            "Sending blob to OCR with memory context:",
            memoryContext
          );

          // Placeholder API integration - ready for actual endpoint
          /*
          const formData = new FormData();
          formData.append("file", blob);
          formData.append("memory", memoryContext);
          
          const res = await fetch("/api/ai/autocomplete", { 
            method: "POST", 
            body: formData 
          });
          const data = await res.json();
          
          // 💡 Fail-Fast for accidental scribbles
          if (data.ocrText.length < 3) return;

          // Add new memory chunk with OCR result
          addMemoryChunk(shapesToExport, data.ocrText);
          */

          // 7. Call completion callback
          opts.onCaptureComplete?.(blob, shapesToExport);

          console.log("✅ Context-Aware Capture complete!", blob);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          opts.onError?.(err);
          console.error("Failed to export context:", error);
        }
      },
      [editor, opts, getMemoryContext]
    ),
    1000
  );

  return {
    captureHandwriting,
    getMemoryContext,
    addMemoryChunk,
  };
}
