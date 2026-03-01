"use client";

import { useState, useTransition } from "react";

import {
  CheckCircleIcon,
  EnvelopeSimpleIcon,
  GoogleLogoIcon,
  KeyIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";

import { signInWithGoogle, upgradeToPermanent } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function AuthForm({ isAnonymous }: { isAnonymous: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await upgradeToPermanent(formData);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else if (result?.success) {
        setMessage({ type: "success", text: result.success });
      }
    });
  };

  if (message?.type === "success") {
    return (
      <div className="flex w-full max-w-md flex-col items-center justify-center rounded-2xl border border-zinc-100 bg-white p-8 text-center shadow-xl">
        <CheckCircleIcon size={64} className="mb-4 text-green-500" />
        <h2 className="mb-2 text-2xl font-bold text-zinc-900">
          Check your email
        </h2>
        <p className="text-zinc-600">
          We sent a verification link. Click it to secure your account and save
          your whiteboard context permanently.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-100 bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-zinc-900">
          {isAnonymous ? "Save Your Work" : "Welcome Back"}
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          {isAnonymous
            ? "Create an account to save your current canvas and PDFs across devices."
            : "Sign in to access your context."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700">Email</label>
          <div className="relative">
            <EnvelopeSimpleIcon
              className="absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400"
              size={20}
            />
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-zinc-200 py-2 pr-4 pl-10 transition-all focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              placeholder="teacher@school.edu"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700">Password</label>
          <div className="relative">
            <KeyIcon
              className="absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400"
              size={20}
            />
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-lg border border-zinc-200 py-2 pr-4 pl-10 transition-all focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
        </div>

        {message?.type === "error" && (
          <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            {message.text}
          </p>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center rounded-lg bg-zinc-900 py-2 text-white hover:bg-zinc-800"
        >
          {isPending ? (
            <SpinnerGapIcon className="animate-spin" size={20} />
          ) : (
            "Save Account"
          )}
        </Button>
      </form>

      <div className="mt-6 flex items-center before:flex-1 before:border-t before:border-zinc-200 after:flex-1 after:border-t after:border-zinc-200">
        <span className="px-4 text-sm text-zinc-400">or</span>
      </div>

      <form action={signInWithGoogle} className="mt-6">
        <Button
          variant="outline"
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg border-zinc-200 py-2 text-zinc-800 hover:bg-zinc-50"
        >
          <GoogleLogoIcon size={20} />
          Continue with Google
        </Button>
      </form>
    </div>
  );
}
