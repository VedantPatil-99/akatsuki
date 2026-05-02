import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export type DocumentAsset = {
  id: string;
  asset_type: "image" | "url";
  content: string;
  metadata: {
    label?: string;
    width?: number;
    height?: number;
    extension?: string;
  };
  page_number: number;
};

export const useDocumentAssets = (documentIds: string[], status: string) => {
  const [assets, setAssets] = useState<DocumentAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch when we have an ID and the extraction is theoretically done
    if (documentIds.length === 0 || status !== "ready") return;

    const fetchAssets = async () => {
      setIsLoading(true);
      const supabase = createClient();

      // 3. Change .eq() to .in() to fetch multiple documents
      const { data, error } = await supabase
        .from("document_assets")
        .select("*")
        .in("document_id", documentIds)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching document assets:", error);
      } else if (data) {
        setAssets(data as DocumentAsset[]);
      }

      setIsLoading(false);
    };

    fetchAssets();
  }, [documentIds, status]);

  const images = assets.filter((a) => a.asset_type === "image");
  const urls = assets.filter((a) => a.asset_type === "url");

  return { images, urls, isLoading };
};
