import { useUser, useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/customButton";
import { CURRENCY_SYMBOL } from "@/constants";
import { fetchAPI, useFetch } from "@/lib/fetch";
import { formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";
import { a11y, a11yButton, a11yHeader } from "@/lib/accessibility";
import { useTheme } from "@/lib/ThemeContext";

type PaymentMethod = "paystack" | "momo" | "cash";
type MoMoProvider = "mtn" | "vodafone" | "airteltigo";

const Payment = () => {
  const { user } = useUser();
  const { rideData } = useLocalSearchParams<{ rideData?: string }>();
  const { isDark } = useTheme();
  const { getToken, isLoaded } = useAuth();

  const {
    data: rides,
    loading,
    refetch,
    error,
  } = useFetch<Ride[]>("/(api)/ride", getToken, isLoaded);

  const [ride, setRide] = useState<Ride | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paystack");
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [momoPhone, setMomoPhone] = useState("");
  const [momoProvider, setMomoProvider] = useState<MoMoProvider>("mtn");

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
    [rides],
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
    setPaymentFailed(false);

    try {
      const token = await getToken();
      const initResult = await fetchAPI(
        "/(api)/paystack",
        {
          method: "POST",
          body: JSON.stringify({
            action: "initialize",
            rideData: { ride_id: selectedRide.ride_id },
          }),
        },
        token,
      );

      if (!initResult.authorization_url) {
        Alert.alert("Error", initResult.error || "Failed to initialize payment");
        setPaymentFailed(true);
        setProcessing(false);
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(
        initResult.authorization_url,
        "celer://payment/callback",
      );

      if (result.type === "success") {
        const url = new URL(result.url);
        const reference = url.searchParams.get("reference") || initResult.reference;

        if (!reference) {
          Alert.alert("Error", "Payment reference not found. Please try again.");
          setPaymentFailed(true);
          setProcessing(false);
          return;
        }

        const verifyResult = await fetchAPI(
          "/(api)/paystack",
          {
            method: "POST",
            body: JSON.stringify({ action: "verify", reference }),
          },
          token,
        );

        if (verifyResult.verified) {
          const success = await markAsPaid(selectedRide.ride_id);
          if (success) {
            setPaymentFailed(false);
            Alert.alert("Payment successful", "Thank you for your payment!", [
              {
                text: "OK",
                onPress: () => router.replace("/(root)/(tabs)/rides"),
              },
            ]);
          }
        } else {
          Alert.alert("Payment failed", verifyResult.error || "Could not verify payment");
          setPaymentFailed(true);
        }
      } else {
        Alert.alert("Payment cancelled", "You cancelled the payment");
        setPaymentFailed(true);
      }
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
      setPaymentFailed(true);
    } finally {
      setProcessing(false);
    }
  };

  const handlePayWithCash = () => {
    if (!selectedRide) {
      Alert.alert("Error", "No ride selected");
      return;
    }

    Alert.alert("Pay with Cash", "You'll pay the driver directly in cash after the trip.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm Cash Payment",
        onPress: async () => {
          setProcessing(true);
          const success = await markAsPaid(selectedRide.ride_id);
          setProcessing(false);
          if (success) {
            Alert.alert("Trip Confirmed", "Your driver will expect cash payment upon arrival.", [
              {
                text: "OK",
                onPress: () => router.replace("/(root)/(tabs)/rides"),
              },
            ]);
          }
        },
      },
    ]);
  };

  const handlePayWithMomo = async () => {
    if (!selectedRide) {
      Alert.alert("Error", "No ride selected for payment");
      return;
    }
    const cleanPhone = momoPhone.replace(/\s/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    setProcessing(true);
    setPaymentFailed(false);

    try {
      const token = await getToken();
      const initResult = await fetchAPI(
        "/(api)/paystack",
        {
          method: "POST",
          body: JSON.stringify({
            action: "initialize_momo",
            rideData: { ride_id: selectedRide.ride_id },
            phone: cleanPhone,
            provider: momoProvider,
          }),
        },
        token,
      );

      if (!initResult.authorization_url) {
        Alert.alert("Error", initResult.error || "Failed to initialize Mobile Money payment");
        setPaymentFailed(true);
        setProcessing(false);
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(
        initResult.authorization_url,
        "celer://payment/callback",
      );

      if (result.type === "success") {
        const url = new URL(result.url);
        const reference = url.searchParams.get("reference") || initResult.reference;

        if (!reference) {
          Alert.alert("Error", "Payment reference not found. Please try again.");
          setPaymentFailed(true);
          setProcessing(false);
          return;
        }

        const verifyResult = await fetchAPI(
          "/(api)/paystack",
          {
            method: "POST",
            body: JSON.stringify({ action: "verify", reference }),
          },
          token,
        );

        if (verifyResult.verified) {
          const success = await markAsPaid(selectedRide.ride_id);
          if (success) {
            setPaymentFailed(false);
            Alert.alert("Payment successful", "Thank you for your Mobile Money payment!", [
              {
                text: "OK",
                onPress: () => router.replace("/(root)/(tabs)/rides"),
              },
            ]);
          }
        } else {
          Alert.alert("Payment failed", verifyResult.error || "Could not verify payment");
          setPaymentFailed(true);
        }
      } else {
        Alert.alert("Payment cancelled", "You cancelled the payment");
        setPaymentFailed(true);
      }
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
      setPaymentFailed(true);
    } finally {
      setProcessing(false);
    }
  };

  const markAsPaid = async (rideId: number): Promise<boolean> => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "Not authenticated. Please sign in again.");
        return false;
      }
      await fetchAPI(
        "/(api)/ride",
        {
          method: "PATCH",
          body: JSON.stringify({
            ride_id: Number(rideId),
            payment_status: "paid",
          }),
        },
        token,
      );
      return true;
    } catch (e) {
      console.log("markAsPaid error:", e);
      Alert.alert("Error", "Failed to update ride status. Please contact support.");
      return false;
    }
  };

  const handleCancelRide = () => {
    if (!selectedRide) return;
    Alert.alert("Cancel Ride", "Are you sure you want to cancel this ride?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getToken();
            await fetchAPI(
              `/(api)/ride?ride_id=${selectedRide.ride_id}`,
              {
                method: "DELETE",
              },
              token,
            );
            Alert.alert("Ride Canceled", "Your ride has been canceled.", [
              { text: "OK", onPress: () => router.replace("/(root)/(tabs)/rides") },
            ]);
          } catch {
            Alert.alert("Error", "Failed to cancel ride. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-dark-bg">
      <View className="flex-row items-center border-b border-slate-100 bg-white px-5 py-4 dark:border-dark-border dark:bg-dark-card">
        <TouchableOpacity onPress={() => router.back()} {...a11yButton("Go back")}>
          <Ionicons name="chevron-back" size={22} color={isDark ? "#F5F5F7" : "#0F172A"} />
        </TouchableOpacity>
        <Text
          className="ml-4 font-JakartaBold text-lg text-slate-900 dark:text-dark-text"
          {...a11yHeader("Payment")}
        >
          Payment
        </Text>
      </View>

      <ScrollView
        className="px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor="#0286FF"
            colors={["#0286FF"]}
          />
        }
      >
        {error && (
          <View className="mt-4 rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
            <Text className="text-center font-JakartaMedium text-red-600 dark:text-red-400">
              {error}
            </Text>
            <TouchableOpacity onPress={refetch} className="mt-2">
              <Text className="text-center font-JakartaBold text-primary-500">Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        {selectedRide ? (
          <>
            <View className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700/30 dark:bg-amber-900/20">
              <View className="flex-row items-center">
                <Ionicons name="information-circle" size={20} color="#d97706" />
                <Text className="ml-2 font-JakartaMedium text-sm text-amber-700 dark:text-amber-400">
                  Pay after your trip — settle up once you arrive
                </Text>
              </View>
            </View>

            {/* Ride details */}
            <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
              <Text className="mb-3 font-JakartaBold text-sm uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary">
                Trip details
              </Text>

              <View className="mb-3 flex-row items-start">
                <View className="mt-2 h-2 w-2 rounded-full bg-primary-500" />
                <View className="ml-3 flex-1">
                  <Text className="font-JakartaMedium text-sm text-slate-500 dark:text-dark-text-secondary">
                    From
                  </Text>
                  <Text className="font-JakartaSemiBold text-base text-slate-900 dark:text-dark-text">
                    {selectedRide.origin_address}
                  </Text>
                </View>
              </View>

              <View className="mb-3 ml-[3px] h-6 border-l-2 border-dashed border-slate-300 dark:border-dark-border" />

              <View className="mb-3 flex-row items-start">
                <View className="mt-2 h-2 w-2 rounded-full bg-general-400" />
                <View className="ml-3 flex-1">
                  <Text className="font-JakartaMedium text-sm text-slate-500 dark:text-dark-text-secondary">
                    To
                  </Text>
                  <Text className="font-JakartaSemiBold text-base text-slate-900 dark:text-dark-text">
                    {selectedRide.destination_address}
                  </Text>
                </View>
              </View>
            </View>

            {/* Driver info */}
            {selectedRide.driver && (
              <View className="mt-4 flex-row items-center rounded-2xl border border-slate-200 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-800">
                  <Ionicons name="person" size={22} color="#0286FF" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-JakartaSemiBold text-base text-slate-900 dark:text-dark-text">
                    {selectedRide.driver.first_name} {selectedRide.driver.last_name}
                  </Text>
                  <Text className="font-JakartaMedium text-sm text-slate-500 dark:text-dark-text-secondary">
                    {selectedRide.driver.car_seats} seats
                  </Text>
                </View>
              </View>
            )}

            {/* Fare summary */}
            <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
              <Text
                className="mb-3 font-JakartaBold text-sm uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary"
                {...a11yHeader("Fare summary")}
              >
                Fare summary
              </Text>

              <View className="flex-row items-center justify-between py-2">
                <Text className="font-JakartaMedium text-base text-slate-700 dark:text-dark-text">
                  Fare
                </Text>
                <Text className="font-JakartaSemiBold text-base text-slate-900 dark:text-dark-text">
                  {CURRENCY_SYMBOL}
                  {selectedRide.fare_price}
                </Text>
              </View>

              <View className="flex-row items-center justify-between py-2">
                <Text className="font-JakartaMedium text-base text-slate-700 dark:text-dark-text">
                  Duration
                </Text>
                <Text className="font-JakartaSemiBold text-base text-slate-900 dark:text-dark-text">
                  {formatTime(selectedRide.ride_time)}
                </Text>
              </View>

              <View className="my-2 h-px bg-slate-100 dark:bg-dark-border" />

              <View className="flex-row items-center justify-between py-1">
                <Text className="font-JakartaBold text-lg text-slate-900 dark:text-dark-text">
                  Total
                </Text>
                <Text className="font-JakartaExtraBold text-xl text-primary-500">
                  {CURRENCY_SYMBOL}
                  {selectedRide.fare_price}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View className="items-center py-16">
            <Ionicons name="card-outline" size={48} color="#94a3b8" />
            <Text className="mt-4 font-JakartaMedium text-lg text-slate-500 dark:text-dark-text-secondary">
              No pending payments
            </Text>
            <Text className="mt-1 text-center font-Jakarta text-sm text-slate-400 dark:text-dark-text-tertiary">
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
        <Text className="mb-3 mt-6 font-JakartaBold text-xs uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
          Payment method
        </Text>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setPaymentMethod("paystack")}
            activeOpacity={0.7}
            className={`flex-1 items-center rounded-2xl border p-3 ${
              paymentMethod === "paystack"
                ? "border-primary-500 bg-primary-100 dark:bg-primary-900/30"
                : "border-slate-200 bg-white dark:border-dark-border dark:bg-dark-card"
            }`}
            {...a11yButton(
              "Paystack",
              "Pay online with Paystack",
              false,
              paymentMethod === "paystack",
            )}
          >
            <View
              className={`h-10 w-10 items-center justify-center rounded-full ${paymentMethod === "paystack" ? "bg-primary-500" : "bg-slate-100 dark:bg-dark-bg"}`}
            >
              <Ionicons
                name="card-outline"
                size={20}
                color={paymentMethod === "paystack" ? "#FFFFFF" : isDark ? "#F5F5F7" : "#0F172A"}
              />
            </View>
            <Text
              className={`mt-2 font-JakartaSemiBold text-xs ${paymentMethod === "paystack" ? "text-primary-700 dark:text-primary-300" : "text-slate-900 dark:text-dark-text"}`}
            >
              Paystack
            </Text>
            <Text
              className={`mt-0.5 font-JakartaMedium text-[10px] ${paymentMethod === "paystack" ? "text-primary-600 dark:text-primary-400" : "text-slate-500 dark:text-dark-text-secondary"}`}
            >
              Card
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPaymentMethod("momo")}
            activeOpacity={0.7}
            className={`flex-1 items-center rounded-2xl border p-3 ${
              paymentMethod === "momo"
                ? "border-primary-500 bg-primary-100 dark:bg-primary-900/30"
                : "border-slate-200 bg-white dark:border-dark-border dark:bg-dark-card"
            }`}
            {...a11yButton(
              "Mobile Money",
              "Pay with MTN MoMo, Vodafone, or AirtelTigo",
              false,
              paymentMethod === "momo",
            )}
          >
            <View
              className={`h-10 w-10 items-center justify-center rounded-full ${paymentMethod === "momo" ? "bg-primary-500" : "bg-slate-100 dark:bg-dark-bg"}`}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={20}
                color={paymentMethod === "momo" ? "#FFFFFF" : isDark ? "#F5F5F7" : "#0F172A"}
              />
            </View>
            <Text
              className={`mt-2 font-JakartaSemiBold text-xs ${paymentMethod === "momo" ? "text-primary-700 dark:text-primary-300" : "text-slate-900 dark:text-dark-text"}`}
            >
              MoMo
            </Text>
            <Text
              className={`mt-0.5 font-JakartaMedium text-[10px] ${paymentMethod === "momo" ? "text-primary-600 dark:text-primary-400" : "text-slate-500 dark:text-dark-text-secondary"}`}
            >
              Mobile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPaymentMethod("cash")}
            activeOpacity={0.7}
            className={`flex-1 items-center rounded-2xl border p-3 ${
              paymentMethod === "cash"
                ? "border-primary-500 bg-primary-100 dark:bg-primary-900/30"
                : "border-slate-200 bg-white dark:border-dark-border dark:bg-dark-card"
            }`}
            {...a11yButton(
              "Cash",
              "Pay the driver directly with cash",
              false,
              paymentMethod === "cash",
            )}
          >
            <View
              className={`h-10 w-10 items-center justify-center rounded-full ${paymentMethod === "cash" ? "bg-primary-500" : "bg-slate-100 dark:bg-dark-bg"}`}
            >
              <Ionicons
                name="cash-outline"
                size={20}
                color={paymentMethod === "cash" ? "#FFFFFF" : isDark ? "#F5F5F7" : "#0F172A"}
              />
            </View>
            <Text
              className={`mt-2 font-JakartaSemiBold text-xs ${paymentMethod === "cash" ? "text-primary-700 dark:text-primary-300" : "text-slate-900 dark:text-dark-text"}`}
            >
              Cash
            </Text>
            <Text
              className={`mt-0.5 font-JakartaMedium text-[10px] ${paymentMethod === "cash" ? "text-primary-600 dark:text-primary-400" : "text-slate-500 dark:text-dark-text-secondary"}`}
            >
              Driver
            </Text>
          </TouchableOpacity>
        </View>

        {/* MoMo phone input */}
        {paymentMethod === "momo" && selectedRide && (
          <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
            <Text className="mb-3 font-JakartaBold text-sm uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary">
              Mobile Money
            </Text>

            {/* Provider selector */}
            <View className="mb-3 flex-row gap-2">
              {(["mtn", "vodafone", "airteltigo"] as MoMoProvider[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setMomoProvider(p)}
                  activeOpacity={0.7}
                  className={`flex-1 items-center rounded-xl border px-3 py-2 ${
                    momoProvider === p
                      ? "border-primary-500 bg-primary-100 dark:bg-primary-900/30"
                      : "border-slate-200 bg-slate-50 dark:border-dark-border dark:bg-dark-bg"
                  }`}
                >
                  <Text
                    className={`font-JakartaSemiBold text-xs capitalize ${
                      momoProvider === p
                        ? "text-primary-700 dark:text-primary-300"
                        : "text-slate-600 dark:text-dark-text-secondary"
                    }`}
                  >
                    {p === "airteltigo" ? "AT" : p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Phone input */}
            <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-dark-border dark:bg-dark-bg">
              <Text className="mr-2 font-JakartaMedium text-sm text-slate-500 dark:text-dark-text-secondary">
                +233
              </Text>
              <TextInput
                className="flex-1 py-3 font-JakartaMedium text-sm text-slate-900 dark:text-dark-text"
                placeholder="Mobile number"
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                keyboardType="phone-pad"
                value={momoPhone}
                onChangeText={setMomoPhone}
                maxLength={10}
              />
            </View>
            <Text className="mt-2 text-xs text-slate-400 dark:text-dark-text-tertiary">
              You'll receive a prompt on your phone to confirm
            </Text>
          </View>
        )}

        {/* Pay button */}
        {selectedRide && (
          <View className="mb-8 mt-6">
            {paymentMethod === "paystack" ? (
              <>
                <CustomButton
                  title={
                    processing
                      ? "Processing..."
                      : paymentFailed
                        ? `Retry Pay ${CURRENCY_SYMBOL}${selectedRide.fare_price}`
                        : `Pay ${CURRENCY_SYMBOL}${selectedRide.fare_price} with Paystack`
                  }
                  onPress={handlePayWithPaystack}
                  disabled={processing}
                />
                {processing && <ActivityIndicator size="small" color="#0286FF" className="mt-2" />}
                {paymentFailed && (
                  <TouchableOpacity onPress={handleCancelRide} className="mt-3 items-center">
                    <Text className="font-JakartaMedium text-sm text-slate-500 dark:text-dark-text-secondary">
                      Cancel this ride instead
                    </Text>
                  </TouchableOpacity>
                )}
                <Text className="mt-2 text-center text-xs text-slate-400 dark:text-dark-text-tertiary">
                  Secure payments powered by Paystack
                </Text>
              </>
            ) : paymentMethod === "momo" ? (
              <>
                <CustomButton
                  title={
                    processing
                      ? "Processing..."
                      : paymentFailed
                        ? `Retry Pay ${CURRENCY_SYMBOL}${selectedRide.fare_price}`
                        : `Pay ${CURRENCY_SYMBOL}${selectedRide.fare_price} with MoMo`
                  }
                  onPress={handlePayWithMomo}
                  disabled={processing || !momoPhone || momoPhone.length < 10}
                />
                {processing && <ActivityIndicator size="small" color="#0286FF" className="mt-2" />}
                {paymentFailed && (
                  <TouchableOpacity onPress={handleCancelRide} className="mt-3 items-center">
                    <Text className="font-JakartaMedium text-sm text-slate-500 dark:text-dark-text-secondary">
                      Cancel this ride instead
                    </Text>
                  </TouchableOpacity>
                )}
                <Text className="mt-2 text-center text-xs text-slate-400 dark:text-dark-text-tertiary">
                  MTN, Vodafone & AirtelTigo supported
                </Text>
              </>
            ) : (
              <>
                <CustomButton
                  title={
                    processing
                      ? "Confirming..."
                      : `Pay ${CURRENCY_SYMBOL}${selectedRide.fare_price} with Cash`
                  }
                  onPress={handlePayWithCash}
                  disabled={processing}
                  bgVariant="outline"
                  textVariant="primary"
                />
                <Text className="mt-2 text-center text-xs text-slate-400 dark:text-dark-text-tertiary">
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
