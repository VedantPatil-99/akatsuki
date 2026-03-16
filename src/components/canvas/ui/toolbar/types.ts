import type { Editor } from "tldraw";

export type ActivePanel = "pen" | "shapes" | "text" | "more" | null;

export interface BasePanelProps {
  editor: Editor;
  activeTool: string;
  closePanel: () => void;
}
