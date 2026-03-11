import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";

import { AITextLoading } from "@/components/ui/ai-text-loading";

import { ProcessingStatus } from "./use-knowledge-upload";

interface KnowledgeStatusProps {
  status: ProcessingStatus;
}

export const KnowledgeStatus = ({ status }: KnowledgeStatusProps) => {
  if (status === "idle" || status === "uploading") return null;

  if (status === "processing") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/20 p-6">
        <AITextLoading
          texts={[
            "Reading document...",
            "Analyzing structure...",
            "Extracting data...",
            "Building vector knowledge...",
            "Finalizing...",
          ]}
          interval={2500}
        />
        <p className="mt-4 text-center text-xs text-neutral-500">
          This happens securely in the background. You can close this panel and
          start drawing.
        </p>
      </div>
    );
  }

  if (status === "ready") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-900/50 bg-emerald-950/30 p-3 text-sm text-emerald-400">
        <CheckCircleIcon size={18} />
        Successfully added to Knowledge Base!
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-400">
        <XCircleIcon size={18} />
        Processing failed. Please try again.
      </div>
    );
  }

  return null;
};
