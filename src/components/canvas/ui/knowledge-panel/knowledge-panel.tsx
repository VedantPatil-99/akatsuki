"use client";

import { useState } from "react";

import { CaretDoubleLeftIcon, FolderOpenIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { KnowledgeAssets } from "./knowledge-assets";
import { KnowledgeDocuments } from "./knowledge-documents";
import { KnowledgeDropzone } from "./knowledge-dropzone";
import { KnowledgeFooter } from "./knowledge-footer";
import { KnowledgeOptions } from "./knowledge-options";
import { KnowledgeStatus } from "./knowledge-status";
import { useKnowledgeUpload } from "./use-knowledge-upload";

interface KnowledgePanelProps {
  userId: string;
}

export const KnowledgePanel = ({ userId }: KnowledgePanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    file,
    isPremium,
    setIsPremium,
    pageRange,
    setPageRange,
    status,
    documentIds,
    handleFileSelect,
    handleUpload,
    handleReset,
  } = useKnowledgeUpload(userId);

  const isFormVisible =
    status === "idle" || status === "ready" || status === "failed";

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="default"
          className="corner-squircle order pointer-events-auto absolute top-1/2 right-0 z-1000 flex h-16 w-8 -translate-y-1/2 items-center justify-center rounded-l-3xl border-r-0"
          aria-label="Toggle Knowledge Base Panel"
        >
          <CaretDoubleLeftIcon size={24} weight="bold" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="bg-background pointer-events-auto flex w-full flex-col border-l p-6 sm:max-w-md"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-foreground flex items-center gap-2 text-xl font-semibold">
            <FolderOpenIcon className="text-muted-foreground" size={24} />
            Knowledge Base
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Upload notes, textbooks, or slides to give the AI context for your
            whiteboard session.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-2">
          {isFormVisible ? (
            <>
              <KnowledgeDropzone file={file} onFileSelect={handleFileSelect} />
              <KnowledgeOptions
                pageRange={pageRange}
                onPageRangeChange={setPageRange}
                isPremium={isPremium}
                onPremiumToggle={() => setIsPremium(!isPremium)}
              />
            </>
          ) : null}

          <KnowledgeStatus status={status} />

          <KnowledgeDocuments userId={userId} />

          <KnowledgeAssets
            userId={userId}
            documentIds={documentIds}
            status={status}
          />
        </div>

        <KnowledgeFooter
          status={status}
          hasFile={file !== null}
          onReset={handleReset}
          onUpload={handleUpload}
        />
      </SheetContent>
    </Sheet>
  );
};
