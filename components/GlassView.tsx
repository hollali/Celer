import { BlurView } from "expo-blur";
import React from "react";
import { View } from "react-native";
import type { BlurViewProps } from "expo-blur";

import { useTheme } from "@/lib/ThemeContext";

type BlurTint = BlurViewProps["tint"];

interface GlassViewProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  tint?: BlurTint;
  style?: Record<string, unknown>;
}

export function GlassView({ children, className, intensity = 70, tint, style }: GlassViewProps) {
  const { isDark, useLiquidGlass } = useTheme();

  if (!useLiquidGlass) {
    return (
      <View className={className} style={style}>
        {children}
      </View>
    );
  }

  const blurTint = tint ?? (isDark ? "systemMaterialDark" : "systemThinMaterialLight");

  return (
    <BlurView intensity={intensity} tint={blurTint} className={className} style={style}>
      {children}
    </BlurView>
  );
}

export function useIsLiquidGlass() {
  const { useLiquidGlass } = useTheme();
  return useLiquidGlass;
}
