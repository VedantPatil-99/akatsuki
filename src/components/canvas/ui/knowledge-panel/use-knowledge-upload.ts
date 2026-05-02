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
  const [documentIds, setDocumentIds] = useState<string[]>([]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setStatus("idle");
  };

  const handleReset = () => {
    setFile(null);
    setPageRange("");
    setStatus("idle");
    setDocumentIds([]);
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
      setDocumentIds((prev) => [...prev, data.documentId]);
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
    if (status !== "processing" || !documentIds) return;

    const supabase = createClient();

    const pollStatus = async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("status")
        .eq("id", documentIds)
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
  }, [status, documentIds]);

  return {
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
  };
};
