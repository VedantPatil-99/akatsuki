"use client";

import { ReactNode } from "react";

import { Tldraw, TLUiComponents } from "tldraw";
import "tldraw/tldraw.css";

interface TldrawWrapperProps {
  children?: ReactNode;
  components?: Partial<TLUiComponents>;
  persistenceKey?: string;
  initialState?: "draw" | "select" | "idle";
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_COMPONENTS: Partial<TLUiComponents> = {
  Toolbar: null,
  StylePanel: null,
  ZoomMenu: null,
  Minimap: null,
};

export function TldrawWrapper({
  children,
  components = {},
  persistenceKey = "akatsuki-local-dev",
  initialState = "draw",
  className,
  style,
}: TldrawWrapperProps) {
  const mergedComponents = { ...DEFAULT_COMPONENTS, ...components };

  return (
    <div className={className} style={style}>
      <Tldraw
        persistenceKey={persistenceKey}
        initialState={initialState}
        components={mergedComponents}
      >
        {children}
      </Tldraw>
    </div>
  );
}
