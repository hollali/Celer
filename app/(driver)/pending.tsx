import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/lib/ThemeContext";
import { a11y, a11yButton, a11yHeader } from "@/lib/accessibility";

const DriverPending = () => {
  const { isDark } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-bg">
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center mb-6">
          <Ionicons name="hourglass-outline" size={48} color="#F59E0B" />
        </View>

        <Text
          className="text-2xl font-JakartaExtraBold text-slate-900 dark:text-dark-text text-center"
          {...a11yHeader("Application Under Review")}
        >
          Application Under Review
        </Text>

        <Text
          className="mt-3 text-base font-JakartaMedium text-slate-500 dark:text-dark-text-secondary text-center leading-6"
          {...a11y("Your driver application has been submitted and is being reviewed. This usually takes 1-2 business days. We'll notify you once your application is approved.")}
        >
          Your driver application has been submitted and is being reviewed.
          This usually takes 1-2 business days.
          {"\n\n"}
          We'll notify you once your application is approved.
        </Text>

        <View className="mt-8 w-full gap-3">
          <TouchableOpacity
            onPress={() => router.replace("/(root)/(tabs)/home")}
            activeOpacity={0.8}
            className="items-center rounded-full bg-primary-500 py-4"
            {...a11yButton("Back to Riding", "Return to the rider home screen")}
          >
            <Text className="text-base font-JakartaBold text-white">
              Back to Riding
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="items-center rounded-full border border-slate-200 dark:border-dark-border py-4"
            {...a11yButton("Go Back", "Return to previous screen")}
          >
            <Text className="text-base font-JakartaBold text-slate-700 dark:text-dark-text">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DriverPending;
