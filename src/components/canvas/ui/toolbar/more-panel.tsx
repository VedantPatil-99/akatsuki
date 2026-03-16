import {
  FrameCornersIcon,
  HighlighterIcon,
  PenNibIcon,
} from "@phosphor-icons/react";

import { DropdownPanel } from "./dropdown-panel";
import { ToolbarButton } from "./toolbar-button";
import type { BasePanelProps } from "./types";

const MORE_TOOLS = [
  { id: "laser", icon: <PenNibIcon size={20} />, label: "Laser" },
  { id: "highlight", icon: <HighlighterIcon size={20} />, label: "Highlight" },
  { id: "frame", icon: <FrameCornersIcon size={20} />, label: "Frame" },
];

export const MorePanel = ({
  editor,
  activeTool,
  closePanel,
  align = "center",
}: BasePanelProps) => {
  return (
    <DropdownPanel align={align} className="flex w-auto flex-col gap-2 p-2">
      {MORE_TOOLS.map((tool) => (
        <ToolbarButton
          key={tool.id}
          label={tool.label}
          icon={tool.icon}
          isActive={activeTool === tool.id}
          isExpanded={activeTool === tool.id}
          onClick={() => {
            editor.setCurrentTool(tool.id);
            closePanel();
          }}
          className="w-full justify-start"
        />
      ))}
    </DropdownPanel>
  );
};
