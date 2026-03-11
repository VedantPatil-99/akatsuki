"use client";

import { DefaultStylePanel, Tldraw } from "tldraw";
import "tldraw/tldraw.css";

import { KnowledgePanel } from "@/components/canvas/ui/knowledge-panel/knowledge-panel";

import { TldrawThemeSync } from "./theme-sync";

interface AkatsukiCanvasProps {
  userId: string;
}

export default function AkatsukiCanvas({ userId }: AkatsukiCanvasProps) {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        persistenceKey="akatsuki-local-dev"
        initialState="draw"
        components={{
          ZoomMenu: null,
          Minimap: null,
          StylePanel: (props) => (
            <div className="absolute right-4 bottom-4 z-50">
              <DefaultStylePanel {...props} />
            </div>
          ),
        }}
      >
        <TldrawThemeSync />
      </Tldraw>
      <KnowledgePanel userId={userId} />
    </div>
  );
}
