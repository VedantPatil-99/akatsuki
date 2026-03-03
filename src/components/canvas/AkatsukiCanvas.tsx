"use client";

import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

import Toolbar from "./ui/Toolbar";

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
          ZoomMenu: null,
          Minimap: null,
          StylePanel: null,
        }}
      >
        <CanvasUI />
      </Tldraw>
    </div>
  );
}
