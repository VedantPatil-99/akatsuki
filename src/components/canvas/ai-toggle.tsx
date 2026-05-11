"use client";

import { useId } from "react";

import {
  ParagraphIcon,
  PowerIcon,
  SparkleIcon,
  TextTIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AIMode, useAIStore } from "@/lib/stores/use-ai-store";
import { cn } from "@/lib/utils";

export const AIToggle = () => {
  const { aiMode, isAIAvailable, setAIMode } = useAIStore();
  const id = useId();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={isAIAvailable ? "AI Settings" : "Enable AI Features"}
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
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 w-72 p-3 duration-200"
      >
        <DropdownMenuLabel className="font-semibold">
          AI Autocomplete Mode
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mb-3" />

        <RadioGroup
          value={aiMode}
          onValueChange={(val) => setAIMode(val as AIMode)}
          className="grid gap-3"
        >
          {/* OPTION 1: OFF */}
          <div className="border-input has-data-[state=checked]:border-primary/50 hover:bg-muted/50 relative flex w-full cursor-pointer items-center gap-3 rounded-md border p-3 shadow-xs transition-colors outline-none">
            <RadioGroupItem
              value="off"
              id={`${id}-off`}
              className="order-1 size-4 after:absolute after:inset-0"
            />
            <div className="flex grow items-center gap-3">
              <PowerIcon
                className="text-muted-foreground size-5"
                weight="bold"
              />
              <div className="grid gap-0.5">
                <Label
                  htmlFor={`${id}-off`}
                  className="cursor-pointer text-sm font-medium"
                >
                  Turn Off AI
                </Label>
                <p className="text-muted-foreground text-xs">
                  Disable whiteboard intelligence.
                </p>
              </div>
            </div>
          </div>

          {/* OPTION 2: WORD */}
          <div className="border-input hover:bg-muted/50 relative flex w-full cursor-pointer items-center gap-3 rounded-md border p-3 shadow-xs transition-colors outline-none has-data-[state=checked]:border-indigo-500/50">
            <RadioGroupItem
              value="word"
              id={`${id}-word`}
              className="order-1 size-4 border-indigo-600 text-indigo-600 after:absolute after:inset-0"
            />
            <div className="flex grow items-center gap-3">
              <TextTIcon className="size-5 text-indigo-500" weight="bold" />
              <div className="grid gap-0.5">
                <Label
                  htmlFor={`${id}-word`}
                  className="cursor-pointer text-sm font-medium"
                >
                  Word-by-Word
                </Label>
                <p className="text-muted-foreground text-xs">
                  Fast, short 1-4 word continuations.
                </p>
              </div>
            </div>
          </div>

          {/* OPTION 3: PARAGRAPH */}
          <div className="border-input hover:bg-muted/50 relative flex w-full cursor-pointer items-center gap-3 rounded-md border p-3 shadow-xs transition-colors outline-none has-data-[state=checked]:border-indigo-500/50">
            <RadioGroupItem
              value="paragraph"
              id={`${id}-paragraph`}
              className="order-1 size-4 border-indigo-600 text-indigo-600 after:absolute after:inset-0"
            />
            <div className="flex grow items-center gap-3">
              <ParagraphIcon className="size-5 text-indigo-500" weight="bold" />
              <div className="grid gap-0.5">
                <Label
                  htmlFor={`${id}-paragraph`}
                  className="cursor-pointer text-sm font-medium"
                >
                  Paragraph & Math
                </Label>
                <p className="text-muted-foreground text-xs">
                  Complete definitions and matrices.
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
