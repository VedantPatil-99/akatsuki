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

  return (
    <div className="bg-primary flex h-screen w-full flex-col overflow-hidden">
      <AuthBanner />

      <main className="relative h-full w-full flex-1">
        <CanvasAuthButton isAnonymous={isAnonymous} />

        <AkatsukiCanvas />
      </main>
    </div>
  );
}
