import { useCallback, useEffect, useRef, useState } from "react";

import { useEditor, useValue } from "tldraw";

import type { ActivePanel } from "./types";

export function useToolbar() {
  const editor = useEditor();
  const activeTool = useValue("active tool", () => editor.getCurrentToolId(), [
    editor,
  ]);

  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [showToolbar, setShowToolbar] = useState(true);
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsIdle(true), 3000);
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(() => setIsIdle(true), 3000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const toolbar = document.getElementById("toolbar");
      if (toolbar && toolbar.contains(e.target as Node)) return;
      setActivePanel(null);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const togglePanel = (panel: ActivePanel, tool?: string) => {
    if (tool) editor.setCurrentTool(tool);
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const setTool = (tool: string) => {
    editor.setCurrentTool(tool);
    setActivePanel(null);
  };

  const isShapeTool = ["geo", "arrow", "line"].includes(activeTool);
  const isMoreTool = ["laser", "highlight", "frame"].includes(activeTool);

  return {
    editor,
    activeTool,
    activePanel,
    setActivePanel,
    showToolbar,
    setShowToolbar,
    isIdle,
    resetTimer,
    togglePanel,
    setTool,
    isShapeTool,
    isMoreTool,
  };
}
