import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const rides = [
  {
    id: "1",
    location: "East Legon → Airport",
    date: "Mar 20, 2026",
    price: "GHS 45",
  },
  {
    id: "2",
    location: "Madina → Osu",
    date: "Mar 18, 2026",
    price: "GHS 32",
  },
];

const RideHistory = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="px-5">
        {rides.map((ride) => (
          <View
            key={ride.id}
            className="mb-4 rounded-xl border border-gray-200 p-4"
          >
            <Text className="font-JakartaSemiBold text-gray-900">
              {ride.location}
            </Text>
            <Text className="text-gray-500 text-sm">{ride.date}</Text>
            <Text className="mt-2 font-JakartaBold text-green-600">
              {ride.price}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RideHistory;
