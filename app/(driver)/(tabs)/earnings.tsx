import { useAuth } from "@clerk/clerk-expo";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { CURRENCY_SYMBOL } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useTheme } from "@/lib/ThemeContext";
import { a11yHeader } from "@/lib/accessibility";

interface EarningsData {
  total_earnings: number;
  today_earnings: number;
  week_earnings: number;
  total_rides: number;
  today_rides: number;
  recent_rides: {
    ride_id: number;
    origin_address: string;
    destination_address: string;
    fare_price: number;
    completed_at: string;
  }[];
}

const Earnings = () => {
  const { getToken, isLoaded } = useAuth();
  const { isDark, useLiquidGlass } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);

  const fetchEarnings = useCallback(async () => {
    try {
      const token = await getToken();
      const data = await fetchAPI("/(api)/driver-ride?action=earnings", undefined, token);
      setEarnings(data?.data || null);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isLoaded) fetchEarnings();
  }, [isLoaded, fetchEarnings]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEarnings();
  }, [fetchEarnings]);

  return (
    <SafeAreaView className="flex-1 bg-general-500 dark:bg-dark-bg">
      <ScrollView
        contentContainerClassName="pb-24"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0286FF" colors={["#0286FF"]} />
        }
      >
        <View className="px-5 pt-4 pb-3">
          <Text className="text-2xl font-JakartaExtraBold text-black dark:text-dark-text" {...a11yHeader("Earnings")}>
            Earnings
          </Text>
        </View>

        {loading ? (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#0286FF" />
          </View>
        ) : (
          <>
            {/* Summary cards */}
            <View className="flex-row gap-3 px-5 mb-4">
              <View className="flex-1 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-4">
                <Text className="text-xs font-JakartaBold text-slate-400 dark:text-dark-text-secondary uppercase">Today</Text>
                <Text className="text-xl font-JakartaExtraBold text-primary-500 mt-1">
                  {CURRENCY_SYMBOL}{earnings?.today_earnings?.toFixed(2) || "0.00"}
                </Text>
                <Text className="text-xs font-JakartaMedium text-general-200 dark:text-dark-text-secondary mt-1">
                  {earnings?.today_rides || 0} rides
                </Text>
              </View>
              <View className="flex-1 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-4">
                <Text className="text-xs font-JakartaBold text-slate-400 dark:text-dark-text-secondary uppercase">This Week</Text>
                <Text className="text-xl font-JakartaExtraBold text-success-500 mt-1">
                  {CURRENCY_SYMBOL}{earnings?.week_earnings?.toFixed(2) || "0.00"}
                </Text>
                <Text className="text-xs font-JakartaMedium text-general-200 dark:text-dark-text-secondary mt-1">
                  {earnings?.total_rides || 0} total rides
                </Text>
              </View>
            </View>

            {/* All-time */}
            <View className="mx-5 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-4 mb-4">
              <Text className="text-sm font-JakartaBold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider mb-2">
                All-time earnings
              </Text>
              <Text className="text-3xl font-JakartaExtraBold text-primary-500">
                {CURRENCY_SYMBOL}{earnings?.total_earnings?.toFixed(2) || "0.00"}
              </Text>
            </View>

            {/* Recent completed rides */}
            <View className="mx-5 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-4">
              <Text className="text-sm font-JakartaBold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider mb-3">
                Recent rides
              </Text>
              {earnings?.recent_rides?.length ? (
                earnings.recent_rides.map((ride) => (
                  <View key={ride.ride_id} className="flex-row items-center justify-between py-3 border-b border-slate-100 dark:border-dark-border last:border-0">
                    <View className="flex-1 mr-3">
                      <Text className="text-sm font-JakartaSemiBold text-slate-900 dark:text-dark-text" numberOfLines={1}>
                        {ride.origin_address} → {ride.destination_address}
                      </Text>
                      <Text className="text-xs font-JakartaMedium text-general-200 dark:text-dark-text-secondary mt-1">
                        {formatDate(ride.completed_at)}
                      </Text>
                    </View>
                    <Text className="text-sm font-JakartaBold text-success-600 dark:text-success-400">
                      +{CURRENCY_SYMBOL}{ride.fare_price}
                    </Text>
                  </View>
                ))
              ) : (
                <View className="items-center py-8">
                  <Ionicons name="receipt-outline" size={40} color="#94a3b8" />
                  <Text className="text-sm font-JakartaMedium text-general-200 dark:text-dark-text-secondary mt-2">
                    No completed rides yet
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" });
}

export default Earnings;
