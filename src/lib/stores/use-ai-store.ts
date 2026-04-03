import { create } from "zustand";

interface AIStoreState {
  isAIAvailable: boolean;
  toggleAI: () => void;
  setAIState: (state: boolean) => void;
}

export const useAIStore = create<AIStoreState>((set) => ({
  isAIAvailable: false, // Default to false as per your current behavior
  toggleAI: () => set((state) => ({ isAIAvailable: !state.isAIAvailable })),
  setAIState: (isAIAvailable) => set({ isAIAvailable }),
}));
