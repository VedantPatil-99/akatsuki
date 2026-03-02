"use client";

import { useState, useTransition } from "react";

import { SpinnerGapIcon } from "@phosphor-icons/react";

import { resetPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const ForgotPasswordDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await resetPassword(formData);

      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else if (result?.success) {
        setMessage({ type: "success", text: result.success });
      }
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setMessage(null);
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground text-sm underline-offset-4 hover:underline"
        >
          Forgot your password?
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your account email address and we will send you a secure link
            to reset your password.
          </DialogDescription>
        </DialogHeader>

        {message?.type === "success" ? (
          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-center text-sm text-green-600">
            {message.text}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                type="email"
                id="reset-email"
                name="email"
                placeholder="teacher@school.edu"
                required
                disabled={isPending}
              />
            </div>

            {message?.type === "error" && (
              <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
                {message.text}
              </div>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <SpinnerGapIcon className="size-4 animate-spin" />
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
