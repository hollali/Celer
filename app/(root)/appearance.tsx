import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/ThemeContext";
import { a11y, a11yButton, a11yHeader } from "@/lib/accessibility";

type ThemeOption = "light" | "dark" | "system";

interface OptionProps {
  value: ThemeOption;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onSelect: () => void;
  isDark?: boolean;
}

const OPTIONS: {
  value: ThemeOption;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: "light",
    label: "Light",
    description: "Bright interface for daytime use",
    icon: "sunny-outline",
  },
  {
    value: "dark",
    label: "Dark",
    description: "Easy on the eyes in low light",
    icon: "moon-outline",
  },
  {
    value: "system",
    label: "System",
    description: "Automatically follows your device settings",
    icon: "phone-portrait-outline",
  },
];

const OptionCard = ({
  value,
  label,
  description,
  icon,
  selected,
  onSelect,
  isDark = false,
}: OptionProps) => (
  <TouchableOpacity
    onPress={onSelect}
    activeOpacity={0.7}
    className={`mb-3 flex-row items-center rounded-2xl border p-4 ${
      selected
        ? "border-primary-500 bg-primary-100 dark:bg-primary-900/30"
        : "border-slate-200 bg-white dark:border-dark-border dark:bg-dark-card"
    }`}
    {...a11yButton(label, description, false, selected)}
  >
    <View
      className={`h-12 w-12 items-center justify-center rounded-full ${
        selected ? "bg-primary-500" : "bg-slate-100 dark:bg-dark-bg"
      }`}
    >
      <Ionicons
        name={icon}
        size={22}
        color={selected ? "#FFFFFF" : isDark ? "#F5F5F7" : "#0F172A"}
      />
    </View>

    <View className="ml-4 flex-1">
      <Text
        className={`font-JakartaSemiBold text-base ${
          selected ? "text-primary-700 dark:text-primary-300" : "text-slate-900 dark:text-dark-text"
        }`}
      >
        {label}
      </Text>
      <Text
        className={`mt-0.5 font-JakartaMedium text-xs ${
          selected
            ? "text-primary-600 dark:text-primary-400"
            : "text-slate-500 dark:text-dark-text-secondary"
        }`}
      >
        {description}
      </Text>
    </View>

    {selected && (
      <View className="h-6 w-6 items-center justify-center rounded-full bg-primary-500">
        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
      </View>
    )}
  </TouchableOpacity>
);

const Appearance = () => {
  const { themeMode, setThemeMode, resolvedTheme, isDark, useLiquidGlass } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-dark-bg">
      {useLiquidGlass ? (
        <BlurView
          intensity={80}
          tint={isDark ? "systemMaterialDark" : "systemChromeMaterialLight"}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: Platform.OS === "ios" ? 0.5 : 1,
            borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(60,60,67,0.12)",
          }}
        >
          <TouchableOpacity onPress={() => router.back()} {...a11yButton("Go back")}>
            <Ionicons name="chevron-back" size={22} color={isDark ? "#F5F5F7" : "#0F172A"} />
          </TouchableOpacity>
          <Text
            className="ml-4 font-JakartaBold text-lg text-slate-900 dark:text-dark-text"
            {...a11yHeader("Appearance")}
          >
            Appearance
          </Text>
        </BlurView>
      ) : (
        <View className="flex-row items-center border-b border-slate-100 bg-white px-5 py-4 dark:border-dark-border dark:bg-dark-card">
          <TouchableOpacity onPress={() => router.back()} {...a11yButton("Go back")}>
            <Ionicons name="chevron-back" size={22} color={isDark ? "#F5F5F7" : "#0F172A"} />
          </TouchableOpacity>
          <Text
            className="ml-4 font-JakartaBold text-lg text-slate-900 dark:text-dark-text"
            {...a11yHeader("Appearance")}
          >
            Appearance
          </Text>
        </View>
      )}

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-5 rounded-2xl border border-slate-100 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
          <Text className="font-JakartaMedium text-slate-900 dark:text-dark-text">
            Current appearance
          </Text>
          <Text className="mt-1 text-xs text-slate-500 dark:text-dark-text-secondary">
            {resolvedTheme === "dark" ? "Dark mode is active" : "Light mode is active"}
          </Text>
          <View className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-dark-border">
            <View
              className={`h-full rounded-full ${resolvedTheme === "dark" ? "ml-auto bg-primary-500" : "bg-amber-400"}`}
              style={{ width: "50%" }}
            />
          </View>
        </View>

        <Text className="mb-3 mt-6 font-JakartaBold text-xs uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
          Choose theme
        </Text>

        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            value={opt.value}
            label={opt.label}
            description={opt.description}
            icon={opt.icon}
            selected={themeMode === opt.value}
            onSelect={() => setThemeMode(opt.value)}
            isDark={isDark}
          />
        ))}

        <View className="mb-8 mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700/30 dark:bg-amber-900/20">
          <View className="flex-row items-start">
            <Ionicons name="information-circle-outline" size={18} color="#d97706" />
            <Text className="ml-2 flex-1 font-JakartaMedium text-sm leading-5 text-amber-700 dark:text-amber-400">
              System mode follows your device's light or dark appearance setting.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Appearance;
