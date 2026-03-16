"use client";

import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

import { TldrawThemeSync } from "./theme-sync";
import { Toolbar } from "./ui/toolbar";

function CanvasUI() {
  return <Toolbar />;
}
export default function AkatsukiCanvas() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        persistenceKey="akatsuki-local-dev"
        inferDarkMode
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
    </div>
  );
}
