"use client";

import { CanvasAuthButton } from "@/components/auth/canvas-auth-button";

import { AIToggle } from "./ai-toggle";
import { ThemeToggle } from "./theme-toggle";
import { QuickShareButton } from "./ui/QuickShareWebRTC/QuickShareButton";

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
    <div className="pointer-events-none fixed top-3 right-3 z-50 flex items-center gap-2 sm:top-4 sm:right-4">
      <div className="pointer-events-auto flex items-center gap-2">
        <QuickShareButton />
        <CanvasAuthButton
          isAnonymous={isAnonymous}
          email={email}
          avatarUrl={avatarUrl}
        />
        <AIToggle />
        <ThemeToggle />
      </div>
    </div>
  );
}
