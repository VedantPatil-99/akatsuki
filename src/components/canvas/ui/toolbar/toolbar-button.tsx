"use client";

import { useState } from "react";

import { motion, type Transition } from "motion/react";
import { TldrawUiButtonIcon } from "tldraw";

interface ToolbarButtonProps {
  label: string;
  icon: React.ReactNode | string;
  isActive: boolean;
  isExpanded?: boolean;
  onClick: () => void;
  isTldrawIcon?: boolean;
  className?: string;
}

export const ToolbarButton = ({
  label,
  icon,
  isActive,
  isExpanded = false,
  onClick,
  isTldrawIcon,
  className = "",
}: ToolbarButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const activeClasses = isActive
    ? "bg-blue-600 ring-2 ring-blue-400 shadow-blue-500/20 text-white"
    : "bg-black/70 backdrop-blur-md hover:bg-blue-400 text-white";

  const showLabel = isExpanded || isHovered;

  const slowSmoothSpring: Transition = {
    type: "spring",
    stiffness: 150, // Lowered from 400 to make it significantly slower
    damping: 22, // Adjusted to prevent excessive bouncing
    mass: 1,
  };

  return (
    <motion.button
      layout="position"
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onPointerDown={() => setIsHovered(false)}
      whileTap={{ scale: 0.9 }}
      initial={false}
      animate={{
        gap: showLabel ? "4px" : "0px",
      }}
      transition={slowSmoothSpring}
      className={`flex h-10 min-w-[40px] cursor-pointer items-center justify-center rounded-lg px-3 ${activeClasses} ${className}`}
    >
      <motion.div
        layout="position"
        className="flex shrink-0 items-center justify-center"
      >
        {isTldrawIcon ? <TldrawUiButtonIcon icon={icon as string} /> : icon}
      </motion.div>

      <motion.div
        layout="position"
        initial={false}
        animate={{
          width: showLabel ? "auto" : 0,
          opacity: showLabel ? 1 : 0,
        }}
        transition={slowSmoothSpring}
        className="flex items-center overflow-hidden text-sm font-medium whitespace-nowrap"
      >
        {label}
      </motion.div>
    </motion.button>
  );
};
