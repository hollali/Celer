import { createContext, useContext, useEffect, useState } from "react";
import { Platform, useColorScheme as useDeviceColorScheme } from "react-native";
import { useColorScheme as useNativewindColorScheme } from "nativewind";
import * as SecureStore from "expo-secure-store";

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

const THEME_STORAGE_KEY = "theme_mode";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useNativewindColorScheme();
  const deviceScheme = useDeviceColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");

  useEffect(() => {
    const saved = SecureStore.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    const initial = saved ?? "light";
    setThemeModeState(initial);
    setColorScheme(initial);
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    setColorScheme(mode);
    SecureStore.setItem(THEME_STORAGE_KEY, mode);
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
  if (!context) {
    return {
      isDark: false,
      themeMode: "light" as ThemeMode,
      setThemeMode: () => {},
      resolvedTheme: "light" as Theme,
      isIOS: Platform.OS === "ios",
      useLiquidGlass: Platform.OS === "ios",
    };
  }
  return context;
}
