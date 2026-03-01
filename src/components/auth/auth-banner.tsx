import { createClient } from "@/lib/supabase/server";

import { AuthBannerClient } from "./auth-banner-client";

export async function AuthBanner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If there is no user, or the user is already permanent, hide the banner
  if (!user || !user.is_anonymous) return null;

  // If they are a guest, render the interactive Client Component
  return <AuthBannerClient />;
}
