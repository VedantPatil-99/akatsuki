import { GoogleLogoIcon } from "@phosphor-icons/react";

import { signInWithGoogle } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

import { AuthMode } from "./types";

interface AuthFooterProps {
  mode: AuthMode;
  isPending: boolean;
  onToggleMode: () => void;
}

export const AuthFooter = ({
  mode,
  isPending,
  onToggleMode,
}: AuthFooterProps) => {
  return (
    <CardFooter className="flex-col gap-4">
      <div className="text-center text-sm">
        <button
          type="button"
          onClick={onToggleMode}
          disabled={isPending}
          className="text-muted-foreground underline-offset-4 hover:underline"
        >
          {mode === "login"
            ? "Don't have an account? Sign up"
            : "Already have an account? Log in"}
        </button>
      </div>

      <div className="relative flex w-full items-center justify-center text-sm">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <span className="bg-card text-muted-foreground relative px-2">or</span>
      </div>

      <form action={signInWithGoogle} className="w-full">
        <Button
          variant="outline"
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2"
        >
          <GoogleLogoIcon weight="bold" size={20} />
          Continue with Google
        </Button>
      </form>
    </CardFooter>
  );
};
