import { useUser, useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import CustomButton from "@/components/customButton";
import { GlassView } from "@/components/GlassView";
import { CURRENCY_SYMBOL } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useTheme } from "@/lib/ThemeContext";
import { useLocationStore } from "@/store";
import { a11y, a11yButton, a11yHeader } from "@/lib/accessibility";

interface RideRequest {
  ride_id: number;
  origin_address: string;
  destination_address: string;
  fare_price: number;
  ride_time: number;
  ride_status: string;
  created_at: string;
  user: { name: string } | null;
}

const DriverHome = () => {
  const { user } = useUser();
  const { getToken, isLoaded } = useAuth();
  const { isDark, useLiquidGlass } = useTheme();
  const { userLatitude, userLongitude } = useLocationStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  const fetchRideRequests = useCallback(async () => {
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (userLatitude && userLongitude) {
        params.set("lat", String(userLatitude));
        params.set("lng", String(userLongitude));
      }
      const query = params.toString();
      const data = await fetchAPI(`/(api)/driver-ride?action=pending${query ? `&${query}` : ""}`, undefined, token);
      setRideRequests(data?.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken, userLatitude, userLongitude]);

  useEffect(() => {
    if (isLoaded) fetchRideRequests();
  }, [isLoaded, fetchRideRequests]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRideRequests();
  }, [fetchRideRequests]);

  const handleAcceptRide = async (rideId: number) => {
    setAcceptingId(rideId);
    try {
      const token = await getToken();
      await fetchAPI("/(api)/driver-ride", {
        method: "POST",
        body: JSON.stringify({ action: "accept", ride_id: rideId }),
      }, token);
      Alert.alert("Ride Accepted", "Navigate to the pickup location.", [
        { text: "OK", onPress: () => router.push("/(driver)/(tabs)/active") },
      ]);
      fetchRideRequests();
    } catch {
      Alert.alert("Error", "Failed to accept ride. Please try again.");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDeclineRide = async (rideId: number) => {
    try {
      const token = await getToken();
      await fetchAPI("/(api)/driver-ride", {
        method: "POST",
        body: JSON.stringify({ action: "decline", ride_id: rideId }),
      }, token);
      fetchRideRequests();
    } catch {
      // silent
    }
  };

  const toggleAvailability = async () => {
    try {
      const token = await getToken();
      await fetchAPI("/(api)/driver-ride", {
        method: "POST",
        body: JSON.stringify({ action: "toggle_availability", is_available: !isAvailable }),
      }, token);
      setIsAvailable(!isAvailable);
    } catch {
      Alert.alert("Error", "Failed to update availability.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500 dark:bg-dark-bg">
      <ScrollView
        contentContainerClassName="pb-24"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0286FF" colors={["#0286FF"]} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
          <View>
            <Text className="text-2xl font-JakartaExtraBold text-black dark:text-dark-text" {...a11yHeader("Driver Dashboard")}>
              Driver Dashboard
            </Text>
            <Text className="text-sm font-JakartaMedium text-general-200 dark:text-dark-text-secondary mt-1">
              {rideRequests.length} pending request{rideRequests.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <TouchableOpacity
            onPress={toggleAvailability}
            className={`rounded-full px-4 py-2 ${
              isAvailable ? "bg-success-100 dark:bg-success-900/30" : "bg-general-300 dark:bg-dark-border"
            }`}
            {...a11yButton(isAvailable ? "Go offline" : "Go online", isAvailable ? "You are currently online" : "You are currently offline")}
          >
            <Text className={`text-sm font-JakartaBold ${
              isAvailable ? "text-success-600 dark:text-success-400" : "text-general-600 dark:text-dark-text-secondary"
            }`}>
              {isAvailable ? "Online" : "Offline"}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#0286FF" />
            <Text className="text-base font-JakartaMedium text-general-200 dark:text-dark-text-secondary mt-3">
              Loading ride requests...
            </Text>
          </View>
        ) : rideRequests.length === 0 ? (
          <View className="items-center py-20 px-5">
            <Ionicons name="car-outline" size={64} color="#94a3b8" />
            <Text className="text-lg font-JakartaBold text-secondary-900 dark:text-dark-text mt-4">
              No ride requests
            </Text>
            <Text className="text-sm font-JakartaMedium text-general-200 dark:text-dark-text-secondary mt-1 text-center">
              When riders request rides nearby, they'll appear here.
            </Text>
          </View>
        ) : (
          <View className="px-5">
            {rideRequests.map((ride) => (
              <GlassView
                key={ride.ride_id}
                intensity={70}
                tint={isDark ? "systemMaterialDark" : "systemThinMaterialLight"}
                className={`rounded-2xl mb-3 p-4 ${useLiquidGlass ? "" : "bg-white dark:bg-dark-card shadow-sm"}`}
                style={useLiquidGlass ? { borderRadius: 16, overflow: "hidden" } : {}}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center">
                      <Ionicons name="person" size={18} color="#0286FF" />
                    </View>
                    <View className="ml-2">
                      <Text className="text-sm font-JakartaBold text-slate-900 dark:text-dark-text">
                        {ride.user?.name || "Rider"}
                      </Text>
                      <Text className="text-xs font-JakartaMedium text-general-200 dark:text-dark-text-secondary">
                        {formatRideTime(ride.created_at)}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-lg font-JakartaExtraBold text-primary-500">
                    {CURRENCY_SYMBOL}{ride.fare_price}
                  </Text>
                </View>

                <View className="mb-3">
                  <View className="flex-row items-start mb-2">
                    <View className="w-2 h-2 rounded-full bg-primary-500 mt-1.5" />
                    <Text className="ml-2 text-sm font-JakartaMedium text-slate-700 dark:text-dark-text flex-1" numberOfLines={1}>
                      {ride.origin_address}
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <View className="w-2 h-2 rounded-full bg-general-400 mt-1.5" />
                    <Text className="ml-2 text-sm font-JakartaMedium text-slate-700 dark:text-dark-text flex-1" numberOfLines={1}>
                      {ride.destination_address}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-xs font-JakartaMedium text-general-200 dark:text-dark-text-secondary">
                    ~{ride.ride_time} min ride
                  </Text>
                  <Text className="text-xs font-JakartaMedium text-general-200 dark:text-dark-text-secondary">
                    {formatRideTime(ride.created_at)}
                  </Text>
                </View>

                <View className="flex-row gap-3">
                  <CustomButton
                    title="Decline"
                    onPress={() => handleDeclineRide(ride.ride_id)}
                    bgVariant="secondary"
                    textVariant="primary"
                    className="flex-1"
                    disabled={acceptingId === ride.ride_id}
                  />
                  <CustomButton
                    title={acceptingId === ride.ride_id ? "Accepting..." : "Accept"}
                    onPress={() => handleAcceptRide(ride.ride_id)}
                    className="flex-1 bg-primary-500"
                    disabled={acceptingId === ride.ride_id || !isAvailable}
                  />
                </View>
              </GlassView>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

function formatRideTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

export default DriverHome;
