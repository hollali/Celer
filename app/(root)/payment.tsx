import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/customButton";
import { icons } from "@/constants";
import { fetchAPI, useFetch } from "@/lib/fetch";
import { formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";

const Payment = () => {
  const { user } = useUser();
  const { rideData } = useLocalSearchParams<{ rideData?: string }>();
  const email = user?.primaryEmailAddress?.emailAddress;

  const { data: rides } = useFetch<Ride[]>(`/(api)/ride?user_email=${email}`);

  const [ride, setRide] = useState<Ride | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (rideData) {
      try {
        setRide(JSON.parse(decodeURIComponent(rideData)));
      } catch {
        // fall back to fetching from list
      }
    }
  }, [rideData]);

  const pendingRides = useMemo(
    () => (rides || []).filter((r) => r.payment_status === "pending"),
    [rides]
  );

  const selectedRide = ride || pendingRides[0] || null;

  const handlePayWithPaystack = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      Alert.alert("Error", "You must be signed in to pay");
      return;
    }
    if (!selectedRide) {
      Alert.alert("Error", "No ride selected for payment");
      return;
    }

    setProcessing(true);

    try {
      const initResult = await fetchAPI("/(api)/paystack", {
        method: "POST",
        body: JSON.stringify({
          action: "initialize",
          amount: Number(selectedRide.fare_price),
          email: user.primaryEmailAddress.emailAddress,
          rideData: { ride_id: selectedRide.ride_id },
        }),
      });

      if (!initResult.authorization_url) {
        Alert.alert("Error", initResult.error || "Failed to initialize payment");
        setProcessing(false);
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(
        initResult.authorization_url,
        "celer://payment/callback"
      );

      if (result.type === "success") {
        const url = new URL(result.url);
        const reference =
          url.searchParams.get("reference") || initResult.reference;

        const verifyResult = await fetchAPI("/(api)/paystack", {
          method: "POST",
          body: JSON.stringify({ action: "verify", reference }),
        });

        if (verifyResult.verified) {
          await markAsPaid(selectedRide.ride_id);
          Alert.alert("Payment successful", "Thank you for your payment!", [
            {
              text: "OK",
              onPress: () => router.replace("/(root)/(tabs)/rides"),
            },
          ]);
        } else {
          Alert.alert(
            "Payment failed",
            verifyResult.error || "Could not verify payment"
          );
        }
      } else {
        Alert.alert("Payment cancelled", "You cancelled the payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const markAsPaid = async (rideId: number) => {
    try {
      await fetchAPI("/(api)/ride", {
        method: "PATCH",
        body: JSON.stringify({
          ride_id: rideId,
          payment_status: "paid",
        }),
      });
    } catch (error) {
      console.error("Failed to update ride:", error);
    }
  };

  if (!selectedRide) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-row items-center px-5 py-4 bg-white border-b border-slate-100">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} />
          </TouchableOpacity>
          <Text className="ml-4 text-lg font-JakartaBold text-slate-900">
            Pay for Ride
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-5">
          <Ionicons name="card-outline" size={48} color="#94a3b8" />
          <Text className="text-lg font-JakartaMedium text-slate-500 mt-4">
            No pending payments
          </Text>
          <Text className="text-sm font-Jakarta text-slate-400 mt-1 text-center">
            All your rides have been paid for.
          </Text>
          <CustomButton
            title="Go to Rides"
            onPress={() => router.replace("/(root)/(tabs)/rides")}
            className="mt-4 w-40"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-JakartaBold text-slate-900">
          Complete Payment
        </Text>
      </View>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-5 rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={20} color="#d97706" />
            <Text className="text-sm font-JakartaMedium text-amber-700 ml-2">
              Pay after your trip — settle up once you arrive
            </Text>
          </View>
        </View>

        {/* Ride details */}
        <View className="mt-4 rounded-2xl bg-white border border-slate-200 p-4">
          <Text className="text-sm font-JakartaBold text-slate-400 uppercase tracking-wider mb-3">
            Trip details
          </Text>

          <View className="flex-row items-start mb-3">
            <View className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-JakartaMedium text-slate-500">
                From
              </Text>
              <Text className="text-base font-JakartaSemiBold text-slate-900">
                {selectedRide.origin_address}
              </Text>
            </View>
          </View>

          <View className="h-6 border-l-2 border-dashed border-slate-300 ml-[3px] mb-3" />

          <View className="flex-row items-start mb-3">
            <View className="w-2 h-2 rounded-full bg-general-400 mt-2" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-JakartaMedium text-slate-500">To</Text>
              <Text className="text-base font-JakartaSemiBold text-slate-900">
                {selectedRide.destination_address}
              </Text>
            </View>
          </View>
        </View>

        {/* Driver info */}
        {selectedRide.driver && (
          <View className="mt-4 rounded-2xl bg-white border border-slate-200 p-4 flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
              <Ionicons name="person" size={22} color="#0286FF" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-JakartaSemiBold text-slate-900">
                {selectedRide.driver.first_name} {selectedRide.driver.last_name}
              </Text>
              <Text className="text-sm font-JakartaMedium text-slate-500">
                {selectedRide.driver.car_seats} seats
              </Text>
            </View>
          </View>
        )}

        {/* Fare summary */}
        <View className="mt-4 rounded-2xl bg-white border border-slate-200 p-4">
          <Text className="text-sm font-JakartaBold text-slate-400 uppercase tracking-wider mb-3">
            Fare summary
          </Text>

          <View className="flex-row justify-between items-center py-2">
            <Text className="text-base font-JakartaMedium text-slate-700">
              Fare
            </Text>
            <Text className="text-base font-JakartaSemiBold text-slate-900">
              ${selectedRide.fare_price}
            </Text>
          </View>

          <View className="flex-row justify-between items-center py-2">
            <Text className="text-base font-JakartaMedium text-slate-700">
              Duration
            </Text>
            <Text className="text-base font-JakartaSemiBold text-slate-900">
              {formatTime(selectedRide.ride_time)}
            </Text>
          </View>

          <View className="h-px bg-slate-100 my-2" />

          <View className="flex-row justify-between items-center py-1">
            <Text className="text-lg font-JakartaBold text-slate-900">Total</Text>
            <Text className="text-xl font-JakartaExtraBold text-primary-500">
              ${selectedRide.fare_price}
            </Text>
          </View>
        </View>

        {/* Pay button */}
        <View className="mt-6 mb-8">
          <CustomButton
            title={processing ? "Processing..." : `Pay $${selectedRide.fare_price} with Paystack`}
            onPress={handlePayWithPaystack}
            disabled={processing}
          />
          {processing && (
            <ActivityIndicator size="small" color="#0286FF" className="mt-2" />
          )}
          <Text className="text-xs text-slate-400 text-center mt-2">
            Secure payments powered by Paystack
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Payment;
