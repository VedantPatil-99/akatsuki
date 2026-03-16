"use client";

import {
  ArrowsOutCardinalIcon,
  CaretUpIcon,
  DotsThreeOutlineIcon,
  EraserIcon,
  PenIcon,
  SelectionPlusIcon,
  ShapesIcon,
  TextTIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { DefaultStylePanel } from "tldraw";

import { DropdownPanel } from "./dropdown-panel";
import { MorePanel } from "./more-panel";
import { ShapesPanel } from "./shapes-panel";
import { ToolbarButton } from "./toolbar-button";
import { useToolbar } from "./use-toolbar";

const SIMPLE_TOOLS = [
  { id: "eraser", label: "Eraser", icon: <EraserIcon size={20} /> },
  { id: "select", label: "Select", icon: <SelectionPlusIcon size={20} /> },
  { id: "hand", label: "Move", icon: <ArrowsOutCardinalIcon size={20} /> },
];

export function Toolbar() {
  const {
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
  } = useToolbar();

  return (
    <>
      {/* TOGGLE BUTTON */}
      <button
        onPointerEnter={resetTimer}
        onClick={() => {
          setShowToolbar(!showToolbar);
          resetTimer();
        }}
        className={`fixed left-1/2 z-50 -translate-x-1/2 transition-all duration-500 ease-out ${showToolbar ? "bottom-16 sm:bottom-20" : "bottom-2 sm:bottom-3"} ${isIdle && showToolbar ? "pointer-events-none opacity-0" : "opacity-100"} border-border bg-background/80 text-foreground hover:bg-accent hover:text-accent-foreground flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border shadow-sm backdrop-blur-md`}
      >
        <div
          className={`transition-transform duration-300 ${showToolbar ? "rotate-180" : ""}`}
        >
          <CaretUpIcon size={15} weight="bold" />
        </div>
      </button>

      {/* TOOLBAR */}
      <motion.div
        layout
        id="toolbar"
        onPointerEnter={resetTimer}
        onPointerMove={resetTimer}
        className={`fixed left-1/2 -translate-x-1/2 transition-all duration-500 ease-out ${showToolbar ? "bottom-3 opacity-100 sm:bottom-4" : "pointer-events-none -bottom-24 opacity-0"} border-border bg-background/80 flex w-max max-w-[calc(100vw-1rem)] gap-1 rounded-xl border p-1 shadow-lg backdrop-blur-lg sm:gap-2 sm:p-2`}
      >
        {/* PEN */}
        <div className="relative">
          <ToolbarButton
            label="Pen"
            icon={<PenIcon size={20} />}
            isActive={activeTool === "draw"}
            isExpanded={activeTool === "draw" && !activePanel}
            onClick={() => togglePanel("pen", "draw")}
          />
          <AnimatePresence>
            {activePanel === "pen" && (
              <DropdownPanel align="start">
                <DefaultStylePanel />
              </DropdownPanel>
            )}
          </AnimatePresence>
        </div>

        {/* MAPPED SIMPLE TOOLS (Eraser, Select, Move) */}
        {SIMPLE_TOOLS.map((t) => (
          <ToolbarButton
            key={t.id}
            label={t.label}
            icon={t.icon}
            // Removed isTldrawIcon since we mapped Phosphor Icons directly
            isActive={activeTool === t.id}
            isExpanded={activeTool === t.id && !activePanel}
            onClick={() => setTool(t.id)}
          />
        ))}

        {/* SHAPES */}
        <div className="relative">
          <ToolbarButton
            label="Shapes"
            icon={<ShapesIcon size={20} />}
            isActive={isShapeTool || activePanel === "shapes"}
            isExpanded={
              (isShapeTool || activePanel === "shapes") &&
              (!activePanel || activePanel === "shapes")
            }
            onClick={() => togglePanel("shapes")}
          />
          <AnimatePresence>
            {activePanel === "shapes" && (
              <ShapesPanel
                editor={editor}
                activeTool={activeTool}
                closePanel={() => setActivePanel(null)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* TEXT */}
        <div className="relative">
          <ToolbarButton
            label="Text"
            icon={<TextTIcon size={20} />}
            // Removed isTldrawIcon
            isActive={activeTool === "text"}
            isExpanded={activeTool === "text" && !activePanel}
            onClick={() => togglePanel("text", "text")}
          />
          <AnimatePresence>
            {activePanel === "text" && activeTool === "text" && (
              <DropdownPanel>
                <DefaultStylePanel />
              </DropdownPanel>
            )}
          </AnimatePresence>
        </div>

        {/* MORE */}
        <div className="relative">
          <ToolbarButton
            label="More"
            icon={<DotsThreeOutlineIcon size={20} />}
            // Removed isTldrawIcon
            isActive={isMoreTool || activePanel === "more"}
            isExpanded={
              (isMoreTool || activePanel === "more") &&
              (!activePanel || activePanel === "more")
            }
            onClick={() => togglePanel("more")}
          />
          <AnimatePresence>
            {activePanel === "more" && (
              <MorePanel
                editor={editor}
                activeTool={activeTool}
                closePanel={() => setActivePanel(null)}
                align="end"
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

export default Toolbar;
