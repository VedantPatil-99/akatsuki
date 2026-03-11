import { SparkleIcon } from "@phosphor-icons/react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface KnowledgeOptionsProps {
  pageRange: string;
  onPageRangeChange: (val: string) => void;
  isPremium: boolean;
  onPremiumToggle: () => void;
}

export const KnowledgeOptions = ({
  pageRange,
  onPageRangeChange,
  isPremium,
  onPremiumToggle,
}: KnowledgeOptionsProps) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Range Input */}
      <div className="grid gap-3">
        <Label htmlFor="page-range" className="text-neutral-300">
          Target Pages (Optional)
        </Label>
        <Input
          id="page-range"
          placeholder="e.g. 1-5, 8, 11-13"
          value={pageRange}
          onChange={(e) => onPageRangeChange(e.target.value)}
          className="border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-neutral-700"
        />
        <p className="text-xs text-neutral-500">
          Leave blank to scan the entire document.
        </p>
      </div>

      {/* Premium Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/30 p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <SparkleIcon
              size={16}
              weight={isPremium ? "fill" : "regular"}
              className={isPremium ? "text-amber-400" : "text-neutral-500"}
            />
            <span className="text-sm font-medium text-neutral-200">
              Deep Scan
            </span>
          </div>
          <span className="text-xs text-neutral-500">
            Prioritize complex tables and diagrams
          </span>
        </div>
        <button
          onClick={onPremiumToggle}
          onKeyDown={(e) => e.key === "Enter" && onPremiumToggle()}
          tabIndex={0}
          className={cn(
            "relative flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
            isPremium ? "bg-amber-500" : "bg-neutral-800"
          )}
          aria-label="Toggle Deep Scan Mode"
        >
          <div
            className={cn(
              "absolute left-1 h-4 w-4 rounded-full bg-white transition-transform",
              isPremium ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );
};
