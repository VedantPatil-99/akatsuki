import type { Editor, TLShapeId } from "tldraw";

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface ShapeBounds {
  id: TLShapeId;
  bounds: Bounds;
}

/**
 * Calculate the boundaries of multiple shapes
 */
export function calculateShapeBounds(
  editor: Editor,
  shapeIds: TLShapeId[]
): Bounds {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  shapeIds.forEach((id) => {
    const bounds = editor.getShapePageBounds(id);
    if (bounds) {
      // Fallbacks included to perfectly support all tldraw versions
      minX = Math.min(minX, bounds.minX ?? bounds.x);
      minY = Math.min(minY, bounds.minY ?? bounds.y);
      maxX = Math.max(maxX, bounds.maxX ?? bounds.x + bounds.w);
      maxY = Math.max(maxY, bounds.maxY ?? bounds.y + bounds.h);
    }
  });

  return { minX, minY, maxX, maxY };
}

/**
 * Expand boundaries by padding amount
 */
export function expandBounds(bounds: Bounds, padding: number): Bounds {
  return {
    minX: bounds.minX - padding,
    minY: bounds.minY - padding,
    maxX: bounds.maxX + padding,
    maxY: bounds.maxY + padding,
  };
}

/**
 * Get bounds for a single shape
 */
export function getShapeBounds(
  editor: Editor,
  shapeId: TLShapeId
): Bounds | null {
  const bounds = editor.getShapePageBounds(shapeId);
  if (!bounds) return null;

  return {
    minX: bounds.minX ?? bounds.x,
    minY: bounds.minY ?? bounds.y,
    maxX: bounds.maxX ?? bounds.x + bounds.w,
    maxY: bounds.maxY ?? bounds.y + bounds.h,
  };
}

/**
 * Check if two bounds overlap (AABB collision detection)
 */
export function doBoundsOverlap(bounds1: Bounds, bounds2: Bounds): boolean {
  return !(
    bounds2.maxX < bounds1.minX ||
    bounds2.minX > bounds1.maxX ||
    bounds2.maxY < bounds1.minY ||
    bounds2.minY > bounds1.maxY
  );
}

/**
 * Find shapes within expanded boundaries (context aura)
 */
export function findShapesInBounds(
  editor: Editor,
  targetBounds: Bounds
): TLShapeId[] {
  return editor
    .getCurrentPageShapes()
    .filter((shape) => {
      const shapeBounds = getShapeBounds(editor, shape.id);
      if (!shapeBounds) return false;

      return doBoundsOverlap(targetBounds, shapeBounds);
    })
    .map((shape) => shape.id);
}
