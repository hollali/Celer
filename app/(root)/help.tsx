import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-JakartaBold text-slate-900">Help & Support</Text>
      </View>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-5 rounded-2xl bg-indigo-600 p-4">
          <Text className="text-white font-JakartaBold text-base">Need help right away?</Text>
          <Text className="text-indigo-100 text-xs mt-1">
            Average support response time: under 3 minutes
          </Text>
          <View className="mt-4 flex-row gap-2">
            <TouchableOpacity className="flex-1 bg-white/20 rounded-xl px-3 py-3 flex-row items-center justify-center">
              <Ionicons name="chatbox-ellipses-outline" size={16} color="white" />
              <Text className="text-white ml-2 font-JakartaMedium">Live Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-white/20 rounded-xl px-3 py-3 flex-row items-center justify-center">
              <Ionicons name="call-outline" size={16} color="white" />
              <Text className="text-white ml-2 font-JakartaMedium">Call Us</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-4 rounded-2xl bg-white border border-slate-100 p-4">
          <Text className="font-JakartaMedium text-slate-800 mb-2">Search FAQs</Text>
          <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
            <Ionicons name="search" size={16} color="#64748b" />
            <TextInput
              placeholder="Type a question"
              value={query}
              onChangeText={setQuery}
              className="flex-1 px-2 py-3 text-slate-900"
            />
          </View>
        </View>

        <View className="mt-4 rounded-2xl bg-white border border-slate-100 overflow-hidden">
          {filteredFaq.map((item, index) => {
            const open = openFaqId === item.id;
            return (
              <View key={item.id}>
                <TouchableOpacity
                  onPress={() => setOpenFaqId(open ? null : item.id)}
                  className="px-4 py-4 flex-row items-center justify-between"
                >
                  <Text className="font-JakartaMedium text-slate-900 pr-3 flex-1">
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
                    <Text className="text-slate-600 text-sm leading-5">{item.answer}</Text>
                  </View>
                )}
                {index !== filteredFaq.length - 1 && <View className="h-px bg-slate-100" />}
              </View>
            );
          })}
          {!filteredFaq.length && (
            <View className="px-4 py-6 items-center">
              <Text className="text-slate-500">No FAQ matches your search.</Text>
            </View>
          )}
        </View>

        <View className="mt-4 rounded-2xl bg-white border border-slate-100 p-4 mb-8">
          <Text className="font-JakartaMedium text-slate-900">Recent Support Tickets</Text>
          <View className="mt-3 rounded-xl border border-slate-200 p-3">
            <Text className="font-JakartaMedium text-slate-800">#5471 • Fare Review</Text>
            <Text className="text-xs text-amber-600 mt-1">Pending • Updated 2h ago</Text>
          </View>
          <View className="mt-2 rounded-xl border border-slate-200 p-3">
            <Text className="font-JakartaMedium text-slate-800">#5458 • Lost Item Report</Text>
            <Text className="text-xs text-emerald-600 mt-1">Resolved • Yesterday</Text>
          </View>
          <TouchableOpacity className="mt-4 rounded-full bg-slate-900 py-3 items-center">
            <Text className="text-white font-JakartaBold">Create New Ticket</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Help;
