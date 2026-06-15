import { createContext, useContext, useState } from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";
import { useColorScheme as useNativewindColorScheme } from "nativewind";

type ThemeMode = "light" | "dark" | "system";
type Theme = "light" | "dark";

interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  resolvedTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useNativewindColorScheme();
  const deviceScheme = useDeviceColorScheme();

  const initialMode: ThemeMode =
    colorScheme === undefined ? "system" : colorScheme;
  const [themeMode, setThemeModeState] = useState<ThemeMode>(initialMode);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    setColorScheme(mode);
  };

  const resolvedTheme: Theme =
    colorScheme ?? deviceScheme ?? "light";

  return (
    <ThemeContext.Provider
      value={{
        isDark: resolvedTheme === "dark",
        themeMode,
        setThemeMode,
        resolvedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
