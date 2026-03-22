import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Legal = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-JakartaBold">Legal & Privacy</Text>
      </View>

      <ScrollView className="px-5">
        <TouchableOpacity className="p-4 border border-gray-200 rounded-xl mb-4 flex-row justify-between">
          <Text className="font-JakartaMedium">Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={18} />
        </TouchableOpacity>

        <TouchableOpacity className="p-4 border border-gray-200 rounded-xl mb-4 flex-row justify-between">
          <Text className="font-JakartaMedium">Terms of Service</Text>
          <Ionicons name="chevron-forward" size={18} />
        </TouchableOpacity>

        <TouchableOpacity className="p-4 border border-gray-200 rounded-xl mb-4 flex-row justify-between">
          <Text className="font-JakartaMedium">Data Usage</Text>
          <Ionicons name="chevron-forward" size={18} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Legal;
