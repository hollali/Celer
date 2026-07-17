import { useUser, useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { fetchAPI, useFetch } from "@/lib/fetch";

const vehicles = ["Economy", "Comfort", "SUV", "Bike"];

const EditProfile = () => {
  const { user } = useUser();
  const { isDark } = useTheme();
  const { getToken, isLoaded } = useAuth();

  const { data: profileData, loading: profileLoading } = useFetch<{
    data: {
      name: string;
      email: string;
      phone: string;
      bio: string;
      preferred_vehicle: string;
      marketing_opt_in: boolean;
      ride_updates: boolean;
    };
  }>("/(api)/user", getToken, isLoaded);

  const profile = profileData?.data;

  const initialName = profile?.name ?? user?.fullName ?? "";
  const initialEmail = profile?.email ?? user?.primaryEmailAddress?.emailAddress ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [preferredVehicle, setPreferredVehicle] = useState("Economy");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [rideUpdates, setRideUpdates] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileLoaded, setProfileLoaded] = useState(false);

  if (profile && !profileLoaded) {
    setName(profile.name || initialName);
    setEmail(profile.email || initialEmail);
    setPhone(profile.phone || "");
    setBio(profile.bio || "");
    setPreferredVehicle(profile.preferred_vehicle || "Economy");
    setMarketingOptIn(profile.marketing_opt_in ?? false);
    setRideUpdates(profile.ride_updates ?? true);
    setProfileLoaded(true);
  }

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
    phone !== (profile?.phone || "") ||
    bio !== (profile?.bio || "") ||
    preferredVehicle !== (profile?.preferred_vehicle || "Economy") ||
    marketingOptIn !== (profile?.marketing_opt_in ?? false) ||
    rideUpdates !== (profile?.ride_updates ?? true);

  const resetChanges = () => {
    setName(initialName);
    setEmail(initialEmail);
    setPhone(profile?.phone || "");
    setBio(profile?.bio || "");
    setPreferredVehicle(profile?.preferred_vehicle || "Economy");
    setMarketingOptIn(profile?.marketing_opt_in ?? false);
    setRideUpdates(profile?.ride_updates ?? true);
  };

  const handleSave = async () => {
    if (!hasChanges || saving) return;
    setSaving(true);
    try {
      const token = await getToken();
      await fetchAPI(
        "/(api)/user",
        {
          method: "PATCH",
          body: JSON.stringify({
            name,
            email,
            phone,
            bio,
            preferred_vehicle: preferredVehicle,
            marketing_opt_in: marketingOptIn,
            ride_updates: rideUpdates,
          }),
        },
        token,
      );
      Alert.alert("Profile Updated", "Your profile has been saved.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading && !profileLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-dark-bg">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={isDark ? "#818CF8" : "#4F46E5"} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-dark-bg">
      <View className="flex-row items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-dark-border dark:bg-dark-card">
        <TouchableOpacity
          onPress={() => router.back()}
          {...a11yButton("Go back", "Return to profile")}
        >
          <Ionicons name="chevron-back" size={22} color={isDark ? "#F5F5F7" : "#0F172A"} />
        </TouchableOpacity>
        <Text className="font-JakartaBold text-lg text-slate-900 dark:text-dark-text">
          Edit Profile
        </Text>
        <TouchableOpacity
          onPress={resetChanges}
          disabled={!hasChanges}
          {...a11yButton("Reset changes", undefined, !hasChanges)}
        >
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
        <View className="mt-5 rounded-2xl border border-slate-100 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
          <View className="flex-row items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-primary-800">
              <Text className="font-JakartaBold text-xl text-blue-700 dark:text-primary-300">
                {initials}
              </Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="font-JakartaBold text-slate-900 dark:text-dark-text">
                {name || "Your profile"}
              </Text>
              <Text className="mt-1 text-xs text-slate-500 dark:text-dark-text-secondary">
                Profile completion: {completion}%
              </Text>
              <View className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-dark-border">
                <View style={{ width: `${completion}%` }} className="h-2 bg-emerald-500" />
              </View>
            </View>
          </View>
        </View>

        <View className="mt-5 rounded-2xl border border-slate-100 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
          <Text className="mb-1 text-slate-500 dark:text-dark-text-secondary">Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-black dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
            placeholder="Your full name"
            placeholderTextColor="#8E8E93"
            accessibilityLabel="Full name"
          />

          <Text className="mb-1 mt-4 text-slate-500 dark:text-dark-text-secondary">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-black dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
            placeholder="you@email.com"
            placeholderTextColor="#8E8E93"
            accessibilityLabel="Email address"
          />

          <Text className="mb-1 mt-4 text-slate-500 dark:text-dark-text-secondary">
            Phone Number
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-black dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
            placeholder="+1 xxx xxx xxxx"
            placeholderTextColor="#8E8E93"
            accessibilityLabel="Phone number"
          />

          <Text className="mb-1 mt-4 text-slate-500 dark:text-dark-text-secondary">Rider Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="min-h-20 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-black dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
            placeholder="Tell drivers useful preferences"
            placeholderTextColor="#8E8E93"
            accessibilityLabel="Rider bio"
          />
        </View>

        <View className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
          <Text className="mb-3 font-JakartaMedium text-slate-800 dark:text-dark-text">
            Preferred Ride Type
          </Text>
          <View
            className="flex-row flex-wrap gap-2"
            accessibilityLabel="Preferred ride type"
            accessibilityRole="none"
          >
            {vehicles.map((vehicle) => {
              const selected = preferredVehicle === vehicle;
              return (
                <TouchableOpacity
                  key={vehicle}
                  onPress={() => setPreferredVehicle(vehicle)}
                  className={`rounded-full border px-4 py-2 ${
                    selected
                      ? "border-blue-600 bg-blue-600"
                      : "border-slate-200 bg-white dark:border-dark-border dark:bg-dark-bg"
                  }`}
                  {...a11yButton(
                    vehicle,
                    `Select ${vehicle} as preferred ride type`,
                    false,
                    selected,
                  )}
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

        <View className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-dark-border dark:bg-dark-card">
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-1 pr-3">
              <Text className="font-JakartaMedium text-slate-900 dark:text-dark-text">
                Ride updates
              </Text>
              <Text className="text-xs text-slate-500 dark:text-dark-text-secondary">
                Get pickup, drop-off and delay notifications.
              </Text>
            </View>
            <Switch
              value={rideUpdates}
              onValueChange={setRideUpdates}
              {...a11ySwitch("Ride updates notifications", rideUpdates)}
            />
          </View>
          <View className="h-px bg-slate-100 dark:bg-dark-border" />
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-1 pr-3">
              <Text className="font-JakartaMedium text-slate-900 dark:text-dark-text">
                Promotional messages
              </Text>
              <Text className="text-xs text-slate-500 dark:text-dark-text-secondary">
                Receive offers and discount alerts.
              </Text>
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
          disabled={!hasChanges || saving}
          className={`mb-8 mt-8 items-center rounded-full py-4 ${
            hasChanges && !saving ? "bg-emerald-500" : "bg-slate-300 dark:bg-dark-border"
          }`}
          {...a11yButton("Save Changes", "Save your profile updates", !hasChanges || saving)}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-JakartaBold text-white">Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;
