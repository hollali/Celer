import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/customButton";
import DriverCard from "@/components/DriverCard";
import GoogleInput from "@/components/GoogleInput";
import Map from "@/components/Map";
import { icons, images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore, useDriverStore } from "@/store";
import { MarkerData } from "@/types/type";

const FALLBACK_DRIVERS: MarkerData[] = [
  {
    id: 1,
    latitude: 0,
    longitude: 0,
    title: "James Wilson",
    first_name: "James",
    last_name: "Wilson",
    profile_image_url: "https://ucarecdn.com/dae59f69-2c1f-48c3-a883-017bcf0f9950/-/preview/1000x666/",
    car_image_url: "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
    car_seats: 4,
    rating: 4.8,
    time: 8,
    price: "12.50",
  },
  {
    id: 2,
    latitude: 0,
    longitude: 0,
    title: "David Brown",
    first_name: "David",
    last_name: "Brown",
    profile_image_url: "https://ucarecdn.com/6ea6d83d-ef1a-483f-9106-837a3a5b3f67/-/preview/1000x666/",
    car_image_url: "https://ucarecdn.com/a3872f80-c094-409c-82f8-c9ff38429327/-/preview/930x932/",
    car_seats: 5,
    rating: 4.6,
    time: 5,
    price: "15.00",
  },
  {
    id: 3,
    latitude: 0,
    longitude: 0,
    title: "Michael Johnson",
    first_name: "Michael",
    last_name: "Johnson",
    profile_image_url: "https://ucarecdn.com/0330d85c-232e-4c30-bd04-e5e4d0e3d688/-/preview/826x822/",
    car_image_url: "https://ucarecdn.com/289764fb-55b6-4427-b1d1-f655987b4a14/-/preview/930x932/",
    car_seats: 4,
    rating: 4.7,
    time: 10,
    price: "10.00",
  },
  {
    id: 4,
    latitude: 0,
    longitude: 0,
    title: "Robert Green",
    first_name: "Robert",
    last_name: "Green",
    profile_image_url: "https://ucarecdn.com/fdfc54df-9d24-40f7-b7d3-6f391561c0db/-/preview/626x417/",
    car_image_url: "https://ucarecdn.com/b6fb3b55-7676-4ff3-8484-fb115e268d32/-/preview/930x932/",
    car_seats: 4,
    rating: 4.9,
    time: 7,
    price: "18.00",
  },
];

