"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { FileTextIcon, PlusIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";

import { ScribbleAlert } from "./scribble-alert";
import { useUserDocuments } from "./use-user-documents";

// Ensure correct import path

interface KnowledgeDocumentsProps {
  userId: string;
}

export const KnowledgeDocuments = ({ userId }: KnowledgeDocumentsProps) => {
  const { documents, isLoading } = useUserDocuments(userId);

  if (isLoading || documents.length === 0) return null;

  return (
    <div className="mt-6 flex flex-col gap-2">
      <h3 className="text-sm font-medium text-neutral-400">Your Library</h3>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-docs">
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger className="focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 cursor-pointer items-center justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&>svg>path:last-child]:origin-center [&>svg>path:last-child]:transition-all [&>svg>path:last-child]:duration-200 [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg>path:last-child]:rotate-90 [&[data-state=open]>svg>path:last-child]:opacity-0">
              <span className="flex items-center gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/50">
                  <FileTextIcon className="size-4 text-purple-400" />
                </span>
                <span className="flex flex-col space-y-0.5">
                  <span className="text-white">Uploaded Documents</span>
                  <span className="text-muted-foreground font-normal">
                    {documents.length} recent files
                  </span>
                </span>
              </span>
              <PlusIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>

          <AccordionContent className="text-muted-foreground">
            <ul className="flex flex-col gap-4 px-1 pt-2 pb-4">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-900/30 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="line-clamp-1 text-sm font-medium text-neutral-200">
                      {doc.filename}
                    </span>
                    <span className="shrink-0 text-xs text-neutral-500">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* The Scribble Generator UI is embedded right inside the card! */}
                  <div className="mt-1">
                    <ScribbleAlert
                      documentId={doc.id}
                      documentName={doc.filename}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
