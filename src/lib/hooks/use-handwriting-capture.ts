import { useCallback, useMemo, useRef } from "react";

import type { Editor, TLShapeId } from "tldraw";

import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";

import {
  calculateGhostTextPosition,
  calculateShapeBounds,
  expandBounds,
  findShapesInBounds,
} from "../spatial-utils";
import { MemoryChunk } from "../types/handwriting";

// Extract exact type from Tldraw to satisfy strict TypeScript
type TldrawImageOptions = Parameters<Editor["toImage"]>[1];

export interface HandwritingCaptureOptions {
  userId: string; // Required for the API call and Supabase RLS
  contextPadding?: number;
  exportOptions?: TldrawImageOptions;
  // Updated signature to return the AI's prediction and exact canvas coordinates
  onCaptureComplete?: (
    predictedText: string,
    position: { x: number; y: number }
  ) => void;
  onError?: (error: Error) => void;
  previewInNewWindow?: boolean;
  maxMemoryChunks?: number;
}

const DEFAULT_OPTIONS = {
  contextPadding: 400,
  exportOptions: {
    format: "png" as const, // Strict literal type to satisfy Tldraw
    background: true,
    padding: 32,
  },
  onCaptureComplete: () => {},
  onError: () => {},
  previewInNewWindow: false,
  maxMemoryChunks: 5,
};

export function useHandwritingCapture(
  editor: Editor,
  options: HandwritingCaptureOptions
) {
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);
  const contextMemory = useRef<MemoryChunk[]>([]);

  //In-memory cache variables for RAG Context
  const ragContextCache = useRef<string | null>(null);
  const strokeCount = useRef<number>(0);

  const getMemoryContext = useCallback(() => {
    return contextMemory.current.map((m) => m.text).join(" ");
  }, []);

  const addMemoryChunk = useCallback(
    (shapeIds: TLShapeId[], text: string) => {
      contextMemory.current.push({
        shapeIds,
        text,
        timestamp: Date.now(),
      });

      if (contextMemory.current.length > opts.maxMemoryChunks) {
        contextMemory.current.shift();
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
          const contextPadding = opts.contextPadding! / (camera.z as number);

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

          const memoryContext = getMemoryContext();
          console.log("🧠 Sending to AI. Memory context:", memoryContext);

          const formData = new FormData();
          formData.append("file", blob);
          formData.append("memory", memoryContext);
          formData.append("userId", opts.userId);

          // Only fetch fresh DB context every 3 strokes to save 1+ seconds
          strokeCount.current += 1;
          const shouldRefreshContext = strokeCount.current % 3 === 0;

          if (!shouldRefreshContext && ragContextCache.current) {
            formData.append("cachedContext", ragContextCache.current);
            console.log("⚡ Using cached RAG context to speed up prediction!");
          }

          const res = await fetch("/api/ai/autocomplete", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            throw new Error(`API responded with status: ${res.status}`);
          }

          const data = await res.json();
          console.log("🤖 AI Response:", data);

          // Save the context returned from the server into our browser cache
          if (data.ragContext) {
            ragContextCache.current = data.ragContext;
          }

          // Fail-Fast: Ignore accidental scribbles or empty reads
          if (!data.ocrText || data.ocrText.length < 3) return;

          // Add the successful read to our rolling memory
          addMemoryChunk(shapesToExport, data.ocrText);

          // If the AI predicted a next word, calculate where it goes and render it!
          if (data.predictedText) {
            // Calculate spawn position 20px to the right of the current stroke
            const position = calculateGhostTextPosition(editor, shapeIds);

            // Send the prediction back up to canvas-events.tsx to be drawn
            opts.onCaptureComplete?.(data.predictedText, position);
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          opts.onError?.(err);
          console.error("❌ Handwriting pipeline failed:", error);
        }
      },
      [editor, opts, getMemoryContext, addMemoryChunk]
    ),
    600
  );

  return {
    captureHandwriting,
    getMemoryContext,
    addMemoryChunk,
  };
}
