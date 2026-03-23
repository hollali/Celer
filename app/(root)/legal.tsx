import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [expanded, setExpanded] = useState<string | null>("privacy");
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-JakartaBold text-slate-900">Legal & Privacy</Text>
      </View>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-5 rounded-2xl bg-white p-4 border border-slate-100">
          <Text className="font-JakartaMedium text-slate-900">Legal Center</Text>
          <Text className="text-slate-500 text-xs mt-1">Last updated: March 10, 2026</Text>
          <Text className="text-slate-600 text-sm mt-3">
            Review your legal agreements and control data permissions in one place.
          </Text>
        </View>

        <View className="mt-4 rounded-2xl bg-white border border-slate-100 overflow-hidden">
          {legalDocs.map((doc, index) => {
            const isOpen = expanded === doc.id;
            return (
              <View key={doc.id}>
                <TouchableOpacity
                  className="px-4 py-4 flex-row items-center justify-between"
                  onPress={() => setExpanded(isOpen ? null : doc.id)}
                >
                  <Text className="font-JakartaMedium text-slate-900">{doc.title}</Text>
                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-forward"}
                    size={18}
                    color="#64748b"
                  />
                </TouchableOpacity>
                {isOpen && (
                  <View className="px-4 pb-4">
                    <Text className="text-sm text-slate-600 leading-5">{doc.summary}</Text>
                    <TouchableOpacity className="mt-3 rounded-full bg-slate-900 px-4 py-2 self-start">
                      <Text className="text-white text-xs font-JakartaMedium">Read full document</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {index !== legalDocs.length - 1 && <View className="h-px bg-slate-100" />}
              </View>
            );
          })}
        </View>

        <View className="mt-4 rounded-2xl bg-white border border-slate-100 overflow-hidden">
          <View className="px-4 py-4 flex-row items-center justify-between">
            <View className="pr-3 flex-1">
              <Text className="font-JakartaMedium text-slate-900">Analytics consent</Text>
              <Text className="text-xs text-slate-500">Help improve app performance and reliability.</Text>
            </View>
            <Switch value={analyticsConsent} onValueChange={setAnalyticsConsent} />
          </View>
          <View className="h-px bg-slate-100" />
          <View className="px-4 py-4 flex-row items-center justify-between">
            <View className="pr-3 flex-1">
              <Text className="font-JakartaMedium text-slate-900">Marketing consent</Text>
              <Text className="text-xs text-slate-500">Receive personalized promotions and updates.</Text>
            </View>
            <Switch value={marketingConsent} onValueChange={setMarketingConsent} />
          </View>
        </View>

        <View className="mt-4 mb-8 rounded-2xl bg-white border border-slate-100 p-4">
          <TouchableOpacity className="rounded-xl bg-blue-50 border border-blue-100 py-3 px-4 flex-row items-center justify-between">
            <Text className="font-JakartaMedium text-blue-700">Download my data archive</Text>
            <Ionicons name="download-outline" size={18} color="#1d4ed8" />
          </TouchableOpacity>
          <TouchableOpacity className="mt-3 rounded-xl bg-red-50 border border-red-100 py-3 px-4 flex-row items-center justify-between">
            <Text className="font-JakartaMedium text-red-700">Request account deletion</Text>
            <Ionicons name="trash-outline" size={18} color="#b91c1c" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Legal;
