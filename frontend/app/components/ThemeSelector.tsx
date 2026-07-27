"use client";

import React from "react";
import { useTheme } from "@/app/context/ThemeContext";

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setTheme("dark")}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
          theme === "dark"
            ? "bg-accent text-gray-900 border-accent"
            : "bg-card-secondary text-foreground border-border hover:border-accent/50"
        }`}
      >
        <span>🌙</span>
        Dark Mode
      </button>
      <button
        onClick={() => setTheme("light")}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
          theme === "light"
            ? "bg-accent text-gray-900 border-accent"
            : "bg-card-secondary text-foreground border-border hover:border-accent/50"
        }`}
      >
        <span>☀️</span>
        Light Mode
      </button>
    </div>
  );
}
