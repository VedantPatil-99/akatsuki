import { Suspense } from "react";

import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { createClient } from "@/lib/supabase/server";

function AuthFormFallback() {
  return (
    <div className="flex min-h-[400px] w-full max-w-md flex-col items-center justify-center rounded-2xl border border-zinc-100 bg-white p-8 shadow-xl">
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

      <div className="relative z-10 flex w-full justify-center">
        <Suspense fallback={<AuthFormFallback />}>
          <AuthForm isAnonymous={user?.is_anonymous ?? false} />
        </Suspense>
      </div>
    </div>
  );
}
