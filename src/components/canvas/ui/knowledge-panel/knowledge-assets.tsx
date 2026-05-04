import { useState } from "react";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Image as ImageIcon, Link as LinkIcon, PlusIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";

import { ImagePreviewModal } from "./image-preview-modal";
import { useDocumentAssets } from "./use-document-assets";

interface KnowledgeAssetsProps {
  userId: string;
  documentIds: string[];
  status: string;
}
export const KnowledgeAssets = ({
  userId,
  documentIds,
  status,
}: KnowledgeAssetsProps) => {
  const { images, urls, isLoading } = useDocumentAssets(
    userId,
    documentIds,
    status
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!images.length && !urls.length) return null;

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="mt-6 flex flex-col gap-2">
      <h3 className="text-sm font-medium text-neutral-400">Extracted Assets</h3>

      <Accordion type="single" collapsible className="w-full">
        {/* Images Accordion Item */}
        {images.length > 0 && (
          <AccordionItem value="item-1">
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger
                data-slot="accordion-trigger"
                className="focus-visible:border-ring focus-visible:ring-ring/50 hover:bg- flex flex-1 cursor-pointer items-center justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&>svg>path:last-child]:origin-center [&>svg>path:last-child]:transition-all [&>svg>path:last-child]:duration-200 [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg>path:last-child]:rotate-90 [&[data-state=open]>svg>path:last-child]:opacity-0"
              >
                <span className="flex items-center gap-4">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/50"
                    aria-hidden="true"
                  >
                    <ImageIcon className="size-4 text-blue-400" />
                  </span>
                  <span className="flex flex-col space-y-0.5">
                    <span className="text-white">Images</span>
                    <span className="text-muted-foreground font-normal">
                      {images.length} extracted items
                    </span>
                  </span>
                </span>
                <PlusIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200" />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionContent className="text-muted-foreground">
              <div className="grid grid-cols-3 gap-2 px-0.5 pt-2 pb-2">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    className="relative aspect-square w-full overflow-hidden rounded-lg border-2 border-neutral-800 bg-neutral-900 transition-colors hover:border-neutral-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onClick={() => handleImageClick(index)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.content}
                      alt={`Extracted from page ${img.page_number}`}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* URLs Accordion Item */}
        {urls.length > 0 && (
          <AccordionItem value="item-2">
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger
                data-slot="accordion-trigger"
                className="focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 cursor-pointer items-center justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&>svg>path:last-child]:origin-center [&>svg>path:last-child]:transition-all [&>svg>path:last-child]:duration-200 [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg>path:last-child]:rotate-90 [&[data-state=open]>svg>path:last-child]:opacity-0"
              >
                <span className="flex items-center gap-4">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/50"
                    aria-hidden="true"
                  >
                    <LinkIcon className="size-4 text-emerald-400" />
                  </span>
                  <span className="flex flex-col space-y-0.5">
                    <span className="text-white">External Links</span>
                    <span className="text-muted-foreground font-normal">
                      {urls.length} URLs found
                    </span>
                  </span>
                </span>
                <PlusIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200" />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionContent className="text-muted-foreground">
              <ul className="flex flex-col gap-3 pt-2 pb-4">
                {urls.map((url) => (
                  <li key={url.id} className="flex items-start gap-2">
                    <a
                      href={url.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="line-clamp-2 text-sm text-indigo-500 underline underline-offset-2 transition-colors hover:text-white hover:no-underline"
                    >
                      {url.metadata.label || url.content}
                    </a>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      <ImagePreviewModal
        images={images}
        currentIndex={selectedImageIndex}
        onIndexChange={setSelectedImageIndex}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};
