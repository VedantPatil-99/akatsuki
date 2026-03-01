import { AuthBanner } from "@/components/auth/auth-banner";
import { CanvasAuthButton } from "@/components/auth/canvas-auth-button";
import AkatsukiCanvas from "@/components/canvas/AkatsukiCanvas";
import { createClient } from "@/lib/supabase/server";

export default async function BoardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The proxy.ts guarantees a user exists here, but we default to true just in case
  const isAnonymous = user?.is_anonymous ?? true;
  const email = user?.email;

  // Supabase automatically pulls the avatar_url if they sign in with Google
  const googleIdentity = user?.identities?.find(
    (id) => id.provider === "google"
  );
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    googleIdentity?.identity_data?.avatar_url;

  return (
    <div className="bg-primary flex h-screen w-full flex-col overflow-hidden">
      <AuthBanner />

      <main className="relative h-full w-full flex-1">
        <CanvasAuthButton
          isAnonymous={isAnonymous}
          email={email}
          avatarUrl={avatarUrl}
        />

        <AkatsukiCanvas />
      </main>
    </div>
  );
}
