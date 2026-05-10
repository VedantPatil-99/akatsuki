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

  const generateScribbles = async (documentId: string) => {
    try {
      setStatus("pending");
      setProgress(10);
      setError(null);
      setPdfUrl(null);

      // 1. Trigger the background job
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

  // 2. Poll Supabase when we have an active Job ID
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

      // Update local state based on DB status
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
          setError(data.error_message || "Generation failed");
          setProgress(0);
          clearInterval(pollInterval);
          break;
      }
    }, 2500); // Poll every 2.5 seconds

    return () => clearInterval(pollInterval);
  }, [jobId, status, supabase]);

  const reset = () => {
    setStatus("idle");
    setProgress(0);
    setPdfUrl(null);
    setError(null);
    setJobId(null);
  };

  return { generateScribbles, status, progress, pdfUrl, error, reset };
}
