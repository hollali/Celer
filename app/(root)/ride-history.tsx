import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RideStatus = "Completed" | "Canceled";

const rides = [
  {
    id: "1",
    location: "East Legon → Airport",
    date: "Mar 20, 2026",
    price: "GH₵45.00",
    status: "Completed" as RideStatus,
  },
  {
    id: "2",
    location: "Madina → Osu",
    date: "Mar 18, 2026",
    price: "GH₵32.00",
    status: "Completed" as RideStatus,
  },
  {
    id: "3",
    location: "Downtown → Union Station",
    date: "Mar 16, 2026",
    price: "GH₵0.00",
    status: "Canceled" as RideStatus,
  },
];

const filters = ["All", "Completed", "Canceled"] as const;

const RideHistory = () => {
  const [selectedFilter, setSelectedFilter] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");

  const filteredRides = useMemo(() => {
    const text = query.trim().toLowerCase();
    return rides.filter((ride) => {
      const statusMatch = selectedFilter === "All" || ride.status === selectedFilter;
      const queryMatch = !text || ride.location.toLowerCase().includes(text);
      return statusMatch && queryMatch;
    });
  }, [selectedFilter, query]);

  const totalSpend = useMemo(() => {
    return rides
      .filter((ride) => ride.status === "Completed")
      .reduce((sum, ride) => sum + Number(ride.price.replace("GH₵", "")), 0)
      .toFixed(2);
  }, []);

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
            <Text className="mt-1 font-JakartaBold text-xl text-slate-900">{rides.length}</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-white border border-slate-100 p-4">
            <Text className="text-slate-500 text-xs">Total spend</Text>
            <Text className="mt-1 font-JakartaBold text-xl text-slate-900">GH₵{totalSpend}</Text>
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
          {filteredRides.map((ride) => {
            const isCompleted = ride.status === "Completed";
            return (
              <View key={ride.id} className="mb-3 rounded-2xl border border-slate-200 bg-white p-4">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-2">
                    <Text className="font-JakartaSemiBold text-slate-900">{ride.location}</Text>
                    <Text className="text-slate-500 text-xs mt-1">{ride.date}</Text>
                  </View>
                  <Text
                    className={`text-xs px-2 py-1 rounded-full ${
                      isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {ride.status}
                  </Text>
                </View>

                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="font-JakartaBold text-slate-900">{ride.price}</Text>
                  {isCompleted ? (
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
            );
          })}

          {!filteredRides.length && (
            <View className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 items-center">
              <Text className="text-slate-500">No rides match this filter.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RideHistory;
