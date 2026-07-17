import { useUser, useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import CustomButton from "@/components/customButton";
import { fetchAPI, useFetch } from "@/lib/fetch";
import { useTheme } from "@/lib/ThemeContext";
import { a11y, a11yButton, a11yHeader } from "@/lib/accessibility";

interface DriverProfile {
  id: number;
  first_name: string;
  last_name: string;
  profile_image_url: string;
  car_image_url: string;
  car_seats: number;
  rating: number;
  is_available: boolean;
  phone: string;
  email: string;
  vehicle_type: string;
  license_number: string;
}

const DriverProfileScreen = () => {
  const { user } = useUser();
  const { getToken, isLoaded, signOut } = useAuth();
  const { isDark } = useTheme();

  const { data: profile, loading } = useFetch<DriverProfile>(
    "/(api)/driver-ride?action=profile",
    getToken,
    isLoaded,
  );

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500 dark:bg-dark-bg">
      <ScrollView contentContainerClassName="pb-24">
        <View className="px-5 pb-3 pt-4">
          <Text
            className="font-JakartaExtraBold text-2xl text-black dark:text-dark-text"
            {...a11yHeader("Driver Profile")}
          >
            Driver Profile
          </Text>
        </View>

        {loading ? (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#0286FF" />
          </View>
        ) : (
          <>
            {/* Profile header */}
            <View className="items-center py-6">
              <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary-100 dark:bg-primary-800">
                {profile?.profile_image_url || user?.imageUrl ? (
                  <Image
                    source={{ uri: profile?.profile_image_url || user?.imageUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="font-JakartaBold text-3xl text-primary-500">
                    {profile?.first_name?.charAt(0) || user?.firstName?.charAt(0) || "?"}
                  </Text>
                )}
              </View>
              <Text className="mt-3 font-JakartaExtraBold text-xl text-black dark:text-dark-text">
                {profile?.first_name || user?.firstName} {profile?.last_name || user?.lastName}
              </Text>
              <View className="mt-1 flex-row items-center">
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text className="ml-1 font-JakartaSemiBold text-sm text-slate-600 dark:text-dark-text-secondary">
                  {profile?.rating?.toFixed(1) || "5.0"}
                </Text>
              </View>
            </View>

            {/* Vehicle info */}
            <View className="mx-5 mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
              <Text className="mb-3 font-JakartaBold text-sm uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary">
                Vehicle
              </Text>
              <View className="flex-row justify-between py-2">
                <Text className="font-JakartaMedium text-sm text-slate-600 dark:text-dark-text-secondary">
                  Type
                </Text>
                <Text className="font-JakartaSemiBold text-sm text-slate-900 dark:text-dark-text">
                  {profile?.vehicle_type || "Economy"}
                </Text>
              </View>
              <View className="flex-row justify-between border-t border-slate-100 py-2 dark:border-dark-border">
                <Text className="font-JakartaMedium text-sm text-slate-600 dark:text-dark-text-secondary">
                  Seats
                </Text>
                <Text className="font-JakartaSemiBold text-sm text-slate-900 dark:text-dark-text">
                  {profile?.car_seats || 4}
                </Text>
              </View>
              <View className="flex-row justify-between border-t border-slate-100 py-2 dark:border-dark-border">
                <Text className="font-JakartaMedium text-sm text-slate-600 dark:text-dark-text-secondary">
                  License
                </Text>
                <Text className="font-JakartaSemiBold text-sm text-slate-900 dark:text-dark-text">
                  {profile?.license_number || "N/A"}
                </Text>
              </View>
            </View>

            {/* Contact */}
            <View className="mx-5 mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
              <Text className="mb-3 font-JakartaBold text-sm uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary">
                Contact
              </Text>
              <View className="flex-row justify-between py-2">
                <Text className="font-JakartaMedium text-sm text-slate-600 dark:text-dark-text-secondary">
                  Email
                </Text>
                <Text className="font-JakartaSemiBold text-sm text-slate-900 dark:text-dark-text">
                  {profile?.email || "N/A"}
                </Text>
              </View>
              <View className="flex-row justify-between border-t border-slate-100 py-2 dark:border-dark-border">
                <Text className="font-JakartaMedium text-sm text-slate-600 dark:text-dark-text-secondary">
                  Phone
                </Text>
                <Text className="font-JakartaSemiBold text-sm text-slate-900 dark:text-dark-text">
                  {profile?.phone || "N/A"}
                </Text>
              </View>
            </View>

            {/* Sign out */}
            <View className="mx-5">
              <CustomButton
                title="Sign Out"
                onPress={handleSignOut}
                bgVariant="danger"
                className="w-full"
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverProfileScreen;
