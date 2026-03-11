import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export type ProcessingStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "ready"
  | "failed";

export const useKnowledgeUpload = (userId: string) => {
  const [file, setFile] = useState<File | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [pageRange, setPageRange] = useState("");
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [documentId, setDocumentId] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setStatus("idle");
  };

  const handleReset = () => {
    setFile(null);
    setPageRange("");
    setStatus("idle");
    setDocumentId(null);
  };

  const handleUpload = async () => {
    if (!file || !userId) return;
    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    formData.append("isPremium", String(isPremium));

    if (pageRange.trim() !== "") {
      formData.append("pageRange", pageRange.trim());
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setDocumentId(data.documentId);
      setStatus("processing");
    } catch (error: unknown) {
      console.error("Upload error:", error);
      setStatus("failed");
    }
  };

  // ==========================================
  // 🧪 MOCK API FOR UI TESTING
  // ==========================================
  // const handleUpload = async () => {
  //   if (!file || !userId) return;
  //   setStatus("uploading");

  //   setStatus("processing");

  //   setTimeout(() => {
  //     setStatus("ready");
  //   }, 20000);

  //   return;
  // };

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
        setStatus(data.status as ProcessingStatus);
      }
    };

    const intervalId = setInterval(pollStatus, 5000);
    return () => clearInterval(intervalId);
  }, [status, documentId]);

  return {
    file,
    isPremium,
    setIsPremium,
    pageRange,
    setPageRange,
    status,
    handleFileSelect,
    handleUpload,
    handleReset,
  };
};
