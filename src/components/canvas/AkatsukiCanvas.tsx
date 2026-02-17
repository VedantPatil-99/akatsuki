// components/canvas/AkatsukiCanvas.tsx
"use client";

import { useCallback } from "react";

import { Editor, Tldraw } from "tldraw";
import "tldraw/tldraw.css";

export default function AkatsukiCanvas() {
  const handleMount = useCallback((editor: Editor) => {
    console.log("Canvas Mounted! Editor ID:", editor.store.id);
  });
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        persistenceKey="akatsuki-local-dev"
        onMount={handleMount}
        inferDarkMode
        initialState="draw"
        components={{ ZoomMenu: null, Minimap: null }}
      />
    </div>
  );
}
