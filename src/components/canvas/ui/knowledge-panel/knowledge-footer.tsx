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
    <div className="border-border mt-6 flex gap-3 border-t pt-4">
      {(status === "ready" || status === "failed") && (
        <Button variant="outline" onClick={onReset} className="flex-1">
          Upload Another
        </Button>
      )}

      {(status === "idle" || hasFile) && (
        <Button
          onClick={onUpload}
          disabled={
            !hasFile || status === "uploading" || status === "processing"
          }
          className="flex-1"
        >
          {status === "uploading" ? "Uploading..." : "Start Processing"}
        </Button>
      )}
    </div>
  );
};
