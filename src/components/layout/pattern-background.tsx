import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PatternBackgroundProps {
  children: ReactNode;
  className?: string;
}

export const PatternBackground = ({
  children,
  className,
}: PatternBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-neutral-50 p-4 dark:bg-zinc-950",
        className
      )}
    >
      {/* 1. Light Mode Pattern (Your Exact Circuit Board) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 block dark:hidden"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),
            radial-gradient(circle at 20px 20px, rgba(55, 65, 81, 0.2) 2px, transparent 2px),
            radial-gradient(circle at 40px 40px, rgba(55, 65, 81, 0.3) 2px, transparent 2px)
          `,
          backgroundSize: "40px 40px, 40px 40px, 40px 40px, 40px 40px",
        }}
      />

      {/* 2. Dark Mode Pattern (Reverse-engineered to white with low opacity) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 hidden dark:block"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255, 255, 255, 0.05) 19px, rgba(255, 255, 255, 0.05) 20px, transparent 20px, transparent 39px, rgba(255, 255, 255, 0.05) 39px, rgba(255, 255, 255, 0.05) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255, 255, 255, 0.05) 19px, rgba(255, 255, 255, 0.05) 20px, transparent 20px, transparent 39px, rgba(255, 255, 255, 0.05) 39px, rgba(255, 255, 255, 0.05) 40px),
            radial-gradient(circle at 20px 20px, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
            radial-gradient(circle at 40px 40px, rgba(255, 255, 255, 0.1) 2px, transparent 2px)
          `,
          backgroundSize: "40px 40px, 40px 40px, 40px 40px, 40px 40px",
        }}
      />

      {/* 3. Content Container */}
      <div className="relative z-10 flex w-full justify-center">{children}</div>
    </div>
  );
};
