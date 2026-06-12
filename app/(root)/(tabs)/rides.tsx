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
          <View className="bg-success-100 rounded-full px-3 py-1">
            <Text className="text-xs font-JakartaBold text-success-600">Paid</Text>
          </View>
        );
      case "pending":
        return (
          <View className="bg-warning-100 rounded-full px-3 py-1">
            <Text className="text-xs font-JakartaBold text-warning-600">
              Pending
            </Text>
          </View>
        );
      default:
        return (
          <View className="bg-general-300 rounded-full px-3 py-1">
            <Text className="text-xs font-JakartaBold text-general-700">
              {status}
            </Text>
          </View>
        );
    }
  };

  const renderRideItem = ({ item }: { item: Ride }) => {
    const isPending = item.payment_status === "pending";

    return (
      <View className="flex flex-row items-center bg-white rounded-xl shadow-sm shadow-neutral-300 mb-3 p-4">
        <View className="flex flex-col items-center justify-center mr-4">
          <View className="w-12 h-12 bg-general-500 rounded-full items-center justify-center">
            <Image source={icons.to} className="w-6 h-6" />
          </View>
          <View className="w-0.5 h-8 bg-general-300 my-1" />
          <View className="w-6 h-6 bg-primary-500 rounded-full items-center justify-center">
            <Image source={icons.point} className="w-3 h-3 tint-white" />
          </View>
        </View>

        <View className="flex-1">
          <View className="flex flex-row items-center justify-between mb-1">
            <Text
              className="text-base font-JakartaBold text-secondary-900 flex-1 mr-2"
              numberOfLines={1}
            >
              {item.origin_address} → {item.destination_address}
            </Text>
            {formatRideStatus(item.payment_status)}
          </View>

          <View className="flex flex-row items-center justify-between mt-2">
            <View className="flex flex-row items-center">
              <Image source={icons.dollar} className="w-4 h-4" />
              <Text className="text-sm font-JakartaMedium text-general-200 ml-1">
                ${item.fare_price}
              </Text>
            </View>

            <View className="flex flex-row items-center">
              <Image source={icons.star} className="w-4 h-4" />
              <Text className="text-sm font-JakartaMedium text-general-200 ml-1">
                {item.driver?.first_name} {item.driver?.last_name}
              </Text>
            </View>
          </View>

          <View className="flex flex-row items-center justify-between mt-2">
            <Text className="text-xs font-Jakarta text-general-200">
              {formatDate(item.created_at)}
            </Text>
            <Text className="text-xs font-Jakarta text-general-200">
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
    <SafeAreaView className="flex-1 bg-general-500">
      <FlatList
        data={recentRides}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={renderRideItem}
        ListHeaderComponent={
          <View className="px-5 pt-5 pb-3">
            <Text className="text-2xl font-JakartaExtraBold">Ride History</Text>
            <Text className="text-sm font-JakartaMedium text-general-200 mt-1">
              Pay for pending rides after your trip
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="flex items-center justify-center py-20">
              <ActivityIndicator size="large" color="#0286FF" />
              <Text className="text-base font-JakartaMedium text-general-200 mt-3">
                Loading rides...
              </Text>
            </View>
          ) : (
            <View className="flex items-center justify-center py-20">
              <Image source={images.noResult} className="w-32 h-32" />
              <Text className="text-lg font-JakartaBold text-secondary-900 mt-4">
                No rides yet
              </Text>
              <Text className="text-sm font-JakartaMedium text-general-200 mt-1">
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
