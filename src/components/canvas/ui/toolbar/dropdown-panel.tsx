import { ReactNode } from "react";

import { motion } from "motion/react";

interface DropdownPanelProps {
  children: ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
}

export const DropdownPanel = ({
  children,
  className = "",
  align = "center",
}: DropdownPanelProps) => {
  const alignmentClasses = {
    start: "-left-9 origin-bottom-left",
    center: "left-1/2 -translate-x-1/2 origin-bottom",
    end: "right-0 origin-bottom-right",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`border-border bg-popover/95 text-popover-foreground absolute bottom-[calc(100%+1rem)] z-50 rounded-xl border p-0 shadow-xl backdrop-blur-md sm:p-0.5 ${alignmentClasses[align]} ${className}`}
    >
      {children}
    </motion.div>
  );
};
