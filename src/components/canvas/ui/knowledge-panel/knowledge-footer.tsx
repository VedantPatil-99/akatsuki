import { Button } from "@/components/ui/button";

import { ProcessingStatus } from "./use-knowledge-upload";

interface KnowledgeFooterProps {
  status: ProcessingStatus;
  hasFile: boolean;
  onReset: () => void;
  onUpload: () => void;
}

export const KnowledgeFooter = ({
  status,
  hasFile,
  onReset,
  onUpload,
}: KnowledgeFooterProps) => {
  return (
    <div className="mt-6 flex gap-3 border-t border-neutral-800 pt-4">
      {(status === "ready" || status === "failed") && (
        <Button
          variant="outline"
          onClick={onReset}
          className="flex-1 border-neutral-800 bg-transparent text-neutral-300 hover:bg-neutral-900 hover:text-white"
        >
          Upload Another
        </Button>
      )}

      {(status === "idle" || hasFile) && (
        <Button
          onClick={onUpload}
          disabled={
            !hasFile || status === "uploading" || status === "processing"
          }
          className="flex-1 bg-white text-black hover:bg-neutral-200 disabled:opacity-50"
        >
          {status === "uploading" ? "Uploading..." : "Start Processing"}
        </Button>
      )}
    </div>
  );
};
