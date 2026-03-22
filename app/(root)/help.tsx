import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Help = () => {
  return (
    <SafeAreaView className="flex-1 bg-white px-5">
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
