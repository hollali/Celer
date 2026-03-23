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

const vehicles = ["Economy", "Comfort", "SUV", "Bike"];

const EditProfile = () => {
  const { user } = useUser();

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
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text className="text-lg font-JakartaBold text-slate-900">Edit Profile</Text>
        <TouchableOpacity onPress={resetChanges} disabled={!hasChanges}>
          <Text
            className={`font-JakartaMedium ${
              hasChanges ? "text-blue-600" : "text-slate-300"
            }`}
          >
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-5 rounded-2xl bg-white p-4 border border-slate-100">
          <View className="flex-row items-center">
            <View className="h-16 w-16 rounded-full bg-blue-100 items-center justify-center">
              <Text className="font-JakartaBold text-blue-700 text-xl">{initials}</Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="font-JakartaBold text-slate-900">{name || "Your profile"}</Text>
              <Text className="text-slate-500 text-xs mt-1">Profile completion: {completion}%</Text>
              <View className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                <View style={{ width: `${completion}%` }} className="h-2 bg-emerald-500" />
              </View>
            </View>
          </View>
        </View>

        <View className="mt-5 rounded-2xl bg-white p-4 border border-slate-100">
          <Text className="text-slate-500 mb-1">Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            className="border border-slate-200 rounded-xl px-4 py-3 bg-slate-50"
            placeholder="Your full name"
          />

          <Text className="text-slate-500 mb-1 mt-4">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="border border-slate-200 rounded-xl px-4 py-3 bg-slate-50"
            placeholder="you@email.com"
          />

          <Text className="text-slate-500 mb-1 mt-4">Phone Number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            className="border border-slate-200 rounded-xl px-4 py-3 bg-slate-50"
            placeholder="+1 xxx xxx xxxx"
          />

          <Text className="text-slate-500 mb-1 mt-4">Rider Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 min-h-20"
            placeholder="Tell drivers useful preferences"
          />
        </View>

        <View className="mt-4 rounded-2xl bg-white p-4 border border-slate-100">
          <Text className="font-JakartaMedium text-slate-800 mb-3">Preferred Ride Type</Text>
          <View className="flex-row flex-wrap gap-2">
            {vehicles.map((vehicle) => {
              const selected = preferredVehicle === vehicle;
              return (
                <TouchableOpacity
                  key={vehicle}
                  onPress={() => setPreferredVehicle(vehicle)}
                  className={`px-4 py-2 rounded-full border ${
                    selected
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <Text
                    className={`font-JakartaMedium ${
                      selected ? "text-white" : "text-slate-700"
                    }`}
                  >
                    {vehicle}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="mt-4 rounded-2xl bg-white border border-slate-100 overflow-hidden">
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="pr-3 flex-1">
              <Text className="font-JakartaMedium text-slate-900">Ride updates</Text>
              <Text className="text-xs text-slate-500">Get pickup, drop-off and delay notifications.</Text>
            </View>
            <Switch value={rideUpdates} onValueChange={setRideUpdates} />
          </View>
          <View className="h-px bg-slate-100" />
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="pr-3 flex-1">
              <Text className="font-JakartaMedium text-slate-900">Promotional messages</Text>
              <Text className="text-xs text-slate-500">Receive offers and discount alerts.</Text>
            </View>
            <Switch value={marketingOptIn} onValueChange={setMarketingOptIn} />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges}
          className={`mt-8 mb-8 rounded-full py-4 items-center ${
            hasChanges ? "bg-emerald-500" : "bg-slate-300"
          }`}
        >
          <Text className="text-white font-JakartaBold">Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;