const Home = () => {
  const { user } = useUser();
  const {
    setUserLocation,
    setDestinationLocation,
  } = useLocationStore();
  const { drivers, selectedDriver, setSelectedDriver, setDrivers, clearSelectedDriver } =
    useDriverStore();

  const [hasPermissions, setHasPermissions] = useState(false);
  const [loadingRides, setLoadingRides] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [rideHistory, setRideHistory] = useState<any[]>([]);
  const [showDriverSelection, setShowDriverSelection] = useState(false);

  useEffect(() => {
    requestLocation();
    fetchRideHistory();
  }, []);

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    setHasPermissions(true);

    const location = await Location.getCurrentPositionAsync({});
    const address = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      address: `${address[0]?.formattedAddress || address[0]?.street || "Current Location"}, ${address[0]?.city || ""}`,
    });
  };

  const fetchRideHistory = async () => {
    try {
      setLoadingRides(true);
      const data = await fetchAPI("/(api)/ride");
      if (data?.data) {
        setRideHistory(data.data.slice(0, 3));
      }
    } catch {
      console.log("No ride history yet");
    } finally {
      setLoadingRides(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      setLoadingDrivers(true);
      const data = await fetchAPI("/(api)/driver");
      if (data?.data?.length > 0) {
        setDrivers(data.data);
      } else {
        setDrivers(FALLBACK_DRIVERS);
      }
    } catch {
      setDrivers(FALLBACK_DRIVERS);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(location);
    setShowDriverSelection(true);
    fetchDrivers();
  };

  const handleRideSelect = async () => {
    if (!selectedDriver) return;
    const driver = drivers.find((d) => d.id === selectedDriver);
    const originAddress = useLocationStore.getState().userAddress;
    const destAddress = useLocationStore.getState().destinationAddress;
    if (!driver || !originAddress || !destAddress) return;

    try {
      await fetchAPI("/(api)/ride", {
        method: "POST",
        body: JSON.stringify({
          origin_address: originAddress,
          destination_address: destAddress,
          origin_latitude: useLocationStore.getState().userLatitude,
          origin_longitude: useLocationStore.getState().userLongitude,
          destination_latitude: useLocationStore.getState().destinationLatitude,
          destination_longitude: useLocationStore.getState().destinationLongitude,
          ride_time: Math.round(driver.time || 0),
          fare_price: parseFloat(driver.price || "0"),
          payment_status: "pending",
          driver_id: driver.id,
          user_id: user?.primaryEmailAddress?.emailAddress || "",
        }),
      });
      Alert.alert("Ride Booked", "Your driver is on the way! Pay after you arrive.", [
        { text: "OK", onPress: () => {
          setShowDriverSelection(false);
          clearSelectedDriver();
          fetchRideHistory();
        }},
      ]);
    } catch (e) {
      Alert.alert("Error", "Failed to book ride. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-5 pt-3">
        <View>
          <Text className="text-lg font-JakartaExtraBold">
            Welcome, {user?.firstName || "Rider"}
          </Text>
          <Text className="text-sm font-JakartaMedium text-general-200">
            Where are you headed today?
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(root)/(tabs)/profile" as any)}
          className="w-10 h-10 rounded-full bg-general-300 items-center justify-center"
        >
          <Image source={icons.profile} className="w-5 h-5" />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View className="flex-1 rounded-2xl mx-5 mt-4 overflow-hidden">
        <Map />
      </View>

      {/* Bottom sheet — scrollable with padding for the tab bar */}
      <View
        className="bg-white px-5 pt-5 rounded-t-3xl shadow-lg"
        style={{ maxHeight: 260 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {!showDriverSelection ? (
            <>
              {/* Search inputs */}
              <GoogleInput
                icon={icons.search}
                initialLocation={useLocationStore.getState().userAddress ?? "Your location"}
                containerStyle="bg-white"
                textInputBackgroundColor="#F5F5F5"
                handlePress={() => {}}
              />
              <View className="mt-2">
                <GoogleInput
                  icon={icons.target}
                  initialLocation="Where to?"
                  containerStyle="bg-white"
                  textInputBackgroundColor="#F5F5F5"
                  handlePress={handleDestinationPress}
                />
              </View>

              {/* Recent rides */}
              {rideHistory.length > 0 && (
                <View className="mt-5">
                  <Text className="text-lg font-JakartaBold mb-3">Recent Rides</Text>
                  <FlatList
                    data={rideHistory}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, idx) => idx.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity className="bg-general-500 rounded-xl p-3 mr-3 w-40">
                        <Text className="font-JakartaSemiBold text-sm" numberOfLines={1}>
                          {item.origin_address}
                        </Text>
                        <Text className="font-Jakarta text-xs text-general-200 mt-1">
                          → {item.destination_address}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </>
          ) : (
            <>
              {/* Driver selection */}
              <Text className="text-xl font-JakartaBold mb-3">
                Select a driver
              </Text>

              {loadingDrivers ? (
                <View className="items-center py-6">
                  <ActivityIndicator size="large" color="#0286FF" />
                  <Text className="text-base font-JakartaMedium text-general-200 mt-2">
                    Finding nearby drivers...
                  </Text>
                </View>
              ) : drivers.length > 0 ? (
                <View>
                  {drivers.map((driver) => (
                    <View key={driver.id} className="mb-2">
                      <DriverCard
                        item={driver}
                        selected={selectedDriver!}
                        setSelected={() => setSelectedDriver(driver.id)}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <View className="items-center py-6">
                  <Image source={images.noResult} className="w-20 h-20" />
                  <Text className="text-base font-JakartaMedium text-general-200 mt-2">
                    No drivers available nearby
                  </Text>
                </View>
              )}

              <View className="flex flex-row gap-3 mt-4">
                <CustomButton
                  title="Back"
                  onPress={() => {
                    setShowDriverSelection(false);
                    clearSelectedDriver();
                  }}
                  bgVariant="outline"
                  className="flex-1"
                />
                <CustomButton
                  title="Confirm Ride"
                  onPress={handleRideSelect}
                  className="flex-1"
                />
              </View>
            </>
          )}
        </ScrollView>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Home;
