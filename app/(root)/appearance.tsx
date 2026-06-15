import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
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

const OPTIONS: { value: ThemeOption; label: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
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

const OptionCard = ({ value, label, description, icon, selected, onSelect, isDark = false }: OptionProps) => (
  <TouchableOpacity
    onPress={onSelect}
    activeOpacity={0.7}
    className={`flex-row items-center p-4 rounded-2xl border mb-3 ${
      selected
        ? "bg-primary-100 dark:bg-primary-900/30 border-primary-500"
        : "bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border"
    }`}
    {...a11yButton(label, description, false, selected)}
  >
    <View
      className={`h-12 w-12 rounded-full items-center justify-center ${
        selected ? "bg-primary-500" : "bg-slate-100 dark:bg-dark-bg"
      }`}
    >
      <Ionicons name={icon} size={22} color={selected ? "#FFFFFF" : isDark ? "#F5F5F7" : "#0F172A"} />
    </View>

    <View className="flex-1 ml-4">
      <Text
        className={`text-base font-JakartaSemiBold ${
          selected ? "text-primary-700 dark:text-primary-300" : "text-slate-900 dark:text-dark-text"
        }`}
      >
        {label}
      </Text>
      <Text
        className={`text-xs font-JakartaMedium mt-0.5 ${
          selected ? "text-primary-600 dark:text-primary-400" : "text-slate-500 dark:text-dark-text-secondary"
        }`}
      >
        {description}
      </Text>
    </View>

    {selected && (
      <View className="h-6 w-6 rounded-full bg-primary-500 items-center justify-center">
        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
      </View>
    )}
  </TouchableOpacity>
);

const Appearance = () => {
  const { themeMode, setThemeMode, resolvedTheme, isDark } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-dark-bg">
      <View className="flex-row items-center px-5 py-4 bg-white dark:bg-dark-card border-b border-slate-100 dark:border-dark-border">
        <TouchableOpacity onPress={() => router.back()} {...a11yButton("Go back")}>
          <Ionicons name="chevron-back" size={22} color={isDark ? "#F5F5F7" : "#0F172A"} />
        </TouchableOpacity>
        <Text
          className="ml-4 text-lg font-JakartaBold text-slate-900 dark:text-dark-text"
          {...a11yHeader("Appearance")}
        >
          Appearance
        </Text>
      </View>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-5 rounded-2xl bg-white dark:bg-dark-card p-4 border border-slate-100 dark:border-dark-border">
          <Text className="font-JakartaMedium text-slate-900 dark:text-dark-text">
            Current appearance
          </Text>
          <Text className="text-slate-500 dark:text-dark-text-secondary text-xs mt-1">
            {resolvedTheme === "dark" ? "Dark mode is active" : "Light mode is active"}
          </Text>
          <View className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-dark-border overflow-hidden">
            <View
              className={`h-full rounded-full ${resolvedTheme === "dark" ? "bg-primary-500 ml-auto" : "bg-amber-400"}`}
              style={{ width: "50%" }}
            />
          </View>
        </View>

        <Text className="mt-6 mb-3 text-xs font-JakartaBold uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
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

        <View className="mt-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 p-4 mb-8">
          <View className="flex-row items-start">
            <Ionicons name="information-circle-outline" size={18} color="#d97706" />
            <Text className="text-sm font-JakartaMedium text-amber-700 dark:text-amber-400 ml-2 flex-1 leading-5">
              System mode follows your device's light or dark appearance setting.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Appearance;
