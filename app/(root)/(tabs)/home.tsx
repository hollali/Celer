import { useUser, useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/customButton";
import { GlassView } from "@/components/GlassView";
import PlaceInput from "@/components/PlaceInput";
import Map from "@/components/Map";
import { icons, CURRENCY_SYMBOL } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { calculateDriverTimes } from "@/lib/map";
import { useLocationStore, useDriverStore, useTabStore } from "@/store";
import { useTheme } from "@/lib/ThemeContext";
import { useNetworkStatus } from "@/lib/network";
import { a11y, a11yButton, a11yImage } from "@/lib/accessibility";

const geocodeCache: Record<string, string> = {};
let lastGeocodeTime = 0;
const GEOCODE_THROTTLE_MS = 1100;

function geocodeCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

const Home = () => {
  const { user } = useUser();
  const { getToken, isLoaded } = useAuth();
  const { isDark, useLiquidGlass } = useTheme();
  const { setUserLocation, setDestinationLocation, userLatitude, userLongitude } =
    useLocationStore();
  const { drivers, selectedDriver, setSelectedDriver, setDrivers, clearSelectedDriver } =
    useDriverStore();
  const { isOffline } = useNetworkStatus();

  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [driverError, setDriverError] = useState<string | null>(null);
  const [rideRequested, setRideRequested] = useState(false);
  const [bookingRide, setBookingRide] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    "loading" | "granted" | "denied" | "unavailable"
  >("loading");

  useEffect(() => {
    if (isLoaded) {
      requestLocation();
    }
  }, [isLoaded]);

  const requestLocation = async () => {
    setLocationStatus("loading");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationStatus("denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      let addressText = "Current Location";
      try {
        const cacheKey = geocodeCacheKey(latitude, longitude);
        const cached = geocodeCache[cacheKey];
        if (cached) {
          addressText = cached;
        } else {
          const now = Date.now();
          const wait = GEOCODE_THROTTLE_MS - (now - lastGeocodeTime);
          if (wait > 0) {
            await new Promise((r) => setTimeout(r, wait));
          }
          lastGeocodeTime = Date.now();
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=18&addressdetails=1`,
            { headers: { Accept: "application/json", "User-Agent": "CelerApp/1.0" } },
          );
          if (res.ok) {
            const data = await res.json();
            const a = data.address || {};
            const parts = [
              a.road,
              a.neighbourhood || a.suburb || a.quarter,
              a.city || a.town || a.village,
            ].filter(Boolean);
            if (parts.length > 0) {
              addressText = parts.join(", ");
            } else if (data.display_name) {
              addressText = data.display_name.split(",").slice(0, 3).join(",").trim();
            }
            geocodeCache[cacheKey] = addressText;
          } else if (res.status === 429) {
            addressText = "Current Location";
          }
        }
      } catch {}

      setUserLocation({ latitude, longitude, address: addressText });
      setLocationStatus("granted");
    } catch {
      setLocationStatus("unavailable");
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await requestLocation();
    setRefreshing(false);
  }, []);

  const handleRetryDrivers = useCallback(
    async (location: { latitude: number; longitude: number; address: string }) => {
      setDriverError(null);
      setLoadingDrivers(true);
      try {
        const token = await getToken();
        const userLat = useLocationStore.getState().userLatitude || 0;
        const userLng = useLocationStore.getState().userLongitude || 0;

        const params = new URLSearchParams();
        if (userLat && userLng) {
          params.set("lat", String(userLat));
          params.set("lng", String(userLng));
        }
        const query = params.toString();
        const url = `/(api)/driver${query ? `?${query}` : ""}`;

        const data = await fetchAPI(url, undefined, token);
        if (data?.data?.length > 0) {
          const destLat = useLocationStore.getState().destinationLatitude;
          const destLng = useLocationStore.getState().destinationLongitude;
          const driversWithTimes = await calculateDriverTimes({
            markers: data.data,
            userLatitude: userLat || null,
            userLongitude: userLng || null,
            destinationLatitude: destLat || location.latitude,
            destinationLongitude: destLng || location.longitude,
          });
          const list = driversWithTimes || data.data;
          setDrivers(list);
          const sorted = [...list].sort((a, b) => (a.time ?? Infinity) - (b.time ?? Infinity));
          setSelectedDriver(sorted[0].id);
        } else {
          setDriverError("No drivers available in your area");
        }
      } catch {
        setDriverError("Unable to find drivers. Please try again.");
      } finally {
        setLoadingDrivers(false);
      }
    },
    [getToken, setDrivers, setSelectedDriver],
  );

  const handleDestinationPress = async (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    if (isOffline) {
      Alert.alert("No Connection", "You need an internet connection to find drivers.");
      return;
    }
    setDestinationLocation(location);
    setRideRequested(true);
    setDriverError(null);

    try {
      setLoadingDrivers(true);
      const token = await getToken();
      const userLat = useLocationStore.getState().userLatitude || 0;
      const userLng = useLocationStore.getState().userLongitude || 0;

      const params = new URLSearchParams();
      if (userLat && userLng) {
        params.set("lat", String(userLat));
        params.set("lng", String(userLng));
      }
      const query = params.toString();
      const url = `/(api)/driver${query ? `?${query}` : ""}`;

      const data = await fetchAPI(url, undefined, token);
      if (data?.data?.length > 0) {
        const driversWithTimes = await calculateDriverTimes({
          markers: data.data,
          userLatitude: userLat || null,
          userLongitude: userLng || null,
          destinationLatitude: location.latitude,
          destinationLongitude: location.longitude,
        });
        const list = driversWithTimes || data.data;
        setDrivers(list);
        const sorted = [...list].sort((a, b) => (a.time ?? Infinity) - (b.time ?? Infinity));
        setSelectedDriver(sorted[0].id);
      } else {
        setDriverError("No drivers available in your area");
      }
    } catch {
      setDriverError("Unable to find drivers. Please try again.");
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleConfirmRide = async () => {
    if (!selectedDriver || bookingRide) return;
    if (isOffline) {
      Alert.alert("No Connection", "You need an internet connection to book a ride.");
      return;
    }
    const driver = drivers.find((d) => d.id === selectedDriver);
    const originAddress = useLocationStore.getState().userAddress;
    const destAddress = useLocationStore.getState().destinationAddress;
    if (!driver || !originAddress || !destAddress) return;

    setBookingRide(true);
    try {
      const token = await getToken();
      const newRide = await fetchAPI(
        "/(api)/ride",
        {
          method: "POST",
          body: JSON.stringify({
            origin_address: originAddress,
            destination_address: destAddress,
            origin_latitude: useLocationStore.getState().userLatitude,
            origin_longitude: useLocationStore.getState().userLongitude,
            destination_latitude: useLocationStore.getState().destinationLatitude,
            destination_longitude: useLocationStore.getState().destinationLongitude,
            payment_status: "pending",
            driver_id: driver.id,
          }),
        },
        token,
      );

      setRideRequested(false);
      clearSelectedDriver();
      setDestinationLocation({ latitude: 0, longitude: 0, address: "" });

      const rideData = newRide?.data?.[0] || newRide?.data;
      Alert.alert("Ride Booked", "Your driver is on the way! Pay after you arrive.", [
        {
          text: "Pay Now",
          onPress: () =>
            router.push(`/(root)/payment?rideData=${encodeURIComponent(JSON.stringify(rideData))}`),
        },
        { text: "Pay Later", style: "cancel" },
      ]);
    } catch (e) {
      Alert.alert(
        "Booking Failed",
        "Could not book ride. Please check your connection and try again.",
        [
          { text: "Retry", onPress: handleConfirmRide },
          { text: "Cancel", style: "cancel" },
        ],
      );
    } finally {
      setBookingRide(false);
    }
  };

  const handleCancelRide = () => {
    setRideRequested(false);
    setDriverError(null);
    clearSelectedDriver();
    setDestinationLocation({ latitude: 0, longitude: 0, address: "" });
  };

  const assignedDriver = rideRequested ? drivers.find((d) => d.id === selectedDriver) : null;
  const hasError = !loadingDrivers && driverError !== null;

  const content = (
    <>
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-5 pt-3">
        <View>
          <Text className="font-JakartaExtraBold text-lg text-black dark:text-dark-text">
            Welcome, {user?.firstName || "Rider"}
          </Text>
          <Text className="font-JakartaMedium text-sm text-general-200 dark:text-dark-text-secondary">
            Where are you headed today?
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          className="h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-general-300"
          {...a11yButton("View profile", "Navigate to your account settings")}
        >
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              className="h-full w-full"
              resizeMode="cover"
              {...a11yImage("Your profile photo")}
            />
          ) : (
            <Image
              source={icons.profile}
              className="h-5 w-5"
              {...a11yImage("Profile placeholder")}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Offline banner */}
      {isOffline && (
        <View className="mx-5 mt-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20">
          <Text className="text-center font-JakartaMedium text-xs text-amber-700 dark:text-amber-400">
            You're offline. GPS still works, but finding drivers requires internet.
          </Text>
        </View>
      )}

      {/* Location warning banner */}
      {locationStatus === "denied" && (
        <View className="mx-5 mt-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20">
          <Text className="text-center font-JakartaMedium text-xs text-amber-700 dark:text-amber-400">
            Location access denied. Enable it in settings for better driver matching.
          </Text>
        </View>
      )}
      {locationStatus === "unavailable" && (
        <View className="mx-5 mt-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20">
          <Text className="text-center font-JakartaMedium text-xs text-amber-700 dark:text-amber-400">
            Location unavailable. Search results may be less accurate.
          </Text>
        </View>
      )}

      {/* Map */}
      <View className="mx-5 mt-4 flex-1 overflow-hidden rounded-2xl">
        <Map />
      </View>

      {/* Bottom Panel */}
      <GlassView
        intensity={75}
        tint={isDark ? "systemMaterialDark" : "systemChromeMaterialLight"}
        className={`rounded-t-3xl px-5 pt-5 ${useLiquidGlass ? "" : "bg-white shadow-lg dark:bg-dark-card"}`}
        style={
          useLiquidGlass
            ? {
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                overflow: "hidden",
                maxHeight: rideRequested ? 340 : 260,
              }
            : { maxHeight: rideRequested ? 340 : 260 }
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          onTouchStart={() => useTabStore.getState().setTabBarVisible(true)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#0286FF"
              colors={["#0286FF"]}
            />
          }
        >
          {!rideRequested ? (
            <>
              <PlaceInput
                icon={icons.target}
                initialLocation="Where to?"
                containerStyle={useLiquidGlass ? "bg-white/40" : "bg-white"}
                textInputBackgroundColor={useLiquidGlass ? "rgba(255,255,255,0.5)" : "#F5F5F5"}
                handlePress={handleDestinationPress}
              />
            </>
          ) : (
            <>
              <Text
                className="mb-3 font-JakartaBold text-lg text-black dark:text-dark-text"
                {...a11y("Your ride", "Ride details and confirmation", "header")}
              >
                Your Ride
              </Text>

              {loadingDrivers ? (
                <View className="items-center py-6" accessibilityLabel="Finding driver">
                  <ActivityIndicator size="large" color="#0286FF" />
                  <Text className="mt-2 font-JakartaMedium text-base text-general-200 dark:text-dark-text-secondary">
                    Finding nearest driver...
                  </Text>
                </View>
              ) : hasError ? (
                <View className="items-center py-4">
                  <Text className="mb-3 text-center font-JakartaMedium text-base text-danger-500 dark:text-danger-400">
                    {driverError}
                  </Text>
                  <CustomButton
                    title="Search Again"
                    onPress={() => {
                      const dest = useLocationStore.getState();
                      if (dest.destinationLatitude && dest.destinationLongitude) {
                        handleRetryDrivers({
                          latitude: dest.userLatitude || 0,
                          longitude: dest.userLongitude || 0,
                          address: dest.userAddress || "",
                        });
                      }
                    }}
                    bgVariant="secondary"
                    className="px-6"
                  />
                </View>
              ) : assignedDriver ? (
                <View className="mb-3 rounded-2xl border border-slate-100 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
                  <View className="flex-row items-center">
                    <View className="mr-3 h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-general-300 dark:bg-dark-bg">
                      {assignedDriver.profile_image_url ? (
                        <Image
                          source={{ uri: assignedDriver.profile_image_url }}
                          className="h-full w-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <Text className="font-JakartaBold text-xl text-white">
                          {assignedDriver.first_name?.charAt(0)}
                        </Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="font-JakartaBold text-base text-black dark:text-dark-text">
                        {assignedDriver.first_name} {assignedDriver.last_name}
                      </Text>
                      <View className="mt-1 flex-row items-center gap-1">
                        <Text className="text-sm text-general-200 dark:text-dark-text-secondary">
                          ⭐ {assignedDriver.rating}
                        </Text>
                        <Text className="text-general-300 dark:text-dark-border">•</Text>
                        <Text className="text-sm text-general-200 dark:text-dark-text-secondary">
                          {assignedDriver.car_seats} seats
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="font-JakartaExtraBold text-lg text-primary-500">
                        {CURRENCY_SYMBOL}
                        {assignedDriver.price}
                      </Text>
                      <Text className="mt-1 text-xs text-general-200 dark:text-dark-text-secondary">
                        ~{Math.round(assignedDriver.time || 0)} min
                      </Text>
                    </View>
                  </View>
                  <View className="mt-3 border-t border-slate-100 pt-3 dark:border-dark-border">
                    <Text
                      className="text-xs text-general-200 dark:text-dark-text-secondary"
                      numberOfLines={1}
                    >
                      📍 {useLocationStore.getState().destinationAddress}
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="items-center py-6">
                  <Text className="font-JakartaMedium text-base text-general-200 dark:text-dark-text-secondary">
                    No drivers available nearby
                  </Text>
                </View>
              )}

              <View className="flex flex-row gap-3">
                <CustomButton
                  title="Cancel"
                  onPress={handleCancelRide}
                  bgVariant="secondary"
                  textVariant="primary"
                  className="flex-1"
                  disabled={bookingRide}
                />
                <CustomButton
                  title={bookingRide ? "Booking..." : "Confirm Ride"}
                  onPress={handleConfirmRide}
                  bgVariant="secondary"
                  className="flex-1 bg-primary-500"
                  disabled={!assignedDriver || loadingDrivers || bookingRide}
                />
              </View>
            </>
          )}
        </ScrollView>
      </GlassView>
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Home;
