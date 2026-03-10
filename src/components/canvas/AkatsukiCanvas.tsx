"use client";

import { DefaultStylePanel, Tldraw } from "tldraw";
import "tldraw/tldraw.css";

import { TldrawThemeSync } from "./theme-sync";
import { KnowledgePanel } from "./ui/KnowledgePanel";

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
      <div className="z-100] pointer-events-none absolute top-20 left-4">
        <KnowledgePanel userId={userId} />
      </div>
    </div>
  );
}
