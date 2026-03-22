import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const promos = [
  {
    id: "1",
    title: "50% OFF your next ride",
    code: "CELER50",
    expiry: "Expires Mar 30",
  },
  {
    id: "2",
    title: "Free ride up to GHS 20",
    code: "FREERIDE",
    expiry: "Expires Apr 5",
  },
];

const Promotions = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-JakartaBold">Promotions</Text>
      </View>

      <ScrollView className="px-5">
        {promos.map((promo) => (
          <View
            key={promo.id}
            className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4"
          >
            <Text className="font-JakartaBold text-green-700">
              {promo.title}
            </Text>
            <Text className="mt-2 text-sm text-gray-600">
              Code: {promo.code}
            </Text>
            <Text className="text-xs text-gray-400">{promo.expiry}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Promotions;
