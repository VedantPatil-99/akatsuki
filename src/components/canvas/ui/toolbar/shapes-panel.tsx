import type { ReactNode } from "react";

import {
  ArrowUpRightIcon,
  CircleIcon,
  CloudIcon,
  DiamondIcon,
  HeartIcon,
  HexagonIcon,
  LineSegmentIcon,
  RectangleIcon,
  StarIcon,
  TriangleIcon,
} from "@phosphor-icons/react";
import { GeoShapeGeoStyle, TldrawUiButtonIcon, type TLGeoShape } from "tldraw";

import { cn } from "@/lib/utils";

import { DropdownPanel } from "./dropdown-panel";
import type { BasePanelProps } from "./types";

const SHAPES: Array<{
  id: TLGeoShape["props"]["geo"];
  icon: ReactNode | string;
}> = [
  { id: "rectangle", icon: <RectangleIcon size={20} /> },
  { id: "ellipse", icon: <CircleIcon size={20} /> },
  { id: "triangle", icon: <TriangleIcon size={20} /> },
  { id: "diamond", icon: <DiamondIcon size={20} /> },
  { id: "hexagon", icon: <HexagonIcon size={20} /> },
  { id: "oval", icon: "geo-oval" },
  { id: "rhombus", icon: "geo-rhombus" },
  { id: "star", icon: <StarIcon size={20} /> },
  { id: "cloud", icon: <CloudIcon size={20} /> },
  { id: "heart", icon: <HeartIcon size={20} /> },
];

export const ShapesPanel = ({
  editor,
  activeTool,
  closePanel,
}: BasePanelProps) => {
  const setShape = (shape: TLGeoShape["props"]["geo"]) => {
    editor.setCurrentTool("geo");
    editor.setStyleForNextShapes(GeoShapeGeoStyle, shape);
    editor.updateInstanceState({ isToolLocked: true });
    closePanel();
  };

  const btnClasses = (isActive: boolean) =>
    `flex h-10 w-10 items-center justify-center rounded-lg text-white transition-all duration-200 ease-out active:scale-90 ${
      isActive
        ? "bg-blue-600 ring-2 ring-blue-400 shadow-blue-500/20"
        : "bg-black/70 backdrop-blur-md hover:bg-blue-400"
    }`;

  return (
    <DropdownPanel className="grid w-56 grid-cols-4 place-items-center justify-center gap-2 p-2">
      {SHAPES.map((shape) => (
        <button
          key={shape.id}
          className={cn(btnClasses(activeTool === shape.id), "cursor-pointer")}
          onClick={() => setShape(shape.id)}
        >
          {typeof shape.icon === "string" ? (
            <TldrawUiButtonIcon icon={shape.icon} />
          ) : (
            shape.icon
          )}
        </button>
      ))}
      <button
        className={btnClasses(activeTool === "arrow")}
        onClick={() => {
          editor.setCurrentTool("arrow");
          closePanel();
        }}
      >
        <ArrowUpRightIcon size={20} />
      </button>
      <button
        className={btnClasses(activeTool === "line")}
        onClick={() => {
          editor.setCurrentTool("line");
          closePanel();
        }}
      >
        <LineSegmentIcon size={20} />
      </button>
    </DropdownPanel>
  );
};
