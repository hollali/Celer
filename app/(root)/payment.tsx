import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PaymentMethod = {
  id: string;
  label: string;
  expiry: string;
  brand: "card" | "wallet";
};

const initialMethods: PaymentMethod[] = [
  { id: "pm-1", label: "Visa •••• 1234", expiry: "08/28", brand: "card" },
  { id: "pm-2", label: "Mastercard •••• 4521", expiry: "03/27", brand: "card" },
  { id: "pm-3", label: "Celer Wallet", expiry: "Balance: GH₵48.20", brand: "wallet" },
];

const Payment = () => {
  const [methods, setMethods] = useState(initialMethods);
  const [defaultMethod, setDefaultMethod] = useState("pm-1");
  const [autopay, setAutopay] = useState(true);
  const [saveReceipts, setSaveReceipts] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const addMethod = () => {
    const count = methods.length + 1;
    setMethods((prev) => [
      ...prev,
      {
        id: `pm-${count}`,
        label: `Visa •••• ${1200 + count}`,
        expiry: "11/29",
        brand: "card",
      },
    ]);
  };

  const estimatedNextRide = useMemo(() => {
    if (appliedPromo) return "GH₵16.90";
    return "GH₵21.00";
  }, [appliedPromo]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-JakartaBold text-slate-900">Payment</Text>
      </View>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-5 rounded-2xl bg-emerald-600 p-4">
          <Text className="text-white font-JakartaBold">Billing Overview</Text>
          <Text className="text-emerald-100 mt-1 text-xs">Estimated next ride total</Text>
          <Text className="text-white text-2xl mt-1 font-JakartaBold">{estimatedNextRide}</Text>
          {appliedPromo && (
            <Text className="text-emerald-100 text-xs mt-1">Promo active: {appliedPromo}</Text>
          )}
        </View>

        <View className="mt-4 rounded-2xl bg-white border border-slate-100 overflow-hidden">
          <View className="px-4 py-4 flex-row items-center justify-between">
            <Text className="font-JakartaMedium text-slate-900">Saved Methods</Text>
            <TouchableOpacity onPress={addMethod}>
              <Text className="text-blue-600 font-JakartaMedium">+ Add</Text>
            </TouchableOpacity>
          </View>
          {methods.map((method, index) => {
            const selected = defaultMethod === method.id;
            return (
              <View key={method.id}>
                <TouchableOpacity
                  onPress={() => setDefaultMethod(method.id)}
                  className="px-4 py-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      className={`h-9 w-9 rounded-lg items-center justify-center ${
                        method.brand === "wallet" ? "bg-violet-100" : "bg-slate-100"
                      }`}
                    >
                      <Ionicons
                        name={method.brand === "wallet" ? "wallet-outline" : "card-outline"}
                        size={18}
                        color={method.brand === "wallet" ? "#6d28d9" : "#334155"}
                      />
                    </View>
                    <View className="ml-3">
                      <Text className="font-JakartaMedium text-slate-800">{method.label}</Text>
                      <Text className="text-xs text-slate-500">{method.expiry}</Text>
                    </View>
                  </View>
                  <View
                    className={`h-5 w-5 rounded-full border-2 items-center justify-center ${
                      selected ? "border-blue-600" : "border-slate-300"
                    }`}
                  >
                    {selected && <View className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
                  </View>
                </TouchableOpacity>
                {index !== methods.length - 1 && <View className="h-px bg-slate-100" />}
              </View>
            );
          })}
        </View>

        <View className="mt-4 rounded-2xl bg-white border border-slate-100 p-4">
          <Text className="font-JakartaMedium text-slate-900">Promo code</Text>
          <View className="mt-3 flex-row">
            <TextInput
              value={promoCode}
              onChangeText={setPromoCode}
              placeholder="Enter code"
              autoCapitalize="characters"
              className="flex-1 border border-slate-200 rounded-l-xl px-3 py-3 bg-slate-50"
            />
            <TouchableOpacity
              onPress={() => setAppliedPromo(promoCode.trim() || null)}
              className="px-4 rounded-r-xl bg-slate-900 items-center justify-center"
            >
              <Text className="text-white font-JakartaMedium">Apply</Text>
            </TouchableOpacity>
          </View>
          {appliedPromo && (
            <Text className="mt-2 text-emerald-700 text-xs">Applied {appliedPromo} successfully.</Text>
          )}
        </View>

        <View className="mt-4 mb-8 rounded-2xl bg-white border border-slate-100 overflow-hidden">
          <View className="px-4 py-4 flex-row items-center justify-between">
            <View className="pr-3 flex-1">
              <Text className="font-JakartaMedium text-slate-900">Auto-pay rides</Text>
              <Text className="text-xs text-slate-500">Charge the default method when a ride ends.</Text>
            </View>
            <Switch value={autopay} onValueChange={setAutopay} />
          </View>
          <View className="h-px bg-slate-100" />
          <View className="px-4 py-4 flex-row items-center justify-between">
            <View className="pr-3 flex-1">
              <Text className="font-JakartaMedium text-slate-900">Email receipts</Text>
              <Text className="text-xs text-slate-500">Send receipt immediately after each payment.</Text>
            </View>
            <Switch value={saveReceipts} onValueChange={setSaveReceipts} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Payment;
