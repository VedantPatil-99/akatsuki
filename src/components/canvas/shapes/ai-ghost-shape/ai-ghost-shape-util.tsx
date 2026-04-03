"use client";

import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { HTMLContainer, Rectangle2d, ShapeUtil } from "tldraw";

// <-- Swapped BaseBoxShapeUtil for ShapeUtil and Rectangle2d

import { cn } from "@/lib/utils";

import { AIGhostShape, aiGhostShapeProps } from "./types";

// @ts-expect-error - Tldraw's ShapeUtil constraint strictly expects built-in shapes in this version.
export class AIGhostShapeUtil extends ShapeUtil<AIGhostShape> {
  static override type = "ai-ghost" as const;
  static override props = aiGhostShapeProps;

  override getDefaultProps(): AIGhostShape["props"] {
    return {
      w: 10,
      h: 10,
      text: "",
    };
  }

  override getGeometry(shape: AIGhostShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  // Hide the default selection border so it looks like pure UI
  override hideSelectionBoundsBg = () => true;
  override hideSelectionBoundsFg = () => true;
  override component(shape: AIGhostShape) {
    const handleAccept = (e: React.PointerEvent) => {
      e.stopPropagation();
      window.dispatchEvent(
        new CustomEvent("ai-prediction-accept", {
          detail: { shapeId: shape.id },
        })
      );
    };

    const handleReject = (e: React.PointerEvent) => {
      e.stopPropagation();
      window.dispatchEvent(
        new CustomEvent("ai-prediction-reject", {
          detail: { shapeId: shape.id },
        })
      );
    };

    return (
      <HTMLContainer
        id={shape.id}
        style={{ overflow: "visible", pointerEvents: "none" }}
      >
        <div className="relative flex items-center gap-2">
          <div
            className={cn(
              "text-muted-foreground rounded-md border border-dashed px-2 py-1 text-xl font-medium whitespace-nowrap backdrop-blur-sm transition-all",
              "border-indigo-500/50 bg-indigo-500/5 dark:border-indigo-400/50 dark:bg-indigo-500/10"
            )}
          >
            {shape.props.text}
          </div>

          <div className="pointer-events-auto flex gap-1">
            <button
              onPointerDown={handleAccept}
              aria-label="Accept AI Suggestion"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-green-500/10 text-green-600 transition-colors hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30"
            >
              <CheckIcon weight="bold" className="size-4" />
            </button>
            <button
              onPointerDown={handleReject}
              aria-label="Reject AI Suggestion"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-red-500/10 text-red-600 transition-colors hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30"
            >
              <XIcon weight="bold" className="size-4" />
            </button>
          </div>
        </div>
      </HTMLContainer>
    );
  }

  override indicator(shape: AIGhostShape) {
    return <rect width={shape.props.w} height={shape.props.h} fill="none" />;
  }
}
