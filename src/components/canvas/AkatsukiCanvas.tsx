// components/canvas/AkatsukiCanvas.tsx
"use client";

import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

export default function AkatsukiCanvas() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        persistenceKey="akatsuki-local-dev"
        inferDarkMode
        initialState="draw"
        components={{ ZoomMenu: null, Minimap: null }}
      />
    </div>
  );
}
