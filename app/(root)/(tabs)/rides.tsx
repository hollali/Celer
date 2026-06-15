import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons, images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { formatDate, formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";
import { a11y, a11yButton, a11yImage } from "@/lib/accessibility";

const Rides = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  const {
    data: recentRides,
    loading,
    refetch,
  } = useFetch<Ride[]>(`/(api)/ride?user_email=${email}`);

  const formatRideStatus = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <View className="bg-success-100 dark:bg-success-900/30 rounded-full px-3 py-1">
            <Text className="text-xs font-JakartaBold text-success-600 dark:text-success-400">Paid</Text>
          </View>
        );
      case "pending":
        return (
          <View className="bg-warning-100 dark:bg-warning-900/30 rounded-full px-3 py-1">
            <Text className="text-xs font-JakartaBold text-warning-600 dark:text-warning-400">
              Pending
            </Text>
          </View>
        );
      default:
        return (
          <View className="bg-general-300 dark:bg-dark-border rounded-full px-3 py-1">
            <Text className="text-xs font-JakartaBold text-general-700 dark:text-dark-text-secondary">
              {status}
            </Text>
          </View>
        );
    }
  };

  const renderRideItem = ({ item }: { item: Ride }) => {
    const isPending = item.payment_status === "pending";

    return (
      <View className="flex flex-row items-center bg-white dark:bg-dark-card rounded-xl shadow-sm shadow-neutral-300 dark:shadow-dark-border mb-3 p-4" {...a11y(`Ride from ${item.origin_address} to ${item.destination_address}`, `Status: ${item.payment_status}, Fare: $${item.fare_price}`)}>
        <View className="flex flex-col items-center justify-center mr-4">
          <View className="w-12 h-12 bg-general-500 dark:bg-dark-bg rounded-full items-center justify-center">
            <Image source={icons.to} className="w-6 h-6" {...a11yImage("From")} />
          </View>
          <View className="w-0.5 h-8 bg-general-300 dark:bg-dark-border my-1" />
          <View className="w-6 h-6 bg-primary-500 rounded-full items-center justify-center">
            <Image source={icons.point} className="w-3 h-3 tint-white" {...a11yImage("To")} />
          </View>
        </View>

        <View className="flex-1">
          <View className="flex flex-row items-center justify-between mb-1">
            <Text
              className="text-base font-JakartaBold text-secondary-900 dark:text-dark-text flex-1 mr-2"
              numberOfLines={1}
            >
              {item.origin_address} → {item.destination_address}
            </Text>
            {formatRideStatus(item.payment_status)}
          </View>

          <View className="flex flex-row items-center justify-between mt-2">
            <View className="flex flex-row items-center">
              <Image source={icons.dollar} className="w-4 h-4" {...a11yImage("Price")} />
              <Text className="text-sm font-JakartaMedium text-general-200 dark:text-dark-text-secondary ml-1">
                ${item.fare_price}
              </Text>
            </View>

            <View className="flex flex-row items-center">
              <Image source={icons.star} className="w-4 h-4" {...a11yImage("Driver")} />
              <Text className="text-sm font-JakartaMedium text-general-200 dark:text-dark-text-secondary ml-1">
                {item.driver?.first_name} {item.driver?.last_name}
              </Text>
            </View>
          </View>

          <View className="flex flex-row items-center justify-between mt-2">
            <Text className="text-xs font-Jakarta text-general-200 dark:text-dark-text-tertiary">
              {formatDate(item.created_at)}
            </Text>
            <Text className="text-xs font-Jakarta text-general-200 dark:text-dark-text-tertiary">
              {formatTime(item.ride_time)}
            </Text>
          </View>

          {isPending && (
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/(root)/payment?rideData=${encodeURIComponent(JSON.stringify(item))}`
                )
              }
              className="mt-2 bg-primary-500 rounded-full py-2 items-center"
              {...a11yButton(`Pay $${item.fare_price}`, `Complete payment for this ride`)}
            >
              <Text className="text-sm font-JakartaBold text-white">
                Pay ${item.fare_price}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500 dark:bg-dark-bg">
      <FlatList
        data={recentRides}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={renderRideItem}
        ListHeaderComponent={
          <View className="px-5 pt-5 pb-3">
            <Text className="text-2xl font-JakartaExtraBold text-black dark:text-dark-text" {...a11y("Ride History", "", "header")}>Ride History</Text>
            <Text className="text-sm font-JakartaMedium text-general-200 dark:text-dark-text-secondary mt-1">
              Pay for pending rides after your trip
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="flex items-center justify-center py-20" accessibilityLabel="Loading rides">
              <ActivityIndicator size="large" color="#0286FF" />
              <Text className="text-base font-JakartaMedium text-general-200 dark:text-dark-text-secondary mt-3">
                Loading rides...
              </Text>
            </View>
          ) : (
            <View className="flex items-center justify-center py-20">
              <Image source={images.noResult} className="w-32 h-32" {...a11yImage("No rides")} />
              <Text className="text-lg font-JakartaBold text-secondary-900 dark:text-dark-text mt-4">
                No rides yet
              </Text>
              <Text className="text-sm font-JakartaMedium text-general-200 dark:text-dark-text-secondary mt-1">
                Book your first ride to get started!
              </Text>
            </View>
          )
        }
        contentContainerClassName="pb-8 px-5"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Rides;
