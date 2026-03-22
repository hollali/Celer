import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Payment = () => {
  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      <View className="flex-row items-center py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-JakartaBold">Payment</Text>
      </View>

      {/* Payment Methods */}
      <View className="mt-6">
        <Text className="text-gray-500 mb-2">Saved Methods</Text>

        <View className="rounded-xl border border-gray-200 p-4 flex-row justify-between">
          <View>
            <Text className="font-JakartaMedium">Visa •••• 1234</Text>
            <Text className="text-gray-400 text-sm">Expires 08/28</Text>
          </View>
          <Ionicons name="card-outline" size={20} />
        </View>
      </View>

      {/* Add New */}
      <TouchableOpacity className="mt-6 rounded-full bg-blue-500 py-4 items-center">
        <Text className="text-white font-JakartaBold">Add Payment Method</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Payment;
