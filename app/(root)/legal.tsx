import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { a11y, a11yButton, a11ySwitch, a11yHeader } from "@/lib/accessibility";
import { useTheme } from "@/lib/ThemeContext";

const legalDocs = [
  {
    id: "privacy",
    title: "Privacy Policy",
    summary: "How Celer collects, uses, and protects your personal information.",
  },
  {
    id: "terms",
    title: "Terms of Service",
    summary: "Service rules, rider responsibilities, and dispute process details.",
  },
  {
    id: "cookies",
    title: "Cookie Preferences",
    summary: "Manage tracking technologies used for analytics and personalization.",
  },
  {
    id: "data-usage",
    title: "Data Usage",
    summary: "See what trip and location data is stored and for how long.",
  },
];

const Legal = () => {
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState<string | null>("privacy");
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-dark-bg">
      <View className="flex-row items-center px-5 py-4 bg-white dark:bg-dark-card border-b border-slate-100 dark:border-dark-border">
        <TouchableOpacity onPress={() => router.back()} {...a11yButton("Go back")}>
          <Ionicons name="chevron-back" size={22} color={isDark ? "#F5F5F7" : "#0F172A"} />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-JakartaBold text-slate-900 dark:text-dark-text" {...a11yHeader("Legal & Privacy")}>Legal & Privacy</Text>
      </View>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-5 rounded-2xl bg-white dark:bg-dark-card p-4 border border-slate-100 dark:border-dark-border">
          <Text className="font-JakartaMedium text-slate-900 dark:text-dark-text">Legal Center</Text>
          <Text className="text-slate-500 dark:text-dark-text-secondary text-xs mt-1">Last updated: March 10, 2026</Text>
          <Text className="text-slate-600 dark:text-dark-text-secondary text-sm mt-3">
            Review your legal agreements and control data permissions in one place.
          </Text>
        </View>

        <View className="mt-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border overflow-hidden">
          {legalDocs.map((doc, index) => {
            const isOpen = expanded === doc.id;
            return (
              <View key={doc.id}>
                <TouchableOpacity
                  className="px-4 py-4 flex-row items-center justify-between"
                  onPress={() => setExpanded(isOpen ? null : doc.id)}
                  {...a11yButton(doc.title, isOpen ? "Collapse" : "Expand details")}
                >
                  <Text className="font-JakartaMedium text-slate-900 dark:text-dark-text">{doc.title}</Text>
                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-forward"}
                    size={18}
                    color="#64748b"
                  />
                </TouchableOpacity>
                {isOpen && (
                  <View className="px-4 pb-4">
                    <Text className="text-sm text-slate-600 dark:text-dark-text-secondary leading-5">{doc.summary}</Text>
                    <TouchableOpacity className="mt-3 rounded-full bg-slate-900 dark:bg-primary-500 px-4 py-2 self-start" {...a11yButton(`Read full ${doc.title} document`)}>
                      <Text className="text-white text-xs font-JakartaMedium">Read full document</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {index !== legalDocs.length - 1 && <View className="h-px bg-slate-100 dark:bg-dark-border" />}
              </View>
            );
          })}
        </View>

        <View className="mt-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border overflow-hidden">
          <View className="px-4 py-4 flex-row items-center justify-between">
            <View className="pr-3 flex-1">
              <Text className="font-JakartaMedium text-slate-900 dark:text-dark-text">Analytics consent</Text>
              <Text className="text-xs text-slate-500 dark:text-dark-text-secondary">Help improve app performance and reliability.</Text>
            </View>
            <Switch value={analyticsConsent} onValueChange={setAnalyticsConsent} {...a11ySwitch("Analytics consent", analyticsConsent)} />
          </View>
          <View className="h-px bg-slate-100 dark:bg-dark-border" />
          <View className="px-4 py-4 flex-row items-center justify-between">
            <View className="pr-3 flex-1">
              <Text className="font-JakartaMedium text-slate-900 dark:text-dark-text">Marketing consent</Text>
              <Text className="text-xs text-slate-500 dark:text-dark-text-secondary">Receive personalized promotions and updates.</Text>
            </View>
            <Switch value={marketingConsent} onValueChange={setMarketingConsent} {...a11ySwitch("Marketing consent", marketingConsent)} />
          </View>
        </View>

        <View className="mt-4 mb-8 rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border p-4">
          <TouchableOpacity onPress={() => Alert.alert("Coming Soon", "Data download feature coming soon!")} className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-700/30 py-3 px-4 flex-row items-center justify-between" {...a11yButton("Download my data archive")}>
            <Text className="font-JakartaMedium text-blue-700 dark:text-blue-400">Download my data archive</Text>
            <Ionicons name="download-outline" size={18} color="#1d4ed8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert("Coming Soon", "Account deletion feature coming soon!")} className="mt-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-700/30 py-3 px-4 flex-row items-center justify-between" {...a11yButton("Request account deletion")}>
            <Text className="font-JakartaMedium text-red-700 dark:text-red-400">Request account deletion</Text>
            <Ionicons name="trash-outline" size={18} color="#b91c1c" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Legal;
