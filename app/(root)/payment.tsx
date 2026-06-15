import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/customButton";
import { fetchAPI, useFetch } from "@/lib/fetch";
import { formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";
import { a11y, a11yButton, a11yHeader } from "@/lib/accessibility";
import { useTheme } from "@/lib/ThemeContext";

type PaymentMethod = "paystack" | "cash";

const Payment = () => {
  const { user } = useUser();
  const { rideData } = useLocalSearchParams<{ rideData?: string }>();
  const email = user?.primaryEmailAddress?.emailAddress;
  const { isDark } = useTheme();

  const { data: rides } = useFetch<Ride[]>(`/(api)/ride?user_email=${email}`);

  const [ride, setRide] = useState<Ride | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paystack");

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

  const handlePayWithCash = () => {
    if (!selectedRide) {
      Alert.alert("Error", "No ride selected");
      return;
    }

    Alert.alert(
      "Pay with Cash",
      "You'll pay the driver directly in cash after the trip.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Cash Payment",
          onPress: async () => {
            setProcessing(true);
            await markAsPaid(selectedRide.ride_id);
            setProcessing(false);
            Alert.alert("Trip Confirmed", "Your driver will expect cash payment upon arrival.", [
              {
                text: "OK",
                onPress: () => router.replace("/(root)/(tabs)/rides"),
              },
            ]);
          },
        },
      ]
    );
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

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-dark-bg">
      <View className="flex-row items-center px-5 py-4 bg-white dark:bg-dark-card border-b border-slate-100 dark:border-dark-border">
        <TouchableOpacity onPress={() => router.back()} {...a11yButton("Go back")}>
          <Ionicons name="chevron-back" size={22} color={isDark ? "#F5F5F7" : "#0F172A"} />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-JakartaBold text-slate-900 dark:text-dark-text" {...a11yHeader("Payment")}>
          Payment
        </Text>
      </View>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        {selectedRide ? (
          <>
            <View className="mt-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 p-4">
              <View className="flex-row items-center">
                <Ionicons name="information-circle" size={20} color="#d97706" />
                <Text className="text-sm font-JakartaMedium text-amber-700 dark:text-amber-400 ml-2">
                  Pay after your trip — settle up once you arrive
                </Text>
              </View>
            </View>

            {/* Ride details */}
            <View className="mt-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-4">
              <Text className="text-sm font-JakartaBold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider mb-3">
                Trip details
              </Text>

              <View className="flex-row items-start mb-3">
                <View className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-JakartaMedium text-slate-500 dark:text-dark-text-secondary">
                    From
                  </Text>
                  <Text className="text-base font-JakartaSemiBold text-slate-900 dark:text-dark-text">
                    {selectedRide.origin_address}
                  </Text>
                </View>
              </View>

              <View className="h-6 border-l-2 border-dashed border-slate-300 dark:border-dark-border ml-[3px] mb-3" />

              <View className="flex-row items-start mb-3">
                <View className="w-2 h-2 rounded-full bg-general-400 mt-2" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-JakartaMedium text-slate-500 dark:text-dark-text-secondary">To</Text>
                  <Text className="text-base font-JakartaSemiBold text-slate-900 dark:text-dark-text">
                    {selectedRide.destination_address}
                  </Text>
                </View>
              </View>
            </View>

            {/* Driver info */}
            {selectedRide.driver && (
              <View className="mt-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-4 flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-800 items-center justify-center">
                  <Ionicons name="person" size={22} color="#0286FF" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base font-JakartaSemiBold text-slate-900 dark:text-dark-text">
                    {selectedRide.driver.first_name} {selectedRide.driver.last_name}
                  </Text>
                  <Text className="text-sm font-JakartaMedium text-slate-500 dark:text-dark-text-secondary">
                    {selectedRide.driver.car_seats} seats
                  </Text>
                </View>
              </View>
            )}

            {/* Fare summary */}
            <View className="mt-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-4">
              <Text className="text-sm font-JakartaBold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider mb-3" {...a11yHeader("Fare summary")}>
                Fare summary
              </Text>

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-base font-JakartaMedium text-slate-700 dark:text-dark-text">
                  Fare
                </Text>
                <Text className="text-base font-JakartaSemiBold text-slate-900 dark:text-dark-text">
                  ${selectedRide.fare_price}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-base font-JakartaMedium text-slate-700 dark:text-dark-text">
                  Duration
                </Text>
                <Text className="text-base font-JakartaSemiBold text-slate-900 dark:text-dark-text">
                  {formatTime(selectedRide.ride_time)}
                </Text>
              </View>

              <View className="h-px bg-slate-100 dark:bg-dark-border my-2" />

              <View className="flex-row justify-between items-center py-1">
                <Text className="text-lg font-JakartaBold text-slate-900 dark:text-dark-text">Total</Text>
                <Text className="text-xl font-JakartaExtraBold text-primary-500">
                  ${selectedRide.fare_price}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View className="items-center py-16">
            <Ionicons name="card-outline" size={48} color="#94a3b8" />
            <Text className="text-lg font-JakartaMedium text-slate-500 dark:text-dark-text-secondary mt-4">
              No pending payments
            </Text>
            <Text className="text-sm font-Jakarta text-slate-400 dark:text-dark-text-tertiary mt-1 text-center">
              All your rides have been paid for.
            </Text>
            <CustomButton
              title="Go to Rides"
              onPress={() => router.replace("/(root)/(tabs)/rides")}
              className="mt-4 w-40"
            />
          </View>
        )}

        {/* Payment method selector */}
        <Text className="mt-6 mb-3 text-xs font-JakartaBold uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
          Payment method
        </Text>

        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => setPaymentMethod("paystack")}
            activeOpacity={0.7}
            className={`flex-1 rounded-2xl border p-4 items-center ${
              paymentMethod === "paystack"
                ? "bg-primary-100 dark:bg-primary-900/30 border-primary-500"
                : "bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border"
            }`}
            {...a11yButton("Paystack", "Pay online with Paystack", false, paymentMethod === "paystack")}
          >
            <View className={`h-12 w-12 rounded-full items-center justify-center ${paymentMethod === "paystack" ? "bg-primary-500" : "bg-slate-100 dark:bg-dark-bg"}`}>
              <Ionicons name="card-outline" size={22} color={paymentMethod === "paystack" ? "#FFFFFF" : isDark ? "#F5F5F7" : "#0F172A"} />
            </View>
            <Text className={`mt-2 text-sm font-JakartaSemiBold ${paymentMethod === "paystack" ? "text-primary-700 dark:text-primary-300" : "text-slate-900 dark:text-dark-text"}`}>
              Paystack
            </Text>
            <Text className={`text-xs font-JakartaMedium mt-0.5 ${paymentMethod === "paystack" ? "text-primary-600 dark:text-primary-400" : "text-slate-500 dark:text-dark-text-secondary"}`}>
              Pay online
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPaymentMethod("cash")}
            activeOpacity={0.7}
            className={`flex-1 rounded-2xl border p-4 items-center ${
              paymentMethod === "cash"
                ? "bg-primary-100 dark:bg-primary-900/30 border-primary-500"
                : "bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border"
            }`}
            {...a11yButton("Cash", "Pay the driver directly with cash", false, paymentMethod === "cash")}
          >
            <View className={`h-12 w-12 rounded-full items-center justify-center ${paymentMethod === "cash" ? "bg-primary-500" : "bg-slate-100 dark:bg-dark-bg"}`}>
              <Ionicons name="cash-outline" size={22} color={paymentMethod === "cash" ? "#FFFFFF" : isDark ? "#F5F5F7" : "#0F172A"} />
            </View>
            <Text className={`mt-2 text-sm font-JakartaSemiBold ${paymentMethod === "cash" ? "text-primary-700 dark:text-primary-300" : "text-slate-900 dark:text-dark-text"}`}>
              Cash
            </Text>
            <Text className={`text-xs font-JakartaMedium mt-0.5 ${paymentMethod === "cash" ? "text-primary-600 dark:text-primary-400" : "text-slate-500 dark:text-dark-text-secondary"}`}>
              Pay driver
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pay button */}
        {selectedRide && (
          <View className="mt-6 mb-8">
            {paymentMethod === "paystack" ? (
              <>
                <CustomButton
                  title={processing ? "Processing..." : `Pay $${selectedRide.fare_price} with Paystack`}
                  onPress={handlePayWithPaystack}
                  disabled={processing}
                />
                {processing && (
                  <ActivityIndicator size="small" color="#0286FF" className="mt-2" />
                )}
                <Text className="text-xs text-slate-400 dark:text-dark-text-tertiary text-center mt-2">
                  Secure payments powered by Paystack
                </Text>
              </>
            ) : (
              <>
                <CustomButton
                  title={processing ? "Confirming..." : `Pay $${selectedRide.fare_price} with Cash`}
                  onPress={handlePayWithCash}
                  disabled={processing}
                  bgVariant="outline"
                  textVariant="primary"
                />
                <Text className="text-xs text-slate-400 dark:text-dark-text-tertiary text-center mt-2">
                  Pay the driver directly after the trip
                </Text>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Payment;
