"use client";

import { useEffect } from "react";

import { useTheme } from "next-themes";

import { useEditor } from "tldraw";

export function TldrawThemeSync() {
  const editor = useEditor();
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    if (!editor) return;

    const isDarkAppTheme =
      theme === "dark" || (theme === "system" && systemTheme === "dark");

    const currentTldrawTheme = editor.user.getIsDarkMode();

    if (currentTldrawTheme !== isDarkAppTheme) {
      queueMicrotask(() => {
        editor.user.updateUserPreferences({
          colorScheme: isDarkAppTheme ? "dark" : "light",
        });
      });
    }
  }, [editor, theme, systemTheme]);

  return null;
}
