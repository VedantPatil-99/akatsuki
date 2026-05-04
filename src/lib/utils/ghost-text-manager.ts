import { createShapeId, type Editor, type TLShapeId, toRichText } from "tldraw";

export class GhostTextManager {
  private editor: Editor;
  private ghostShapeIds: Set<TLShapeId> = new Set();

  private acceptListener: (e: Event) => void;
  private rejectListener: (e: Event) => void;
  private keyboardListener: (e: KeyboardEvent) => void; // <-- New property for keyboard events

  constructor(editor: Editor) {
    this.editor = editor;

    // 1. Listen for clicks on our Custom Shape buttons
    this.acceptListener = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.shapeId) {
        this.acceptPrediction(detail.shapeId);
      }
    };

    this.rejectListener = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.shapeId) {
        this.rejectPrediction(detail.shapeId);
      }
    };

    // 2. Listen for Keyboard Shortcuts (Tab & Escape)
    this.keyboardListener = (e: KeyboardEvent) => {
      // If there are no AI suggestions active, let the browser/Tldraw handle the keys normally
      if (this.ghostShapeIds.size === 0) return;

      if (e.key === "Tab") {
        e.preventDefault(); // Stop browser focus shifting
        e.stopPropagation(); // Stop Tldraw from intercepting
        const activeShapeId = Array.from(this.ghostShapeIds)[0];
        if (activeShapeId) this.acceptPrediction(activeShapeId);
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        const activeShapeId = Array.from(this.ghostShapeIds)[0];
        if (activeShapeId) this.rejectPrediction(activeShapeId);
      }
    };

    // Attach listeners
    window.addEventListener("ai-prediction-accept", this.acceptListener);
    window.addEventListener("ai-prediction-reject", this.rejectListener);
    // Use capture phase to catch keys before the canvas engine does
    window.addEventListener("keydown", this.keyboardListener, {
      capture: true,
    });
  }

  destroy() {
    window.removeEventListener("ai-prediction-accept", this.acceptListener);
    window.removeEventListener("ai-prediction-reject", this.rejectListener);
    window.removeEventListener("keydown", this.keyboardListener, {
      capture: true,
    });
  }

  createGhostText(text: string, position: { x: number; y: number }) {
    this.clearAllGhosts();
    const shapeId = createShapeId();

    // Caps at 800px for reading comfort, or shrinks to fit mobile screens with 40px padding
    const dynamicWidth = Math.min(800, window.innerWidth - 40);

    this.editor.createShape({
      id: shapeId,
      // @ts-expect-error - We intentionally bypass the default TLShape union to inject our custom shape
      type: "ai-ghost",
      x: position.x,
      y: position.y,
      props: {
        text: text,
        w: dynamicWidth, // <-- Inject the calculated width into the shape!
      },
    });

    this.ghostShapeIds.add(shapeId);
    return shapeId;
  }

  acceptPrediction(shapeId: TLShapeId, explicitText?: string) {
    const shape = this.editor.getShape(shapeId);

    if (!shape || (shape.type as string) !== "ai-ghost") return;

    // Add 'w' to the destructured props
    const { x, y, props } = shape as unknown as {
      x: number;
      y: number;
      props: { text: string; w: number }; // <-- Read the dynamic width
    };

    const acceptedText = explicitText || props.text;

    this.editor.deleteShape(shapeId);
    this.ghostShapeIds.delete(shapeId);

    this.editor.createShape({
      type: "text",
      x: x,
      y: y,
      props: {
        richText: toRichText(acceptedText),
        color: "black",
        size: "m",
        font: "draw",
        w: props.w,
        autoSize: false,
      },
    });
  }

  rejectPrediction(shapeId: TLShapeId) {
    this.editor.deleteShape(shapeId);
    this.ghostShapeIds.delete(shapeId);
  }

  clearAllGhosts() {
    if (this.ghostShapeIds.size > 0) {
      this.editor.deleteShapes(Array.from(this.ghostShapeIds));
      this.ghostShapeIds.clear();
    }
  }

  cleanupGhostsOnNewInput() {
    const allShapes = this.editor.getCurrentPageShapes();

    const ghostShapes = allShapes.filter(
      (shape) => (shape.type as string) === "ai-ghost"
    );

    if (ghostShapes.length > 0) {
      const ghostIds = ghostShapes.map((shape) => shape.id);
      this.editor.deleteShapes(ghostIds);
      ghostIds.forEach((id) => this.ghostShapeIds.delete(id));
    }
  }

  getGhostShapeIds(): TLShapeId[] {
    return Array.from(this.ghostShapeIds);
  }
}
