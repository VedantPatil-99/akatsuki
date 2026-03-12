import { type Editor, type TLShapeId, toRichText } from "tldraw";

export class GhostTextManager {
  private editor: Editor;
  private ghostShapeIds: TLShapeId[] = [];

  constructor(editor: Editor) {
    this.editor = editor;
  }

  createGhostText(text: string, position: { x: number; y: number }) {
    // Create ghost text at position
    const ghostShape = this.editor.createShape({
      type: "text",
      x: position.x,
      y: position.y,
      props: {
        richText: toRichText(text),
      },
      meta: {
        isGhost: true, // Mark as ghost
      },
    });

    const shapeId = ghostShape.id as TLShapeId;
    this.ghostShapeIds.push(shapeId);
    return shapeId;
  }

  clearAllGhosts() {
    if (this.ghostShapeIds.length > 0) {
      this.editor.deleteShapes(this.ghostShapeIds);
      this.ghostShapeIds = [];
    }
  }

  cleanupGhostsOnNewInput() {
    // Remove ghost shapes on new input
    const allShapes = this.editor.getCurrentPageShapes();
    const ghostShapes = allShapes.filter(
      (shape) => shape.type === "text" && shape.meta?.isGhost === true
    );

    if (ghostShapes.length > 0) {
      const ghostIds = ghostShapes.map((shape) => shape.id);
      this.editor.deleteShapes(ghostIds);
      this.ghostShapeIds = this.ghostShapeIds.filter(
        (id) => !ghostIds.includes(id)
      );
    }
  }

  getGhostShapeIds(): TLShapeId[] {
    return this.ghostShapeIds;
  }
}
