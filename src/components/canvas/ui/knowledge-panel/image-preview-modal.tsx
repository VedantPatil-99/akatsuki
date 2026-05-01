import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { AssetRecordType, useEditor } from "tldraw";

// Fixed import

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { DocumentAsset } from "./use-document-assets";

interface ImagePreviewModalProps {
  images: DocumentAsset[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImagePreviewModal = ({
  images,
  currentIndex,
  onIndexChange,
  isOpen,
  onOpenChange,
}: ImagePreviewModalProps) => {
  const editor = useEditor();

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const hasNext = currentIndex < images.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (hasNext) onIndexChange(currentIndex + 1);
  };

  const handlePrev = () => {
    if (hasPrev) onIndexChange(currentIndex - 1);
  };

  const handleAddToCanvas = () => {
    if (!currentImage) return;

    let width = currentImage.metadata.width || 400;
    let height = currentImage.metadata.height || 400;

    // The maximum dimension you want on the canvas
    const MAX_SIZE = 400;

    // Calculate scaling factor to maintain aspect ratio
    if (width > MAX_SIZE || height > MAX_SIZE) {
      const scale = Math.min(MAX_SIZE / width, MAX_SIZE / height);
      width = width * scale;
      height = height * scale;
    }

    // 1. Register the asset in Tldraw
    const assetId = AssetRecordType.createId();
    editor.createAssets([
      {
        id: assetId,
        type: "image",
        typeName: "asset",
        props: {
          name: `extracted-img-${currentImage.id}`,
          src: currentImage.content,
          w: width,
          h: height,
          mimeType: "image/png",
          isAnimated: false,
        },
        meta: {},
      },
    ]);

    // 2. Spawn the shape in the center of the current viewport
    const viewport = editor.getViewportPageBounds();
    editor.createShape({
      type: "image",
      x: viewport.center.x - width / 2,
      y: viewport.center.y - height / 2,
      props: {
        w: width,
        h: height,
        assetId,
      },
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(600px,80vh)] flex-col gap-0 p-0 sm:max-w-md">
        <DialogHeader className="contents space-y-0 text-left">
          <ScrollArea className="flex max-h-full flex-col overflow-hidden">
            <DialogTitle className="px-6 pt-6">
              Image Preview ({currentIndex + 1} of {images.length})
            </DialogTitle>
            <DialogDescription asChild>
              <div className="p-6">
                <div className="flex items-center justify-center rounded-md border border-neutral-800 bg-neutral-900/50 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentImage.content}
                    alt={`Page ${currentImage.page_number}`}
                    className="max-h-[300px] w-auto rounded object-contain"
                  />
                </div>

                <div className="mt-4 space-y-1 text-sm text-neutral-400">
                  <p>
                    <strong className="text-foreground font-semibold">
                      Source:
                    </strong>{" "}
                    Page {currentImage.page_number}
                  </p>
                  <p>
                    <strong className="text-foreground font-semibold">
                      Dimensions:
                    </strong>{" "}
                    {currentImage.metadata.width}x{currentImage.metadata.height}
                    px
                  </p>
                </div>
              </div>
            </DialogDescription>
          </ScrollArea>
        </DialogHeader>

        <DialogFooter className="flex-row items-center justify-between border-t px-6 py-4 sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              disabled={!hasPrev}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={!hasNext}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleAddToCanvas} className="gap-2">
              <PlusIcon className="size-4" />
              Add to Canvas
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
