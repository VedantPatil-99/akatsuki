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
    ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-ring"
    : "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground";

  const showLabel = isExpanded || isHovered;

  const slowSmoothSpring: Transition = {
    type: "spring",
    stiffness: 150,
    damping: 22,
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
      className={`corner-squircle flex h-9 min-w-[36px] cursor-pointer items-center justify-center rounded-2xl px-2 sm:h-10 sm:min-w-[40px] sm:px-3 ${activeClasses} ${className}`}
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
        className="flex items-center overflow-hidden text-xs font-medium whitespace-nowrap sm:text-sm"
      >
        {label}
      </motion.div>
    </motion.button>
  );
};
