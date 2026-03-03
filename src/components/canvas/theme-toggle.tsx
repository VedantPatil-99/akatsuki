"use client";

import { useEffect, useState } from "react";

import { useTheme } from "next-themes";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <Button variant="outline" size="icon" disabled aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "border-secondary-foreground/50 pointer-events-auto absolute top-4 right-4 z-10 cursor-pointer rounded-full border shadow-sm",
        "dark:bg-neutral-900 dark:text-neutral-50 dark:hover:bg-neutral-800",
        "bg-secondary text-neutral-800 hover:bg-neutral-200"
      )}
    >
      {isDark ? (
        <MoonIcon className="size-4.5" weight="bold" />
      ) : (
        <SunIcon className="size-4.5" weight="bold" />
      )}
    </Button>
  );
};
