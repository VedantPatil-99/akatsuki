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
    source?: string;
  };
  page_number: number;
};

export const useDocumentAssets = (
  userId: string,
  sessionDocumentIds: string[],
  status: string
) => {
  const [assets, setAssets] = useState<DocumentAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If we don't have a user, we can't fetch their history
    if (!userId) return;

    const fetchAssets = async () => {
      setIsLoading(true);
      const supabase = createClient();

      try {
        // 1. Fetch all historical document IDs for this user
        const { data: docs, error: docsError } = await supabase
          .from("documents")
          .select("id")
          .eq("user_id", userId);

        if (docsError) throw docsError;

        // Extract the IDs from the database
        const historicalDocIds = docs?.map((d) => d.id) || [];

        // Combine historical IDs with any new ones currently uploading in this session
        // Using a Set removes any duplicates
        const allDocIds = Array.from(
          new Set([...historicalDocIds, ...sessionDocumentIds])
        );

        if (allDocIds.length === 0) {
          setIsLoading(false);
          return;
        }

        // 2. Fetch all assets for these documents
        const { data: assetData, error: assetError } = await supabase
          .from("document_assets")
          .select("*")
          .in("document_id", allDocIds)
          // OPTIMAL UX: Show the newest uploads at the top!
          .order("created_at", { ascending: false });

        if (assetError) throw assetError;

        if (assetData) {
          setAssets(assetData as DocumentAsset[]);
        }
      } catch (err) {
        console.error("Error fetching document assets:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Trigger fetch on mount, or when new documents are uploaded (status changes)
    fetchAssets();
  }, [userId, sessionDocumentIds, status]);

  const images = assets.filter((a) => a.asset_type === "image");
  const urls = assets.filter((a) => a.asset_type === "url");

  return { images, urls, isLoading };
};
