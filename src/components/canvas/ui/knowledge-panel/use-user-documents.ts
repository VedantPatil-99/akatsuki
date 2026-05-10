import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export interface UserDocument {
  id: string;
  filename: string;
  created_at: string;
}

export function useUserDocuments(userId: string) {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDocuments() {
      if (!userId) return;

      setIsLoading(true);
      const { data, error } = await supabase
        .from("documents")
        .select("id, filename, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10); // Fetch latest 10 for the panel

      if (!error && data) {
        setDocuments(data);
      }
      setIsLoading(false);
    }

    fetchDocuments();
  }, [userId, supabase]);

  return { documents, isLoading };
}
