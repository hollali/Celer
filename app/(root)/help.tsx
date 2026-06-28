import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { a11y, a11yButton, a11yHeader } from "@/lib/accessibility";
import { useTheme } from "@/lib/ThemeContext";

const faqItems = [
  {
    id: "faq-1",
    question: "How do I cancel a ride?",
    answer: "Open the active ride card and tap Cancel. Fees may apply depending on driver arrival time.",
  },
  {
    id: "faq-2",
    question: "How can I report an item left in a vehicle?",
    answer: "Go to Ride History, open that trip, and select Report lost item to contact support faster.",
  },
  {
    id: "faq-3",
    question: "Can I change my destination during a ride?",
    answer: "Yes. Use the ride details screen and tap Edit destination. Fare updates are shown instantly.",
  },
];

const Help = () => {
  const { isDark, useLiquidGlass } = useTheme();
  const [query, setQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqItems[0].id);

  const filteredFaq = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return faqItems;

    return faqItems.filter(
      ({ question, answer }) =>
        question.toLowerCase().includes(text) || answer.toLowerCase().includes(text),
    );
  }, [query]);

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
          <Text className="ml-4 text-lg font-JakartaBold text-slate-900 dark:text-dark-text" {...a11yHeader("Help & Support")}>Help & Support</Text>
        </BlurView>
      ) : (
      <View className="flex-row items-center px-5 py-4 bg-white dark:bg-dark-card border-b border-slate-100 dark:border-dark-border">
        <TouchableOpacity onPress={() => router.back()} {...a11yButton("Go back")}>
          <Ionicons name="chevron-back" size={22} color={isDark ? "#F5F5F7" : "#0F172A"} />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-JakartaBold text-slate-900 dark:text-dark-text" {...a11yHeader("Help & Support")}>Help & Support</Text>
      </View>
      )}

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-5 rounded-2xl bg-indigo-600 dark:bg-indigo-700 p-4">
          <Text className="text-white font-JakartaBold text-base">Need help right away?</Text>
          <Text className="text-indigo-100 text-xs mt-1">
            Average support response time: under 3 minutes
          </Text>
          <View className="mt-4 flex-row gap-2">
            <TouchableOpacity className="flex-1 bg-white/20 rounded-xl px-3 py-3 flex-row items-center justify-center" {...a11yButton("Live chat with support")}>
              <Ionicons name="chatbox-ellipses-outline" size={16} color="white" />
              <Text className="text-white ml-2 font-JakartaMedium">Live Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-white/20 rounded-xl px-3 py-3 flex-row items-center justify-center" {...a11yButton("Call support")}>
              <Ionicons name="call-outline" size={16} color="white" />
              <Text className="text-white ml-2 font-JakartaMedium">Call Us</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border p-4">
          <Text className="font-JakartaMedium text-slate-800 dark:text-dark-text mb-2">Search FAQs</Text>
          <View className="flex-row items-center rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg px-3">
            <Ionicons name="search" size={16} color="#64748b" />
            <TextInput
              placeholder="Type a question"
              placeholderTextColor="#8E8E93"
              value={query}
              onChangeText={setQuery}
              className="flex-1 px-2 py-3 text-slate-900 dark:text-dark-text"
              accessibilityLabel="Search frequently asked questions"
            />
          </View>
        </View>

        <View className="mt-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border overflow-hidden">
          {filteredFaq.map((item, index) => {
            const open = openFaqId === item.id;
            return (
              <View key={item.id}>
                <TouchableOpacity
                  onPress={() => setOpenFaqId(open ? null : item.id)}
                  className="px-4 py-4 flex-row items-center justify-between"
                  {...a11yButton(item.question, open ? "Collapse answer" : "Expand answer")}
                >
                  <Text className="font-JakartaMedium text-slate-900 dark:text-dark-text pr-3 flex-1">
                    {item.question}
                  </Text>
                  <Ionicons
                    name={open ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#64748b"
                  />
                </TouchableOpacity>
                {open && (
                  <View className="px-4 pb-4">
                    <Text className="text-slate-600 dark:text-dark-text-secondary text-sm leading-5">{item.answer}</Text>
                  </View>
                )}
                {index !== filteredFaq.length - 1 && <View className="h-px bg-slate-100 dark:bg-dark-border" />}
              </View>
            );
          })}
          {!filteredFaq.length && (
            <View className="px-4 py-6 items-center">
              <Text className="text-slate-500 dark:text-dark-text-secondary">No FAQ matches your search.</Text>
            </View>
          )}
        </View>

        <View className="mt-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border p-4 mb-8">
          <Text className="font-JakartaMedium text-slate-900 dark:text-dark-text">Recent Support Tickets</Text>
          <View className="mt-3 rounded-xl border border-slate-200 dark:border-dark-border p-3">
            <Text className="font-JakartaMedium text-slate-800 dark:text-dark-text">#5471 • Fare Review</Text>
            <Text className="text-xs text-amber-600 dark:text-amber-400 mt-1">Pending • Updated 2h ago</Text>
          </View>
          <View className="mt-2 rounded-xl border border-slate-200 dark:border-dark-border p-3">
            <Text className="font-JakartaMedium text-slate-800 dark:text-dark-text">#5458 • Lost Item Report</Text>
            <Text className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Resolved • Yesterday</Text>
          </View>
          <TouchableOpacity
            className="mt-4 rounded-full bg-slate-900 dark:bg-primary-500 py-3 items-center"
            {...a11yButton("Create new support ticket")}
          >
            <Text className="text-white font-JakartaBold">Create New Ticket</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Help;
