export interface MemoryChunk {
  shapeIds: string[];
  text: string;
  timestamp?: number;
}

export interface GhostTextManager {
  createGhostText: (text: string, position: { x: number; y: number }) => void;
  clearAllGhosts: () => void;
  cleanupGhostsOnNewInput: () => void;
}
