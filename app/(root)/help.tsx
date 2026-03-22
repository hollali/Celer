import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Help = () => {
  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      {/* Header */}
      <View className="flex-row items-center py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-JakartaBold">Help & Support</Text>
      </View>

      <View className="mt-6 space-y-4">
        <TouchableOpacity className="p-4 border border-gray-200 rounded-xl">
          <Text className="font-JakartaMedium">Report a Problem</Text>
        </TouchableOpacity>

        <TouchableOpacity className="p-4 border border-gray-200 rounded-xl">
          <Text className="font-JakartaMedium">Contact Support</Text>
        </TouchableOpacity>

        <TouchableOpacity className="p-4 border border-gray-200 rounded-xl">
          <Text className="font-JakartaMedium">FAQs</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Help;
