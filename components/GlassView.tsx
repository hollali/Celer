import { BlurView } from "expo-blur";
import React from "react";
import { Platform, View } from "react-native";

import { useTheme } from "@/lib/ThemeContext";

interface GlassViewProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  tint?: "light" | "dark" | "default" | "extraLight" | "regular" | "prominent" | "systemUltraThinMaterial" | "systemThinMaterial" | "systemMaterial" | "systemThickMaterial" | "systemChromeMaterial" | "systemUltraThinMaterialLight" | "systemThinMaterialLight" | "systemMaterialLight" | "systemThickMaterialLight" | "systemChromeMaterialLight" | "systemUltraThinMaterialDark" | "systemThinMaterialDark" | "systemMaterialDark" | "systemThickMaterialDark" | "systemChromeMaterialDark";
  style?: any;
}

export function GlassView({
  children,
  className,
  intensity = 70,
  tint,
  style,
}: GlassViewProps) {
  const { isDark, useLiquidGlass } = useTheme();

  if (!useLiquidGlass) {
    return <View className={className} style={style}>{children}</View>;
  }

  const blurTint = tint ?? (isDark ? "systemMaterialDark" : "systemThinMaterialLight");

  return (
    <BlurView
      intensity={intensity}
      tint={blurTint}
      className={className}
      style={style}
    >
      {children}
    </BlurView>
  );
}

export function useIsLiquidGlass() {
  const { useLiquidGlass } = useTheme();
  return useLiquidGlass;
}
