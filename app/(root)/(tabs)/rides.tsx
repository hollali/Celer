import { useUser, useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassView } from "@/components/GlassView";
import { icons, images, CURRENCY_SYMBOL } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { useTheme } from "@/lib/ThemeContext";
import { formatDate, formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";
import { a11y, a11yButton, a11yImage } from "@/lib/accessibility";

const Rides = () => {
  const { user } = useUser();
  const { getToken, isLoaded } = useAuth();

  const {
    data: recentRides,
    loading,
    refetch,
    error,
  } = useFetch<Ride[]>("/(api)/ride", getToken, isLoaded);

  const formatRideStatus = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <View className="rounded-full bg-success-100 px-3 py-1 dark:bg-success-900/30">
            <Text className="font-JakartaBold text-xs text-success-600 dark:text-success-400">
              Paid
            </Text>
          </View>
        );
      case "pending":
        return (
          <View className="rounded-full bg-warning-100 px-3 py-1 dark:bg-warning-900/30">
            <Text className="font-JakartaBold text-xs text-warning-600 dark:text-warning-400">
              Pending
            </Text>
          </View>
        );
      default:
        return (
          <View className="rounded-full bg-general-300 px-3 py-1 dark:bg-dark-border">
            <Text className="font-JakartaBold text-xs text-general-700 dark:text-dark-text-secondary">
              {status}
            </Text>
          </View>
        );
    }
  };

  const { isDark, useLiquidGlass } = useTheme();

  const renderRideItem = ({ item }: { item: Ride }) => {
    const isPending = item.payment_status === "pending";

    return (
      <GlassView
        intensity={70}
        tint={isDark ? "systemMaterialDark" : "systemThinMaterialLight"}
        className={`mb-3 rounded-xl p-4 ${useLiquidGlass ? "" : "bg-white shadow-sm shadow-neutral-300 dark:bg-dark-card dark:shadow-dark-border"}`}
        style={useLiquidGlass ? { borderRadius: 12, overflow: "hidden" } : {}}
        {...a11y(
          `Ride from ${item.origin_address} to ${item.destination_address}`,
          `Status: ${item.payment_status}, Fare: ${CURRENCY_SYMBOL}${item.fare_price}`,
        )}
      >
        <View className="mr-4 flex flex-col items-center justify-center">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-general-500 dark:bg-dark-bg">
            <Image source={icons.to} className="h-6 w-6" {...a11yImage("From")} />
          </View>
          <View className="my-1 h-8 w-0.5 bg-general-300 dark:bg-dark-border" />
          <View className="h-6 w-6 items-center justify-center rounded-full bg-primary-500">
            <Image source={icons.point} className="tint-white h-3 w-3" {...a11yImage("To")} />
          </View>
        </View>

        <View className="flex-1">
          <View className="mb-1 flex flex-row items-center justify-between">
            <Text
              className="mr-2 flex-1 font-JakartaBold text-base text-secondary-900 dark:text-dark-text"
              numberOfLines={1}
            >
              {item.origin_address} → {item.destination_address}
            </Text>
            {formatRideStatus(item.payment_status)}
          </View>

          <View className="mt-2 flex flex-row items-center justify-between">
            <View className="flex flex-row items-center">
              <Image source={icons.dollar} className="h-4 w-4" {...a11yImage("Price")} />
              <Text className="ml-1 font-JakartaMedium text-sm text-general-200 dark:text-dark-text-secondary">
                {CURRENCY_SYMBOL}
                {item.fare_price}
              </Text>
            </View>

            <View className="flex flex-row items-center">
              <Image source={icons.star} className="h-4 w-4" {...a11yImage("Driver")} />
              <Text className="ml-1 font-JakartaMedium text-sm text-general-200 dark:text-dark-text-secondary">
                {item.driver?.first_name} {item.driver?.last_name}
              </Text>
            </View>
          </View>

          <View className="mt-2 flex flex-row items-center justify-between">
            <Text className="font-Jakarta text-xs text-general-200 dark:text-dark-text-tertiary">
              {formatDate(item.created_at)}
            </Text>
            <Text className="font-Jakarta text-xs text-general-200 dark:text-dark-text-tertiary">
              {formatTime(item.ride_time)}
            </Text>
          </View>

          {isPending && (
            <TouchableOpacity
              onPress={() =>
                router.push(`/(root)/payment?rideData=${encodeURIComponent(JSON.stringify(item))}`)
              }
              className="mt-2 items-center rounded-full bg-primary-500 py-2"
              {...a11yButton(
                `Pay ${CURRENCY_SYMBOL}${item.fare_price}`,
                `Complete payment for this ride`,
              )}
            >
              <Text className="font-JakartaBold text-sm text-white">
                Pay {CURRENCY_SYMBOL}
                {item.fare_price}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </GlassView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500 dark:bg-dark-bg">
      <FlatList
        data={recentRides ?? []}
        keyExtractor={(item) => String(item.ride_id)}
        renderItem={renderRideItem}
        ListHeaderComponent={
          <>
            <View className="px-5 pb-3 pt-5">
              <Text
                className="font-JakartaExtraBold text-2xl text-black dark:text-dark-text"
                {...a11y("Ride History", "", "header")}
              >
                Ride History
              </Text>
              <Text className="mt-1 font-JakartaMedium text-sm text-general-200 dark:text-dark-text-secondary">
                Pay for pending rides after your trip
              </Text>
            </View>
            {error && (
              <View className="mx-5 mt-4 rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
                <Text className="text-center font-JakartaMedium text-red-600 dark:text-red-400">
                  {error}
                </Text>
                <TouchableOpacity onPress={refetch} className="mt-2">
                  <Text className="text-center font-JakartaBold text-primary-500">Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View
              className="flex items-center justify-center py-20"
              accessibilityLabel="Loading rides"
            >
              <ActivityIndicator size="large" color="#0286FF" />
              <Text className="mt-3 font-JakartaMedium text-base text-general-200 dark:text-dark-text-secondary">
                Loading rides...
              </Text>
            </View>
          ) : (
            <View className="flex items-center justify-center py-20">
              <Image source={images.noResult} className="h-32 w-32" {...a11yImage("No rides")} />
              <Text className="mt-4 font-JakartaBold text-lg text-secondary-900 dark:text-dark-text">
                No rides yet
              </Text>
              <Text className="mt-1 font-JakartaMedium text-sm text-general-200 dark:text-dark-text-secondary">
                Book your first ride to get started!
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor="#0286FF"
            colors={["#0286FF"]}
          />
        }
        contentContainerClassName="pb-8 px-5"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Rides;
