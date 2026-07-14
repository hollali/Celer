import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import * as Linking from "expo-linking";
import { SafeAreaView } from "react-native-safe-area-context";
import { a11y, a11yButton, a11ySwitch, a11yHeader } from "@/lib/accessibility";
import { useTheme } from "@/lib/ThemeContext";

const GHANA_EMERGENCY = "191"; // Ghana Police

const Safety = () => {
  const { isDark, useLiquidGlass } = useTheme();
  const [shareTrip, setShareTrip] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [audioRecording, setAudioRecording] = useState(false);
  const [contacts, setContacts] = useState(["Alex Morgan", "Taylor Reed"]);
  const [checkIn, setCheckIn] = useState<"Off" | "5 min" | "10 min">("5 min");

  const addContact = () => {
    const nextId = contacts.length + 1;
    setContacts((prev) => [...prev, `Trusted Contact ${nextId}`]);
  };

  const handleSOS = () => {
    Alert.alert(
      "Emergency SOS",
      "This will call Ghana Police (191). Your location will be shared with trusted contacts.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call Now",
          style: "destructive",
          onPress: () => {
            Linking.openURL(`tel:${GHANA_EMERGENCY}`);
          },
        },
      ]
    );
  };

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
          <Text className="ml-4 text-lg font-JakartaBold text-slate-900 dark:text-dark-text" {...a11yHeader("Safety Settings")}>Safety Settings</Text>
        </BlurView>
      ) : (
      <View className="flex-row items-center px-5 py-4 bg-white dark:bg-dark-card border-b border-slate-100 dark:border-dark-border">
        <TouchableOpacity onPress={() => router.back()} {...a11yButton("Go back")}>
          <Ionicons name="chevron-back" size={22} color={isDark ? "#F5F5F7" : "#0F172A"} />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-JakartaBold text-slate-900 dark:text-dark-text" {...a11yHeader("Safety Settings")}>Safety Settings</Text>
      </View>
      )}

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-5 rounded-2xl bg-red-600 dark:bg-red-700 p-4">
          <Text className="text-white font-JakartaBold">Safety Toolkit Ready</Text>
          <Text className="text-red-100 text-xs mt-1">
            Share location, trigger alerts, and contact emergency services quickly.
          </Text>
          <TouchableOpacity
            className="mt-4 rounded-full bg-white py-3 items-center"
            onPress={handleSOS}
            {...a11yButton("Emergency SOS", "Contact emergency services immediately")}
          >
            <Text className="text-red-600 font-JakartaBold">Emergency SOS</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-4 rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden">
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="pr-3 flex-1">
              <Text className="font-JakartaMedium text-slate-900 dark:text-dark-text">Share Trip Status</Text>
              <Text className="text-xs text-slate-500 dark:text-dark-text-secondary">Let trusted contacts track your ride live.</Text>
            </View>
            <Switch value={shareTrip} onValueChange={setShareTrip} {...a11ySwitch("Share trip status", shareTrip)} />
          </View>
          <View className="h-px bg-slate-100 dark:bg-dark-border" />
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="pr-3 flex-1">
              <Text className="font-JakartaMedium text-slate-900 dark:text-dark-text">Emergency Alerts</Text>
              <Text className="text-xs text-slate-500 dark:text-dark-text-secondary">Notify contacts automatically if SOS is pressed.</Text>
            </View>
            <Switch value={emergencyAlerts} onValueChange={setEmergencyAlerts} {...a11ySwitch("Emergency alerts", emergencyAlerts)} />
          </View>
          <View className="h-px bg-slate-100 dark:bg-dark-border" />
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="pr-3 flex-1">
              <Text className="font-JakartaMedium text-slate-900 dark:text-dark-text">Record ride audio</Text>
              <Text className="text-xs text-slate-500 dark:text-dark-text-secondary">Store encrypted clips for safety reports.</Text>
            </View>
            <Switch value={audioRecording} onValueChange={setAudioRecording} {...a11ySwitch("Record ride audio", audioRecording)} />
          </View>
        </View>

        <View className="mt-4 rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-JakartaMedium text-slate-900 dark:text-dark-text">Trusted Contacts</Text>
            <TouchableOpacity onPress={addContact} {...a11yButton("Add trusted contact")}>
              <Text className="text-blue-600 dark:text-blue-400 font-JakartaMedium">+ Add</Text>
            </TouchableOpacity>
          </View>
          <View className="mt-3 gap-2">
            {contacts.map((contact) => (
              <View key={contact} className="rounded-xl border border-slate-200 dark:border-dark-border px-3 py-3 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-8 w-8 rounded-full bg-slate-100 dark:bg-dark-bg items-center justify-center">
                    <Ionicons name="person-outline" size={16} color={isDark ? "#F5F5F7" : "#334155"} />
                  </View>
                  <Text className="ml-2 text-slate-800 dark:text-dark-text font-JakartaMedium">{contact}</Text>
                </View>
                <TouchableOpacity onPress={() => setContacts((prev) => prev.filter((item) => item !== contact))} {...a11yButton(`Remove ${contact}`)}>
                  <Ionicons name="close-circle" size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-4 mb-8 rounded-2xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card p-4">
          <Text className="font-JakartaMedium text-slate-900 dark:text-dark-text">Ride check-in reminder</Text>
          <Text className="text-xs text-slate-500 dark:text-dark-text-secondary mt-1">Send a prompt while on trip to confirm you're okay.</Text>
          <View className="mt-3 flex-row gap-2" accessibilityLabel="Check-in reminder interval" accessibilityRole="none">
            {(["Off", "5 min", "10 min"] as const).map((option) => {
              const active = checkIn === option;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setCheckIn(option)}
                  className={`px-4 py-2 rounded-full border ${
                    active ? "bg-slate-900 dark:bg-primary-500 border-slate-900 dark:border-primary-500" : "bg-white dark:bg-dark-bg border-slate-200 dark:border-dark-border"
                  }`}
                  {...a11yButton(option, `Set check-in to ${option}`, false, active)}
                >
                  <Text className={`${active ? "text-white" : "text-slate-700 dark:text-dark-text-secondary"} font-JakartaMedium`}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            className="mt-4 rounded-xl bg-slate-100 dark:bg-dark-card py-3 flex-row items-center justify-center"
            onPress={() => {
              Alert.alert(
                "Safety Check",
                `✓ Location sharing: ${shareTrip ? "On" : "Off"}\n✓ Emergency alerts: ${emergencyAlerts ? "On" : "Off"}\n✓ Audio recording: ${audioRecording ? "On" : "Off"}\n✓ Trusted contacts: ${contacts.length}\n✓ Check-in reminder: ${checkIn}`,
                [{ text: "OK" }]
              );
            }}
            {...a11yButton("Run safety self-check")}
          >
            <Ionicons name="shield-checkmark-outline" size={16} color={isDark ? "#F5F5F7" : "#334155"} />
            <Text className="ml-2 text-slate-700 dark:text-dark-text font-JakartaMedium">Run safety self-check</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Safety;
