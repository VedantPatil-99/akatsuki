"use client";

import { useEffect, useState } from "react";

import {
  CheckCircleIcon,
  CircleNotchIcon,
  FileTextIcon,
  SparkleIcon,
  UploadSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type ProcessingStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "ready"
  | "failed";

interface KnowledgePanelProps {
  userId: string;
}

export const KnowledgePanel = ({ userId }: KnowledgePanelProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [documentId, setDocumentId] = useState<string | null>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !userId) return;
    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    formData.append("isPremium", String(isPremium));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setDocumentId(data.documentId);
      setStatus("processing");
    } catch (error: unknown) {
      console.error("Upload error:", error);
      setStatus("failed");
    }
  };

  // Polling Mechanism: Ping Supabase every 5 seconds while processing
  useEffect(() => {
    if (status !== "processing" || !documentId) return;

    const supabase = createClient();

    const pollStatus = async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("status")
        .eq("id", documentId)
        .single();

      if (error) {
        console.error("Polling error:", error);
        return;
      }

      if (data?.status === "ready" || data?.status === "failed") {
        setStatus(data.status);
      }
    };

    const intervalId = setInterval(pollStatus, 5000);

    return () => clearInterval(intervalId);
  }, [status, documentId]);

  return (
    <div className="pointer-events-auto flex w-80 flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 font-sans text-neutral-100 shadow-2xl">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-900/50 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <FileTextIcon className="text-neutral-400" size={18} />
          Knowledge Base
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Upload notes for AI context
        </p>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 p-4">
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-800 p-6 transition-colors hover:border-neutral-700 hover:bg-neutral-900/50"
        >
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx,.pptx"
            onChange={handleFileChange}
          />
          <UploadSimpleIcon
            size={24}
            className="mb-2 text-neutral-500 transition-colors group-hover:text-neutral-300"
          />
          <span className="text-center text-xs font-medium text-neutral-400">
            {file ? file.name : "Click or drag PDF, DOCX, PPTX"}
          </span>
        </label>

        {/* Premium Toggle */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <SparkleIcon
              size={16}
              weight={isPremium ? "fill" : "regular"}
              className={isPremium ? "text-amber-400" : "text-neutral-500"}
            />
            <span className="text-xs font-medium text-neutral-300">
              Deep Scan for Diagrams
            </span>
          </div>
          <button
            onClick={() => setIsPremium(!isPremium)}
            className={cn(
              "relative h-4 w-8 rounded-full transition-colors",
              isPremium ? "bg-amber-500" : "bg-neutral-800"
            )}
            aria-label="Toggle Premium Mode"
          >
            <div
              className={cn(
                "absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white transition-transform",
                isPremium ? "translate-x-4" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || status === "uploading" || status === "processing"}
          className="w-full rounded-md bg-white py-2 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "idle" && "Upload & Process"}
          {status === "uploading" && "Uploading..."}
          {status === "processing" && "AI is reading..."}
          {status === "ready" && "Ready! Upload another"}
          {status === "failed" && "Failed. Try again"}
        </button>

        {/* Status Indicators */}
        {status === "processing" && (
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
            <CircleNotchIcon
              size={14}
              className="animate-spin text-neutral-300"
            />
            Extracting structure & vectors...
          </div>
        )}
        {status === "ready" && (
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-400">
            <CheckCircleIcon size={14} />
            Added to Knowledge Base
          </div>
        )}
        {status === "failed" && (
          <div className="flex items-center justify-center gap-2 text-xs text-red-400">
            <XIcon size={14} />
            Something went wrong
          </div>
        )}
      </div>
    </div>
  );
};
