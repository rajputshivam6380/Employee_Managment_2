import {
  Moon,
  Sun,
} from "lucide-react";

import { useThemeMode } from "../theme/themeMode";

export default function ThemeToggle() {

  const {
    mode,
    toggleTheme,
  } = useThemeMode();

  const isDark =
    mode === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      // title={
      //   isDark
      //     ? "Switch to light mode"
      //     : "Switch to dark mode"
      // }
      className="theme-toggle inline-flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-700 shadow-sm transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:cursor-pointer"
    >
      {isDark ? (
        <Sun size={20} />
      ) : (
        <Moon size={20} />
      )}
    </button>
  );
}
