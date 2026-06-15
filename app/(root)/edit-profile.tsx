import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { a11y, a11yButton, a11ySwitch, a11yHeader } from "@/lib/accessibility";
import { useTheme } from "@/lib/ThemeContext";

const vehicles = ["Economy", "Comfort", "SUV", "Bike"];

const EditProfile = () => {
  const { user } = useUser();
  const { isDark } = useTheme();

  const initialName = user?.fullName || "";
  const initialEmail = user?.primaryEmailAddress?.emailAddress || "";

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState("+1 555 182 2234");
  const [bio, setBio] = useState("Usually rides in the evening.");
  const [preferredVehicle, setPreferredVehicle] = useState("Economy");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [rideUpdates, setRideUpdates] = useState(true);

  const initials = useMemo(() => {
    if (!name.trim()) return "U";
    return name
      .trim()
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [name]);

  const completion = useMemo(() => {
    const checks = [name, email, phone, bio].filter(Boolean).length;
    return Math.round((checks / 4) * 100);
  }, [name, email, phone, bio]);

  const hasChanges =
    name !== initialName ||
    email !== initialEmail ||
    phone !== "+1 555 182 2234" ||
    bio !== "Usually rides in the evening." ||
    preferredVehicle !== "Economy" ||
    marketingOptIn !== false ||
    rideUpdates !== true;

  const resetChanges = () => {
    setName(initialName);
    setEmail(initialEmail);
    setPhone("+1 555 182 2234");
    setBio("Usually rides in the evening.");
    setPreferredVehicle("Economy");
    setMarketingOptIn(false);
    setRideUpdates(true);
  };

  const handleSave = () => {
    console.log("Updated profile", {
      name,
      email,
      phone,
      bio,
      preferredVehicle,
      marketingOptIn,
      rideUpdates,
    });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-dark-bg">
      <View className="flex-row items-center justify-between px-5 py-4 bg-white dark:bg-dark-card border-b border-slate-100 dark:border-dark-border">
        <TouchableOpacity onPress={() => router.back()} {...a11yButton("Go back", "Return to profile")}>
          <Ionicons name="chevron-back" size={22} color={isDark ? "#F5F5F7" : "#0F172A"} />
        </TouchableOpacity>
        <Text className="text-lg font-JakartaBold text-slate-900 dark:text-dark-text">Edit Profile</Text>
        <TouchableOpacity onPress={resetChanges} disabled={!hasChanges} {...a11yButton("Reset changes", undefined, !hasChanges)}>
          <Text
            className={`font-JakartaMedium ${
              hasChanges ? "text-blue-600" : "text-slate-300 dark:text-dark-text-tertiary"
            }`}
          >
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-5 rounded-2xl bg-white dark:bg-dark-card p-4 border border-slate-100 dark:border-dark-border">
          <View className="flex-row items-center">
            <View className="h-16 w-16 rounded-full bg-blue-100 dark:bg-primary-800 items-center justify-center">
              <Text className="font-JakartaBold text-blue-700 dark:text-primary-300 text-xl">{initials}</Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="font-JakartaBold text-slate-900 dark:text-dark-text">{name || "Your profile"}</Text>
              <Text className="text-slate-500 dark:text-dark-text-secondary text-xs mt-1">Profile completion: {completion}%</Text>
              <View className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-dark-border overflow-hidden">
                <View style={{ width: `${completion}%` }} className="h-2 bg-emerald-500" />
              </View>
            </View>
          </View>
        </View>

        <View className="mt-5 rounded-2xl bg-white dark:bg-dark-card p-4 border border-slate-100 dark:border-dark-border">
          <Text className="text-slate-500 dark:text-dark-text-secondary mb-1">Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            className="border border-slate-200 dark:border-dark-border rounded-xl px-4 py-3 bg-slate-50 dark:bg-dark-bg text-black dark:text-dark-text"
            placeholder="Your full name"
            placeholderTextColor="#8E8E93"
            accessibilityLabel="Full name"
          />

          <Text className="text-slate-500 dark:text-dark-text-secondary mb-1 mt-4">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="border border-slate-200 dark:border-dark-border rounded-xl px-4 py-3 bg-slate-50 dark:bg-dark-bg text-black dark:text-dark-text"
            placeholder="you@email.com"
            placeholderTextColor="#8E8E93"
            accessibilityLabel="Email address"
          />

          <Text className="text-slate-500 dark:text-dark-text-secondary mb-1 mt-4">Phone Number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            className="border border-slate-200 dark:border-dark-border rounded-xl px-4 py-3 bg-slate-50 dark:bg-dark-bg text-black dark:text-dark-text"
            placeholder="+1 xxx xxx xxxx"
            placeholderTextColor="#8E8E93"
            accessibilityLabel="Phone number"
          />

          <Text className="text-slate-500 dark:text-dark-text-secondary mb-1 mt-4">Rider Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="border border-slate-200 dark:border-dark-border rounded-xl px-4 py-3 bg-slate-50 dark:bg-dark-bg text-black dark:text-dark-text min-h-20"
            placeholder="Tell drivers useful preferences"
            placeholderTextColor="#8E8E93"
            accessibilityLabel="Rider bio"
          />
        </View>

        <View className="mt-4 rounded-2xl bg-white dark:bg-dark-card p-4 border border-slate-100 dark:border-dark-border">
          <Text className="font-JakartaMedium text-slate-800 dark:text-dark-text mb-3">Preferred Ride Type</Text>
          <View className="flex-row flex-wrap gap-2" accessibilityLabel="Preferred ride type" accessibilityRole="none">
            {vehicles.map((vehicle) => {
              const selected = preferredVehicle === vehicle;
              return (
                <TouchableOpacity
                  key={vehicle}
                  onPress={() => setPreferredVehicle(vehicle)}
                  className={`px-4 py-2 rounded-full border ${
                    selected
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white dark:bg-dark-bg border-slate-200 dark:border-dark-border"
                  }`}
                  {...a11yButton(vehicle, `Select ${vehicle} as preferred ride type`, false, selected)}
                >
                  <Text
                    className={`font-JakartaMedium ${
                      selected ? "text-white" : "text-slate-700 dark:text-dark-text-secondary"
                    }`}
                  >
                    {vehicle}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="mt-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border overflow-hidden">
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="pr-3 flex-1">
              <Text className="font-JakartaMedium text-slate-900 dark:text-dark-text">Ride updates</Text>
              <Text className="text-xs text-slate-500 dark:text-dark-text-secondary">Get pickup, drop-off and delay notifications.</Text>
            </View>
            <Switch
              value={rideUpdates}
              onValueChange={setRideUpdates}
              {...a11ySwitch("Ride updates notifications", rideUpdates)}
            />
          </View>
          <View className="h-px bg-slate-100 dark:bg-dark-border" />
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="pr-3 flex-1">
              <Text className="font-JakartaMedium text-slate-900 dark:text-dark-text">Promotional messages</Text>
              <Text className="text-xs text-slate-500 dark:text-dark-text-secondary">Receive offers and discount alerts.</Text>
            </View>
            <Switch
              value={marketingOptIn}
              onValueChange={setMarketingOptIn}
              {...a11ySwitch("Promotional messages", marketingOptIn)}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges}
          className={`mt-8 mb-8 rounded-full py-4 items-center ${
            hasChanges ? "bg-emerald-500" : "bg-slate-300 dark:bg-dark-border"
          }`}
          {...a11yButton("Save Changes", "Save your profile updates", !hasChanges)}
        >
          <Text className="text-white font-JakartaBold">Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;
