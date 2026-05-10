"use client";

import { AlertCircle, Download, Sparkles, XIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useScribbleGenerator } from "@/lib/hooks/use-scribble-generator";

interface ScribbleAlertProps {
  documentId: string;
  documentName: string;
}

export function ScribbleAlert({
  documentId,
  documentName,
}: ScribbleAlertProps) {
  const { generateScribbles, status, progress, pdfUrl, error, reset } =
    useScribbleGenerator();

  // If it hasn't started yet, we show a simple trigger button instead of the full alert
  if (status === "idle") {
    return (
      <Button
        onClick={() => generateScribbles(documentId)}
        variant="outline"
        className="mt-4 flex w-full items-center gap-2"
      >
        <Sparkles className="size-4" />
        Generate Scribble Notes
      </Button>
    );
  }

  return (
    <Alert className="mt-4 flex justify-between">
      {status === "failed" ? (
        <AlertCircle className="text-destructive mt-1" />
      ) : (
        <Sparkles
          className={`mt-1 ${status === "ready" ? "text-primary" : "text-muted-foreground animate-pulse"}`}
        />
      )}

      <div className="ml-3 flex flex-1 flex-col gap-4">
        <div className="flex-1 flex-col justify-center gap-1">
          <AlertTitle>
            {status === "ready"
              ? "Notes Ready!"
              : status === "failed"
                ? "Generation Failed"
                : "Generating Scribbles..."}
          </AlertTitle>
          <AlertDescription className="text-muted-foreground line-clamp-1 text-sm">
            {status === "ready"
              ? `Finished analyzing '${documentName}'`
              : status === "failed"
                ? error
                : status === "pending"
                  ? "Initializing AI Agents..."
                  : status === "processing"
                    ? "Extracting semantic concepts..."
                    : "Sketching layouts and rendering PDF..."}
          </AlertDescription>
        </div>

        {status !== "ready" && status !== "failed" && (
          <Progress
            value={progress}
            className="h-2"
            aria-label="Generation Progress"
          />
        )}

        <div className="flex items-center gap-2">
          {status === "ready" && pdfUrl && (
            <Button
              size="sm"
              className="h-8 rounded-md px-3"
              onClick={() => window.open(pdfUrl, "_blank")}
            >
              <Download className="mr-2 size-4" />
              Download PDF
            </Button>
          )}

          {status === "failed" && (
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => generateScribbles(documentId)}
            >
              Retry
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-8"
            onClick={reset}
          >
            {status === "ready" || status === "failed" ? "Dismiss" : "Hide"}
          </Button>
        </div>
      </div>

      <button
        className="text-muted-foreground hover:text-foreground size-5 cursor-pointer transition-colors"
        onClick={reset}
      >
        <XIcon className="size-4" />
        <span className="sr-only">Close</span>
      </button>
    </Alert>
  );
}
