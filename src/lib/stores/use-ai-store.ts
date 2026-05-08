import { create } from "zustand";

export type AIMode = "off" | "word" | "paragraph";

interface AIStoreState {
  aiMode: AIMode;
  isAIAvailable: boolean;
  setAIMode: (mode: AIMode) => void;
  toggleAI: () => void;
}

export const useAIStore = create<AIStoreState>((set) => ({
  aiMode: "off",
  isAIAvailable: false,
  setAIMode: (mode) =>
    set({
      aiMode: mode,
      isAIAvailable: mode !== "off",
    }),
  toggleAI: () =>
    set((state) => {
      const newMode = state.aiMode === "off" ? "paragraph" : "off";
      return { aiMode: newMode, isAIAvailable: newMode !== "off" };
    }),
}));
