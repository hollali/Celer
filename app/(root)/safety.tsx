import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Safety = () => {
  const [shareTrip, setShareTrip] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [audioRecording, setAudioRecording] = useState(false);
  const [contacts, setContacts] = useState(["Alex Morgan", "Taylor Reed"]);
  const [checkIn, setCheckIn] = useState<"Off" | "5 min" | "10 min">("5 min");

  const addContact = () => {
    const nextId = contacts.length + 1;
    setContacts((prev) => [...prev, `Trusted Contact ${nextId}`]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-JakartaBold text-slate-900">Safety Settings</Text>
      </View>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-5 rounded-2xl bg-red-600 p-4">
          <Text className="text-white font-JakartaBold">Safety Toolkit Ready</Text>
          <Text className="text-red-100 text-xs mt-1">
            Share location, trigger alerts, and contact emergency services quickly.
          </Text>
          <TouchableOpacity className="mt-4 rounded-full bg-white py-3 items-center">
            <Text className="text-red-600 font-JakartaBold">Emergency SOS</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-4 rounded-2xl border border-slate-100 bg-white overflow-hidden">
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="pr-3 flex-1">
              <Text className="font-JakartaMedium text-slate-900">Share Trip Status</Text>
              <Text className="text-xs text-slate-500">Let trusted contacts track your ride live.</Text>
            </View>
            <Switch value={shareTrip} onValueChange={setShareTrip} />
          </View>
          <View className="h-px bg-slate-100" />
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="pr-3 flex-1">
              <Text className="font-JakartaMedium text-slate-900">Emergency Alerts</Text>
              <Text className="text-xs text-slate-500">Notify contacts automatically if SOS is pressed.</Text>
            </View>
            <Switch value={emergencyAlerts} onValueChange={setEmergencyAlerts} />
          </View>
          <View className="h-px bg-slate-100" />
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="pr-3 flex-1">
              <Text className="font-JakartaMedium text-slate-900">Record ride audio</Text>
              <Text className="text-xs text-slate-500">Store encrypted clips for safety reports.</Text>
            </View>
            <Switch value={audioRecording} onValueChange={setAudioRecording} />
          </View>
        </View>

        <View className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-JakartaMedium text-slate-900">Trusted Contacts</Text>
            <TouchableOpacity onPress={addContact}>
              <Text className="text-blue-600 font-JakartaMedium">+ Add</Text>
            </TouchableOpacity>
          </View>
          <View className="mt-3 gap-2">
            {contacts.map((contact) => (
              <View key={contact} className="rounded-xl border border-slate-200 px-3 py-3 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-8 w-8 rounded-full bg-slate-100 items-center justify-center">
                    <Ionicons name="person-outline" size={16} color="#334155" />
                  </View>
                  <Text className="ml-2 text-slate-800 font-JakartaMedium">{contact}</Text>
                </View>
                <TouchableOpacity onPress={() => setContacts((prev) => prev.filter((item) => item !== contact))}>
                  <Ionicons name="close-circle" size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-4 mb-8 rounded-2xl border border-slate-100 bg-white p-4">
          <Text className="font-JakartaMedium text-slate-900">Ride check-in reminder</Text>
          <Text className="text-xs text-slate-500 mt-1">Send a prompt while on trip to confirm you're okay.</Text>
          <View className="mt-3 flex-row gap-2">
            {(["Off", "5 min", "10 min"] as const).map((option) => {
              const active = checkIn === option;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setCheckIn(option)}
                  className={`px-4 py-2 rounded-full border ${
                    active ? "bg-slate-900 border-slate-900" : "bg-white border-slate-200"
                  }`}
                >
                  <Text className={`${active ? "text-white" : "text-slate-700"} font-JakartaMedium`}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity className="mt-4 rounded-xl bg-slate-100 py-3 flex-row items-center justify-center">
            <Ionicons name="shield-checkmark-outline" size={16} color="#334155" />
            <Text className="ml-2 text-slate-700 font-JakartaMedium">Run safety self-check</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Safety;
