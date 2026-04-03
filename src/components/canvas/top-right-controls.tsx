"use client";

import { CanvasAuthButton } from "@/components/auth/canvas-auth-button";

import { AIToggle } from "./ai-toggle";
import { ThemeToggle } from "./theme-toggle";

interface TopRightControlsProps {
  isAnonymous: boolean;
  email?: string;
  avatarUrl?: string;
}

export function TopRightControls({
  isAnonymous,
  email,
  avatarUrl,
}: TopRightControlsProps) {
  return (
    // pointer-events-none ensures users can click the canvas behind the gaps
    // Responsive: Smaller gaps and closer to the edge on mobile
    <div className="pointer-events-none fixed top-3 right-3 z-50 flex items-center gap-1.5 sm:top-4 sm:right-4 sm:gap-2">
      <CanvasAuthButton
        isAnonymous={isAnonymous}
        email={email}
        avatarUrl={avatarUrl}
      />
      <AIToggle />
      <ThemeToggle />
    </div>
  );
}
