"use client";

import { useState, useTransition } from "react";

import { useSearchParams } from "next/navigation";

import { SpinnerGapIcon } from "@phosphor-icons/react";

import {
  signInWithEmail,
  signUpWithEmail,
  upgradeToPermanent,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { AuthFooter } from "./auth-footer";
import { AuthHeader } from "./auth-header";
import { AuthSuccess } from "./auth-success";
import { EmailInput } from "./email-input";
import { PasswordInput } from "./password-input";
import { AuthMessage, AuthMode } from "./types";

interface AuthFormProps {
  isAnonymous: boolean;
}

export const AuthForm = ({ isAnonymous }: AuthFormProps) => {
  const searchParams = useSearchParams();
  const urlMessage = searchParams.get("message");

  const [mode, setMode] = useState<AuthMode>(isAnonymous ? "signup" : "login");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<AuthMessage | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      let result: { error?: string; success?: string } | undefined;

      if (mode === "login") {
        result = await signInWithEmail(formData);
      } else if (isAnonymous) {
        result = await upgradeToPermanent(formData);
      } else {
        result = await signUpWithEmail(formData);
      }

      if (result?.error) setMessage({ type: "error", text: result.error });
      else if (result?.success)
        setMessage({ type: "success", text: result.success });
    });
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
    setMessage(null);
  };

  if (message?.type === "success") {
    return <AuthSuccess text={message.text} />;
  }

  return (
    <Card className="w-full max-w-md">
      {urlMessage && (
        <div className="bg-muted text-muted-foreground m-6 mb-0 rounded-md p-3 text-center text-sm">
          {urlMessage}
        </div>
      )}

      <AuthHeader mode={mode} isAnonymous={isAnonymous} />

      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <EmailInput id="email" disabled={isPending} />
            <PasswordInput id="password" mode={mode} disabled={isPending} />

            {message?.type === "error" && (
              <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
                {message.text}
              </div>
            )}

            <Button type="submit" disabled={isPending} className="w-full gap-2">
              {isPending && <SpinnerGapIcon className="size-4 animate-spin" />}
              {mode === "login"
                ? "Sign In"
                : isAnonymous
                  ? "Save Account"
                  : "Sign Up"}
            </Button>
          </div>
        </form>
      </CardContent>

      <AuthFooter mode={mode} isPending={isPending} onToggleMode={toggleMode} />
    </Card>
  );
};
