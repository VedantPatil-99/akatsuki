import { ReactNode } from "react";

import { motion } from "motion/react";

export const DropdownPanel = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`border-border bg-popover/95 text-popover-foreground absolute bottom-14 left-1/2 z-50 -translate-x-1/2 rounded-xl border p-1 shadow-xl backdrop-blur-md ${className}`}
    >
      {children}
    </motion.div>
  );
};
