import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export type ScribbleStatus =
  | "idle"
  | "pending"
  | "processing"
  | "rendering"
  | "ready"
  | "failed";

export function useScribbleGenerator() {
  const [status, setStatus] = useState<ScribbleStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const supabase = createClient();

  // NEW: Checks the database to see if a job is already running for this document
  const checkActiveJob = async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from("scribble_jobs")
        .select("id, status, pdf_url, error_message")
        .eq("source_document_id", documentId)
        // Get the most recent job
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return;

      // Re-attach to the running job if it isn't finished!
      if (["pending", "processing", "rendering"].includes(data.status)) {
        setJobId(data.id);
        setStatus(data.status as ScribbleStatus);

        // Restore approximate progress
        if (data.status === "processing") setProgress(40);
        if (data.status === "rendering") setProgress(75);
      }
      // Or show the finished PDF if it completed while the panel was closed
      else if (data.status === "ready") {
        setJobId(data.id);
        setStatus("ready");
        setPdfUrl(data.pdf_url);
        setProgress(100);
      }
    } catch (err) {
      console.error("Failed to check active jobs", err);
    }
  };

  const generateScribbles = async (documentId: string) => {
    try {
      setStatus("pending");
      setProgress(10);
      setError(null);
      setPdfUrl(null);

      const res = await fetch("/api/scribble/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });

      if (!res.ok) throw new Error("Failed to start generation");

      const data = await res.json();
      setJobId(data.jobId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("failed");
    }
  };

  // NEW: Cancels the job in the database and resets the UI
  const cancelGeneration = async () => {
    if (!jobId) {
      reset();
      return;
    }

    // Mark as failed in DB so if the worker checks, it knows to abort
    await supabase
      .from("scribble_jobs")
      .update({ status: "failed", error_message: "Cancelled by user" })
      .eq("id", jobId);

    reset();
  };

  // Poll Supabase when we have an active Job ID
  useEffect(() => {
    if (!jobId || status === "ready" || status === "failed") return;

    const pollInterval = setInterval(async () => {
      const { data, error } = await supabase
        .from("scribble_jobs")
        .select("status, pdf_url, error_message")
        .eq("id", jobId)
        .single();

      if (error) {
        console.error("Polling error:", error);
        return;
      }

      setStatus(data.status as ScribbleStatus);

      switch (data.status) {
        case "processing":
          setProgress(40);
          break;
        case "rendering":
          setProgress(75);
          break;
        case "ready":
          setProgress(100);
          setPdfUrl(data.pdf_url);
          clearInterval(pollInterval);
          break;
        case "failed":
          // If it was cancelled by the user, we just quietly stop.
          if (data.error_message !== "Cancelled by user") {
            setError(data.error_message || "Generation failed");
          }
          setProgress(0);
          clearInterval(pollInterval);
          break;
      }
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [jobId, status, supabase]);

  const reset = () => {
    setStatus("idle");
    setProgress(0);
    setPdfUrl(null);
    setError(null);
    setJobId(null);
  };

  return {
    generateScribbles,
    checkActiveJob,
    cancelGeneration,
    status,
    progress,
    pdfUrl,
    error,
    reset,
  };
}
