import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { formatDate, formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";

type RideStatus = "paid" | "pending" | "canceled";
const filters = ["All", "Paid", "Pending"] as const;

const RideHistory = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  const { data: rides, loading } = useFetch<Ride[]>(
    `/(api)/ride?user_email=${email}`
  );

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
        className={`text-xs px-2 py-1 rounded-full ${
          isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
        }`}
      >
        {isPaid ? "Completed" : "Pending"}
      </Text>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-JakartaBold text-slate-900">Ride History</Text>
      </View>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-5 flex-row gap-2">
          <View className="flex-1 rounded-2xl bg-white border border-slate-100 p-4">
            <Text className="text-slate-500 text-xs">Total rides</Text>
            <Text className="mt-1 font-JakartaBold text-xl text-slate-900">
              {rides?.length || 0}
            </Text>
          </View>
          <View className="flex-1 rounded-2xl bg-white border border-slate-100 p-4">
            <Text className="text-slate-500 text-xs">Total spend</Text>
            <Text className="mt-1 font-JakartaBold text-xl text-slate-900">
              ${totalSpend}
            </Text>
          </View>
        </View>

        <View className="mt-4 rounded-xl border border-slate-200 bg-white px-3 flex-row items-center">
          <Ionicons name="search" size={16} color="#64748b" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search destinations"
            className="flex-1 px-2 py-3"
          />
        </View>

        <View className="mt-4 flex-row gap-2">
          {filters.map((filter) => {
            const active = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-full border ${
                  active ? "bg-slate-900 border-slate-900" : "bg-white border-slate-200"
                }`}
              >
                <Text className={`${active ? "text-white" : "text-slate-700"} font-JakartaMedium`}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mt-4 mb-8">
          {loading ? (
            <View className="items-center py-20">
              <ActivityIndicator size="large" color="#0286FF" />
            </View>
          ) : filteredRides.length > 0 ? (
            filteredRides.map((ride, idx) => (
              <View
                key={idx}
                className="mb-3 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-2">
                    <Text className="font-JakartaSemiBold text-slate-900" numberOfLines={1}>
                      {ride.origin_address} → {ride.destination_address}
                    </Text>
                    <Text className="text-slate-500 text-xs mt-1">
                      {formatDate(ride.created_at)} · {formatTime(ride.ride_time)}
                    </Text>
                  </View>
                  {statusBadge(ride.payment_status)}
                </View>

                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="font-JakartaBold text-slate-900">
                    ${ride.fare_price}
                  </Text>
                  {ride.payment_status === "paid" ? (
                    <TouchableOpacity className="flex-row items-center">
                      <Ionicons name="star-outline" size={16} color="#ca8a04" />
                      <Text className="ml-1 text-amber-600 font-JakartaMedium">Rate ride</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity>
                      <Text className="text-blue-600 font-JakartaMedium">Rebook</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View className="items-center py-16">
              <Image source={images.noResult} className="w-24 h-24" />
              <Text className="text-base font-JakartaMedium text-slate-500 mt-3">
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
