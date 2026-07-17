import { useUser, useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images, CURRENCY_SYMBOL } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { formatDate, formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";
import { a11y, a11yButton, a11yImage, a11yHeader } from "@/lib/accessibility";
import { useTheme } from "@/lib/ThemeContext";

type RideStatus = "paid" | "pending" | "canceled";
const filters = ["All", "Paid", "Pending"] as const;

const RideHistory = () => {
  const { user } = useUser();
  const { isDark } = useTheme();
  const { getToken, isLoaded } = useAuth();

  const {
    data: rides,
    loading,
    refetch,
    error,
  } = useFetch<Ride[]>("/(api)/ride", getToken, isLoaded);

  const [selectedFilter, setSelectedFilter] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");

  const filteredRides = useMemo(() => {
    if (!rides) return [];
    const text = query.trim().toLowerCase();
    return rides.filter((ride) => {
      const statusMatch =
        selectedFilter === "All" ||
        ride.payment_status.toLowerCase() === selectedFilter.toLowerCase();
      const queryMatch =
        !text ||
        ride.origin_address.toLowerCase().includes(text) ||
        ride.destination_address.toLowerCase().includes(text);
      return statusMatch && queryMatch;
    });
  }, [rides, selectedFilter, query]);

  const totalSpend = useMemo(() => {
    if (!rides) return "0.00";
    return rides
      .filter((ride) => ride.payment_status === "paid")
      .reduce((sum, ride) => sum + Number(ride.fare_price), 0)
      .toFixed(2);
  }, [rides]);

  const statusBadge = (status: string) => {
    const isPaid = status === "paid";
    return (
      <Text
        className={`rounded-full px-2 py-1 text-xs ${
          isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
        }`}
      >
        {isPaid ? "Completed" : "Pending"}
      </Text>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-dark-bg">
      <View className="flex-row items-center border-b border-slate-100 bg-white px-5 py-4 dark:border-dark-border dark:bg-dark-card">
        <TouchableOpacity onPress={() => router.back()} {...a11yButton("Go back")}>
          <Ionicons name="chevron-back" size={22} color={isDark ? "#F5F5F7" : "#0F172A"} />
        </TouchableOpacity>
        <Text
          className="ml-4 font-JakartaBold text-lg text-slate-900 dark:text-dark-text"
          {...a11yHeader("Ride History")}
        >
          Ride History
        </Text>
      </View>

      <ScrollView
        className="px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor="#0286FF"
            colors={["#0286FF"]}
          />
        }
      >
        {error && (
          <View className="mt-4 rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
            <Text className="text-center font-JakartaMedium text-red-600 dark:text-red-400">
              {error}
            </Text>
            <TouchableOpacity onPress={refetch} className="mt-2">
              <Text className="text-center font-JakartaBold text-primary-500">Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        <View className="mt-5 flex-row gap-2">
          <View className="flex-1 rounded-2xl border border-slate-100 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
            <Text className="text-xs text-slate-500 dark:text-dark-text-secondary">
              Total rides
            </Text>
            <Text className="mt-1 font-JakartaBold text-xl text-slate-900 dark:text-dark-text">
              {rides?.length || 0}
            </Text>
          </View>
          <View className="flex-1 rounded-2xl border border-slate-100 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
            <Text className="text-xs text-slate-500 dark:text-dark-text-secondary">
              Total spend
            </Text>
            <Text className="mt-1 font-JakartaBold text-xl text-slate-900 dark:text-dark-text">
              {CURRENCY_SYMBOL}
              {totalSpend}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center rounded-xl border border-slate-200 bg-white px-3 dark:border-dark-border dark:bg-dark-card">
          <Ionicons name="search" size={16} color="#64748b" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search destinations"
            placeholderTextColor="#8E8E93"
            className="flex-1 px-2 py-3 text-black dark:text-dark-text"
            accessibilityLabel="Search ride destinations"
          />
        </View>

        <View
          className="mt-4 flex-row gap-2"
          accessibilityLabel="Filter rides by status"
          accessibilityRole="none"
        >
          {filters.map((filter) => {
            const active = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                className={`rounded-full border px-4 py-2 ${
                  active
                    ? "border-slate-900 bg-slate-900 dark:border-primary-500 dark:bg-primary-500"
                    : "border-slate-200 bg-white dark:border-dark-border dark:bg-dark-card"
                }`}
                {...a11yButton(filter, `Show ${filter.toLowerCase()} rides`, false, active)}
              >
                <Text
                  className={`${active ? "text-white" : "text-slate-700 dark:text-dark-text-secondary"} font-JakartaMedium`}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mb-8 mt-4">
          {loading ? (
            <View className="items-center py-20" accessibilityLabel="Loading rides">
              <ActivityIndicator size="large" color="#0286FF" />
            </View>
          ) : filteredRides.length > 0 ? (
            filteredRides.map((ride, idx) => (
              <View
                key={ride.ride_id}
                className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-dark-border dark:bg-dark-card"
                {...a11y(
                  `Ride from ${ride.origin_address} to ${ride.destination_address}`,
                  `Status: ${ride.payment_status}, Fare: ${CURRENCY_SYMBOL}${ride.fare_price}`,
                )}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-2">
                    <Text
                      className="font-JakartaSemiBold text-slate-900 dark:text-dark-text"
                      numberOfLines={1}
                    >
                      {ride.origin_address} → {ride.destination_address}
                    </Text>
                    <Text className="mt-1 text-xs text-slate-500 dark:text-dark-text-secondary">
                      {formatDate(ride.created_at)} · {formatTime(ride.ride_time)}
                    </Text>
                  </View>
                  {statusBadge(ride.payment_status)}
                </View>

                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="font-JakartaBold text-slate-900 dark:text-dark-text">
                    {CURRENCY_SYMBOL}
                    {ride.fare_price}
                  </Text>
                  {ride.payment_status === "paid" ? (
                    <TouchableOpacity
                      className="flex-row items-center"
                      onPress={() => Alert.alert("Coming Soon", "Rating feature coming soon!")}
                      {...a11yButton("Rate ride", "Rate this completed ride")}
                    >
                      <Ionicons name="star-outline" size={16} color="#ca8a04" />
                      <Text className="ml-1 font-JakartaMedium text-amber-600">Rate ride</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => Alert.alert("Coming Soon", "Rebooking feature coming soon!")}
                      {...a11yButton("Rebook", "Book this ride again")}
                    >
                      <Text className="font-JakartaMedium text-blue-600">Rebook</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View className="items-center py-16">
              <Image source={images.noResult} className="h-24 w-24" {...a11yImage("No results")} />
              <Text className="mt-3 font-JakartaMedium text-base text-slate-500 dark:text-dark-text-secondary">
                No rides match this filter.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RideHistory;
