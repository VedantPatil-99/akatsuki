import { useCallback, useMemo } from "react";

import type { Editor, TLShapeId } from "tldraw";

import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";

import {
  calculateShapeBounds,
  expandBounds,
  findShapesInBounds,
} from "../spatial-utils";

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
};

export function useHandwritingCapture(
  editor: Editor,
  options: HandwritingCaptureOptions = {}
) {
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);

  const captureHandwriting = useDebouncedCallback(
    useCallback(
      async (shapeIds: TLShapeId[]) => {
        if (shapeIds.length === 0) return;

        try {
          // 1. Calculate the exact boundaries of the newly drawn shapes
          const shapeBounds = calculateShapeBounds(editor, shapeIds);

          // 2. Expand boundaries to create the "Context Aura"
          const contextBounds = expandBounds(shapeBounds, opts.contextPadding);

          // 3. Find shapes within the context aura
          const contextShapeIds = findShapesInBounds(editor, contextBounds);

          // 4. Determine which shapes to export (context shapes or fallback to original)
          const shapesToExport =
            contextShapeIds.length > 0 ? contextShapeIds : shapeIds;

          // 5. Export the shapes as an image
          const { blob } = await editor.toImage(
            shapesToExport,
            opts.exportOptions
          );

          // 6. Preview in new window if requested (for testing)
          if (opts.previewInNewWindow) {
            const imageUrl = URL.createObjectURL(blob);
            window.open(imageUrl, "_blank");
          }

          // 7. Call completion callback
          opts.onCaptureComplete(blob, shapesToExport);

          console.log("✅ Context-Aware Capture complete!", blob);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          opts.onError(err);
          console.error("Failed to export context:", error);
        }
      },
      [editor, opts]
    ),
    1000
  );

  return { captureHandwriting };
}
