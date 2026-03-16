"use client";

import { DefaultStylePanel, Tldraw } from "tldraw";
import "tldraw/tldraw.css";

import { TldrawThemeSync } from "./theme-sync";

export default function AkatsukiCanvas() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        persistenceKey="akatsuki-local-dev"
        inferDarkMode
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
    </div>
  );
}
