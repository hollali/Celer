import React from "react";
import { Text, View } from "react-native";
import { useNetworkStatus } from "@/lib/network";

export function NetworkStatus() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <View className="items-center bg-amber-500 px-4 py-2">
      <Text className="font-JakartaMedium text-xs text-white">
        You're offline. Some features may be unavailable.
      </Text>
    </View>
  );
}
