import { Redirect, Stack, useSegments } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useTheme } from "@/lib/ThemeContext";
import { fetchAPI } from "@/lib/fetch";

type DriverStatus = "loading" | "none" | "pending" | "approved" | "rejected";

const Layout = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { isDark } = useTheme();
  const segments = useSegments();
  const [driverStatus, setDriverStatus] = useState<DriverStatus>("loading");

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const checkStatus = async () => {
      try {
        const token = await getToken();
        const result = await fetchAPI("/(api)/driver-ride?action=check_status", undefined, token);
        const { exists, status } = result?.data || {};
        if (!exists) {
          setDriverStatus("none");
        } else {
          setDriverStatus(status as DriverStatus);
        }
      } catch {
        setDriverStatus("none");
      }
    };

    checkStatus();
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || driverStatus === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-dark-bg">
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const inTabsGroup = segments[1] === "(tabs)";

  if (driverStatus === "none" || driverStatus === "rejected") {
    if (inTabsGroup) {
      return <Redirect href="/(driver)/register" />;
    }
    // Already on register or pending — let them stay
  }

  if (driverStatus === "pending") {
    if (inTabsGroup) {
      return <Redirect href="/(driver)/pending" />;
    }
  }

  if (driverStatus === "approved" && !inTabsGroup) {
    const currentRoute = segments[segments.length - 1];
    if (currentRoute === "register" || currentRoute === "pending") {
      return <Redirect href="/(driver)/(tabs)" />;
    }
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? "#0C0C0E" : "#FFFFFF" },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="pending" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
