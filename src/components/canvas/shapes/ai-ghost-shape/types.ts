import { RecordProps, T, TLBaseShape } from "tldraw";

// Define the properties our custom shape will hold in the Tldraw store
export type AIGhostShape = TLBaseShape<
  "ai-ghost",
  {
    w: number;
    h: number;
    text: string;
  }
>;

// Define the schema for validation when saving/loading to the store
export const aiGhostShapeProps: RecordProps<AIGhostShape> = {
  w: T.number,
  h: T.number,
  text: T.string,
};
