import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Safety = () => {
  const [shareTrip, setShareTrip] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-JakartaBold">Safety Settings</Text>
      </View>

      {/* Settings */}
      <View className="mx-5 mt-4 rounded-2xl border border-slate-200 overflow-hidden">
        {/* Share trip */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <View>
            <Text className="font-JakartaMedium text-gray-900">
              Share Trip Status
            </Text>
            <Text className="text-xs text-gray-500">
              Let trusted contacts track your ride
            </Text>
          </View>
          <Switch value={shareTrip} onValueChange={setShareTrip} />
        </View>

        <View className="h-px bg-gray-100" />

        {/* Emergency */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <View>
            <Text className="font-JakartaMedium text-gray-900">
              Emergency Alerts
            </Text>
            <Text className="text-xs text-gray-500">
              Notify emergency contacts if needed
            </Text>
          </View>
          <Switch value={emergencyAlerts} onValueChange={setEmergencyAlerts} />
        </View>
      </View>

      {/* Emergency Button */}
      <View className="mx-5 mt-6">
        <TouchableOpacity className="bg-red-50 rounded-xl py-4 items-center">
          <Text className="text-red-500 font-JakartaBold">Emergency SOS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Safety;
