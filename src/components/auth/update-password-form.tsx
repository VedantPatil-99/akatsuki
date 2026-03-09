"use client";

import { useState, useTransition } from "react";

import { SpinnerGapIcon } from "@phosphor-icons/react";

import { updateExistingPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { PasswordInput } from "./password-input";

export const UpdatePasswordForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateExistingPassword(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <Card className="w-full max-w-md border-zinc-100 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
        <CardDescription>
          Please enter your new password below. You will be logged in
          automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <PasswordInput id="new-password" mode="signup" disabled={isPending} />

          {error && (
            <div className="bg-destructive/15 text-destructive border-destructive/20 rounded-md border p-3 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full gap-2 bg-zinc-900 text-white hover:bg-zinc-800"
          >
            {isPending && <SpinnerGapIcon className="size-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
