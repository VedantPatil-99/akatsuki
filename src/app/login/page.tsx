import { Suspense } from "react";

import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { PatternBackground } from "@/components/layout/pattern-background";
import { createClient } from "@/lib/supabase/server";

function AuthFormFallback() {
  return (
    <div className="flex min-h-100 w-full max-w-md flex-col items-center justify-center rounded-2xl border border-zinc-100 bg-white p-8 shadow-xl">
      <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-r-2 border-zinc-900 border-r-transparent"></div>
      <p className="mt-4 animate-pulse text-sm font-medium text-zinc-500">
        Loading secure connection...
      </p>
    </div>
  );
}

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If they exist and are NOT anonymous, they don't belong on the login page
  if (user && !user.is_anonymous) {
    redirect("/board");
  }

  return (
    <PatternBackground>
      <Suspense fallback={<AuthFormFallback />}>
        <AuthForm isAnonymous={user?.is_anonymous ?? false} />
      </Suspense>
    </PatternBackground>
  );
}
