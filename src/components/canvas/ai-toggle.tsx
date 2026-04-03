"use client";

import { SparkleIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { useAIStore } from "@/lib/stores/use-ai-store";
import { cn } from "@/lib/utils";

export const AIToggle = () => {
  const { isAIAvailable, toggleAI } = useAIStore();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleAI}
      aria-label={isAIAvailable ? "Disable AI Features" : "Enable AI Features"}
      className={cn(
        "pointer-events-auto cursor-pointer rounded-full border shadow-sm transition-all duration-300",
        isAIAvailable
          ? "border-indigo-500/50 bg-indigo-500 text-white hover:bg-indigo-600 dark:border-indigo-400/50 dark:bg-indigo-600 dark:hover:bg-indigo-700"
          : "border-secondary-foreground/50 bg-secondary text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:bg-neutral-800"
      )}
    >
      <SparkleIcon
        className={cn("size-4.5", isAIAvailable && "animate-pulse")}
        weight={isAIAvailable ? "fill" : "regular"}
      />
    </Button>
  );
};
