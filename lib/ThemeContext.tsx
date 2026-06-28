import { createContext, useContext, useEffect, useState } from "react";
import { Platform, useColorScheme as useDeviceColorScheme } from "react-native";
import { useColorScheme as useNativewindColorScheme } from "nativewind";

type ThemeMode = "light" | "dark" | "system";
type Theme = "light" | "dark";

interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  resolvedTheme: Theme;
  isIOS: boolean;
  useLiquidGlass: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useNativewindColorScheme();
  const deviceScheme = useDeviceColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    colorScheme ?? "light",
  );

  useEffect(() => {
    if (colorScheme === undefined) {
      setColorScheme("light");
    }
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    setColorScheme(mode);
  };

  const resolvedTheme: Theme =
    colorScheme ?? deviceScheme ?? "light";

  const isIOS = Platform.OS === "ios";
  const useLiquidGlass = isIOS;

  return (
    <ThemeContext.Provider
      value={{
        isDark: resolvedTheme === "dark",
        themeMode,
        setThemeMode,
        resolvedTheme,
        isIOS,
        useLiquidGlass,
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
