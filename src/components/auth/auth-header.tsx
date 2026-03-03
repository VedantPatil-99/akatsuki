import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { AuthMode } from "./types";

interface AuthHeaderProps {
  mode: AuthMode;
  isAnonymous: boolean;
}

export const AuthHeader = ({ mode, isAnonymous }: AuthHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="font-mono text-xl">
        {mode === "login"
          ? "Welcome Back!"
          : isAnonymous
            ? "Save Your Work"
            : "Create an Account"}
      </CardTitle>
      <CardDescription>
        {mode === "login"
          ? "Sign in to access your saved context."
          : isAnonymous
            ? "Create an account to save your current canvas across devices."
            : "Sign up to start your smart whiteboard sessions."}
      </CardDescription>
    </CardHeader>
  );
};
