"use client";

import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

import { KnowledgePanel } from "@/components/canvas/ui/knowledge-panel/knowledge-panel";

import { TldrawThemeSync } from "./theme-sync";
import { Toolbar } from "./ui/toolbar";

interface AkatsukiCanvasProps {
  userId: string;
}

function CanvasUI() {
  return <Toolbar />;
}

export default function AkatsukiCanvas({ userId }: AkatsukiCanvasProps) {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        persistenceKey="akatsuki-local-dev"
        initialState="draw"
        components={{
          Toolbar: null,
          StylePanel: null,
          ZoomMenu: null,
          Minimap: null,
        }}
      >
        <TldrawThemeSync />
        <CanvasUI />
      </Tldraw>
      <KnowledgePanel userId={userId} />
    </div>
  );
}
