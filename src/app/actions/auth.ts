"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function upgradeToPermanent(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();

  // link the email/password to the CURRENT anonymous session
  const { error } = await supabase.auth.updateUser({
    email,
    password,
  });

  if (error) return { error: error.message };

  return {
    success:
      "Verification email sent. Please check your inbox to complete the upgrade!",
  };
}

export async function signInWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };

  redirect("/board");
}

export async function signUpWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  return {
    success:
      "Verification email sent. Please check your inbox to complete registration!",
  };
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // 1. Get the current user to see if they are a guest
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let authResponse;

  if (user && user.is_anonymous) {
    // 2. If they ARE an anonymous guest, explicitly LINK the Google account to this row
    authResponse = await supabase.auth.linkIdentity({
      provider: "google",
      options: {
        redirectTo: `${origin}/api/auth/callback`,
      },
    });
  } else {
    // 3. If they are completely logged out, do a normal Google sign in
    authResponse = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/api/auth/callback`,
      },
    });
  }

  if (authResponse.error) throw new Error(authResponse.error.message);

  // 4. Redirect to Google's consent screen
  if (authResponse.data.url) redirect(authResponse.data.url);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function discardGuestAndLogin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
