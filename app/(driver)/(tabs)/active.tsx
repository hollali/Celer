import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import CustomButton from "@/components/customButton";
import { CURRENCY_SYMBOL } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useTheme } from "@/lib/ThemeContext";
import { a11y, a11yButton, a11yHeader } from "@/lib/accessibility";

interface ActiveRide {
  ride_id: number;
  origin_address: string;
  destination_address: string;
  fare_price: number;
  ride_time: number;
  ride_status: "accepted" | "in_progress";
  created_at: string;
  user: { name: string; phone?: string } | null;
}

const ActiveRide = () => {
  const { getToken, isLoaded } = useAuth();
  const { isDark, useLiquidGlass } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchActiveRide = useCallback(async () => {
    try {
      const token = await getToken();
      const data = await fetchAPI("/(api)/driver-ride?action=active", undefined, token);
      setActiveRide(data?.data || null);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isLoaded) fetchActiveRide();
  }, [isLoaded, fetchActiveRide]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchActiveRide();
  }, [fetchActiveRide]);

  const handleStartRide = async () => {
    if (!activeRide) return;
    setUpdating(true);
    try {
      const token = await getToken();
      await fetchAPI(
        "/(api)/driver-ride",
        {
          method: "POST",
          body: JSON.stringify({ action: "start", ride_id: activeRide.ride_id }),
        },
        token,
      );
      fetchActiveRide();
    } catch {
      Alert.alert("Error", "Failed to start ride.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteRide = async () => {
    if (!activeRide) return;
    setUpdating(true);
    try {
      const token = await getToken();
      await fetchAPI(
        "/(api)/driver-ride",
        {
          method: "POST",
          body: JSON.stringify({ action: "complete", ride_id: activeRide.ride_id }),
        },
        token,
      );
      Alert.alert("Ride Completed", "Great work! The ride has been completed.", [
        { text: "OK", onPress: () => fetchActiveRide() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to complete ride.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelRide = () => {
    if (!activeRide) return;
    Alert.alert("Cancel Ride", "Are you sure you want to cancel this ride?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          setUpdating(true);
          try {
            const token = await getToken();
            await fetchAPI(
              "/(api)/driver-ride",
              {
                method: "POST",
                body: JSON.stringify({ action: "cancel", ride_id: activeRide.ride_id }),
              },
              token,
            );
            fetchActiveRide();
          } catch {
            Alert.alert("Error", "Failed to cancel ride.");
          } finally {
            setUpdating(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500 dark:bg-dark-bg">
      <ScrollView
        contentContainerClassName="pb-24"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0286FF"
            colors={["#0286FF"]}
          />
        }
      >
        <View className="px-5 pb-3 pt-4">
          <Text
            className="font-JakartaExtraBold text-2xl text-black dark:text-dark-text"
            {...a11yHeader("Active Ride")}
          >
            Active Ride
          </Text>
        </View>

        {loading ? (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#0286FF" />
          </View>
        ) : !activeRide ? (
          <View className="items-center px-5 py-20">
            <Ionicons name="checkmark-circle-outline" size={64} color="#94a3b8" />
            <Text className="mt-4 font-JakartaBold text-lg text-secondary-900 dark:text-dark-text">
              No active ride
            </Text>
            <Text className="mt-1 text-center font-JakartaMedium text-sm text-general-200 dark:text-dark-text-secondary">
              Accept a ride request to get started.
            </Text>
          </View>
        ) : (
          <View className="px-5">
            {/* Status badge */}
            <View
              className={`mb-4 self-start rounded-full px-4 py-2 ${
                activeRide.ride_status === "accepted"
                  ? "bg-warning-100 dark:bg-warning-900/30"
                  : "bg-success-100 dark:bg-success-900/30"
              }`}
            >
              <Text
                className={`font-JakartaBold text-sm ${
                  activeRide.ride_status === "accepted"
                    ? "text-warning-600 dark:text-warning-400"
                    : "text-success-600 dark:text-success-400"
                }`}
              >
                {activeRide.ride_status === "accepted" ? "Heading to pickup" : "Ride in progress"}
              </Text>
            </View>

            {/* Rider info */}
            <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
              <Text className="mb-3 font-JakartaBold text-sm uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary">
                Rider
              </Text>
              <View className="flex-row items-center">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-800">
                  <Ionicons name="person" size={22} color="#0286FF" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-JakartaSemiBold text-base text-slate-900 dark:text-dark-text">
                    {activeRide.user?.name || "Rider"}
                  </Text>
                  <Text className="font-JakartaMedium text-sm text-slate-500 dark:text-dark-text-secondary">
                    {activeRide.user?.phone || "No phone number"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Route */}
            <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
              <Text className="mb-3 font-JakartaBold text-sm uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary">
                Route
              </Text>
              <View className="mb-3 flex-row items-start">
                <View className="mt-2 h-2 w-2 rounded-full bg-primary-500" />
                <View className="ml-3 flex-1">
                  <Text className="font-JakartaMedium text-xs text-slate-500 dark:text-dark-text-secondary">
                    Pickup
                  </Text>
                  <Text className="font-JakartaSemiBold text-sm text-slate-900 dark:text-dark-text">
                    {activeRide.origin_address}
                  </Text>
                </View>
              </View>
              <View className="mb-3 ml-[3px] h-4 border-l-2 border-dashed border-slate-300 dark:border-dark-border" />
              <View className="flex-row items-start">
                <View className="mt-2 h-2 w-2 rounded-full bg-general-400" />
                <View className="ml-3 flex-1">
                  <Text className="font-JakartaMedium text-xs text-slate-500 dark:text-dark-text-secondary">
                    Drop-off
                  </Text>
                  <Text className="font-JakartaSemiBold text-sm text-slate-900 dark:text-dark-text">
                    {activeRide.destination_address}
                  </Text>
                </View>
              </View>
            </View>

            {/* Fare */}
            <View className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
              <View className="flex-row items-center justify-between">
                <Text className="font-JakartaMedium text-base text-slate-700 dark:text-dark-text">
                  Fare
                </Text>
                <Text className="font-JakartaExtraBold text-xl text-primary-500">
                  {CURRENCY_SYMBOL}
                  {activeRide.fare_price}
                </Text>
              </View>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="font-JakartaMedium text-sm text-slate-500 dark:text-dark-text-secondary">
                  Duration
                </Text>
                <Text className="font-JakartaSemiBold text-sm text-slate-900 dark:text-dark-text">
                  ~{activeRide.ride_time} min
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row gap-3">
              {activeRide.ride_status === "accepted" ? (
                <>
                  <CustomButton
                    title="Cancel"
                    onPress={handleCancelRide}
                    bgVariant="secondary"
                    textVariant="primary"
                    className="flex-1"
                    disabled={updating}
                  />
                  <CustomButton
                    title={updating ? "Starting..." : "Start Ride"}
                    onPress={handleStartRide}
                    className="flex-1 bg-primary-500"
                    disabled={updating}
                  />
                </>
              ) : (
                <>
                  <CustomButton
                    title="Cancel"
                    onPress={handleCancelRide}
                    bgVariant="secondary"
                    textVariant="primary"
                    className="flex-1"
                    disabled={updating}
                  />
                  <CustomButton
                    title={updating ? "Completing..." : "Complete Ride"}
                    onPress={handleCompleteRide}
                    className="flex-1 bg-success-500"
                    disabled={updating}
                  />
                </>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ActiveRide;
