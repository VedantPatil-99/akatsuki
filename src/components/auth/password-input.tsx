"use client";

import { useMemo, useState } from "react";

import {
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  XIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { ForgotPasswordDialog } from "./forget-password-dialog";
import { AuthMode } from "./types";

interface PasswordInputProps {
  id: string;
  mode: AuthMode;
  disabled?: boolean;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const requirements = [
  { regex: /.{6,}/, text: "At least 6 characters" },
  { regex: /[a-z]/, text: "At least 1 lowercase letter" },
  { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
  { regex: /[0-9]/, text: "At least 1 number" },
  {
    regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/,
    text: "At least 1 special character",
  },
];

export const PasswordInput = ({
  id,
  mode,
  disabled,
  error,
  onChange,
}: PasswordInputProps) => {
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const strength = requirements.map((req) => ({
    met: req.regex.test(password),
    text: req.text,
  }));

  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  const getColor = (score: number) => {
    if (score === 0) return "bg-border";
    if (score <= 1) return "bg-destructive";
    if (score <= 2) return "bg-orange-500";
    if (score <= 3) return "bg-amber-500";
    if (score === 4) return "bg-yellow-400";
    return "bg-green-500";
  };

  const getText = (score: number) => {
    if (score === 0) return "Enter a password";
    if (score <= 2) return "Weak password";
    if (score <= 3) return "Medium password";
    if (score === 4) return "Strong password";
    return "Very strong password";
  };

  return (
    <div className="-my-1 grid gap-2">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className={cn(
            "transition-colors duration-300",
            error && "text-destructive"
          )}
        >
          Password<span className="text-destructive -ml-1">*</span>
        </Label>
        {mode === "login" && <ForgotPasswordDialog />}
      </div>

      <div className="relative">
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
          <KeyIcon className="size-4" weight="bold" />
        </div>
        <Input
          id={id}
          name="password"
          type={isVisible ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value); // for strength meter
            onChange?.(e); // error-clearing logic
          }}
          required
          minLength={6}
          disabled={disabled}
          aria-invalid={!!error}
          className={cn(
            "peer hover:border-primary/50 pr-9 pl-9 transition-[border-color] duration-300",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleVisibility}
          disabled={disabled}
          className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 cursor-pointer rounded-l-none hover:bg-transparent"
        >
          {isVisible ? (
            <EyeSlashIcon className="size-4" weight="bold" />
          ) : (
            <EyeIcon className="size-4" weight="bold" />
          )}
          <span className="sr-only">
            {isVisible ? "Hide password" : "Show password"}
          </span>
        </Button>
      </div>

      <div
        className={cn(
          "min-h-0.5 transition-all duration-500 ease-in-out",
          error && "min-h-5 py-0.5"
        )}
      >
        <p
          className={cn(
            "text-destructive text-xs transition-opacity duration-700",
            error ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          {error}
        </p>
      </div>

      {mode === "signup" && (
        <div className="mt-3 space-y-2">
          <div className="flex h-1 w-full gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-full flex-1 rounded-full transition-all duration-500 ease-out",
                  index < strengthScore ? getColor(strengthScore) : "bg-border"
                )}
              />
            ))}
          </div>
          <p className="text-foreground text-sm font-medium">
            {getText(strengthScore)}. Must contain:
          </p>
          <ul className="space-y-1.5">
            {strength.map((req, index) => (
              <li key={index} className="flex items-center gap-2">
                {req.met ? (
                  <CheckIcon className="size-4 text-green-600 dark:text-green-400" />
                ) : (
                  <XIcon className="text-muted-foreground size-4 font-bold" />
                )}
                <span
                  className={cn(
                    "text-xs",
                    req.met
                      ? "text-green-600 dark:text-green-400"
                      : "text-muted-foreground"
                  )}
                >
                  {req.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
