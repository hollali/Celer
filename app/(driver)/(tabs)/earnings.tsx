import { useAuth } from "@clerk/clerk-expo";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
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
            {...a11yHeader("Earnings")}
          >
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
            <View className="mb-4 flex-row gap-3 px-5">
              <View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
                <Text className="font-JakartaBold text-xs uppercase text-slate-400 dark:text-dark-text-secondary">
                  Today
                </Text>
                <Text className="mt-1 font-JakartaExtraBold text-xl text-primary-500">
                  {CURRENCY_SYMBOL}
                  {earnings?.today_earnings?.toFixed(2) || "0.00"}
                </Text>
                <Text className="mt-1 font-JakartaMedium text-xs text-general-200 dark:text-dark-text-secondary">
                  {earnings?.today_rides || 0} rides
                </Text>
              </View>
              <View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
                <Text className="font-JakartaBold text-xs uppercase text-slate-400 dark:text-dark-text-secondary">
                  This Week
                </Text>
                <Text className="mt-1 font-JakartaExtraBold text-xl text-success-500">
                  {CURRENCY_SYMBOL}
                  {earnings?.week_earnings?.toFixed(2) || "0.00"}
                </Text>
                <Text className="mt-1 font-JakartaMedium text-xs text-general-200 dark:text-dark-text-secondary">
                  {earnings?.total_rides || 0} total rides
                </Text>
              </View>
            </View>

            {/* All-time */}
            <View className="mx-5 mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
              <Text className="mb-2 font-JakartaBold text-sm uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary">
                All-time earnings
              </Text>
              <Text className="font-JakartaExtraBold text-3xl text-primary-500">
                {CURRENCY_SYMBOL}
                {earnings?.total_earnings?.toFixed(2) || "0.00"}
              </Text>
            </View>

            {/* Recent completed rides */}
            <View className="mx-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
              <Text className="mb-3 font-JakartaBold text-sm uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary">
                Recent rides
              </Text>
              {earnings?.recent_rides?.length ? (
                earnings.recent_rides.map((ride) => (
                  <View
                    key={ride.ride_id}
                    className="flex-row items-center justify-between border-b border-slate-100 py-3 last:border-0 dark:border-dark-border"
                  >
                    <View className="mr-3 flex-1">
                      <Text
                        className="font-JakartaSemiBold text-sm text-slate-900 dark:text-dark-text"
                        numberOfLines={1}
                      >
                        {ride.origin_address} → {ride.destination_address}
                      </Text>
                      <Text className="mt-1 font-JakartaMedium text-xs text-general-200 dark:text-dark-text-secondary">
                        {formatDate(ride.completed_at)}
                      </Text>
                    </View>
                    <Text className="font-JakartaBold text-sm text-success-600 dark:text-success-400">
                      +{CURRENCY_SYMBOL}
                      {ride.fare_price}
                    </Text>
                  </View>
                ))
              ) : (
                <View className="items-center py-8">
                  <Ionicons name="receipt-outline" size={40} color="#94a3b8" />
                  <Text className="mt-2 font-JakartaMedium text-sm text-general-200 dark:text-dark-text-secondary">
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
