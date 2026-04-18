"use client";

import "tldraw/tldraw.css";

import { KnowledgePanel } from "@/components/canvas/ui/knowledge-panel/knowledge-panel";

import { CanvasEvents } from "./canvas-events";
import { TldrawThemeSync } from "./theme-sync";
import { TldrawWrapper } from "./tldraw-wrapper";
import { TopRightControls } from "./top-right-controls";
import { Toolbar } from "./ui/toolbar";

interface AkatsukiCanvasProps {
  userId: string;
  isAnonymous: boolean;
  email?: string;
  avatarUrl?: string;
}

function CanvasUI({
  isAnonymous,
  email,
  avatarUrl,
}: Omit<AkatsukiCanvasProps, "userId">) {
  return (
    <>
      <Toolbar />
      <TopRightControls
        isAnonymous={isAnonymous}
        email={email}
        avatarUrl={avatarUrl}
      />
    </>
  );
}

export default function AkatsukiCanvas({
  userId,
  isAnonymous,
  email,
  avatarUrl,
}: AkatsukiCanvasProps) {
  const handleError = (error: Error) => {
    console.error("Handwriting capture failed:", error);
  };

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <TldrawWrapper style={{ position: "absolute", inset: 0 }}>
        <TldrawThemeSync />
        <CanvasEvents
          userId={userId}
          onError={handleError}
          previewInNewWindow={true}
        />
        <CanvasUI
          isAnonymous={isAnonymous}
          email={email}
          avatarUrl={avatarUrl}
        />
      </TldrawWrapper>
      <KnowledgePanel userId={userId} />
    </div>
  );
}
