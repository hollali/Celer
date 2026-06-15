import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { a11y, a11yButton, a11yHeader } from "@/lib/accessibility";
import { useTheme } from "@/lib/ThemeContext";

const promos = [
  {
    id: "1",
    title: "50% OFF your next ride",
    code: "CELER50",
    expiry: "Expires Mar 30",
    savings: 18,
    type: "percent",
  },
  {
    id: "2",
    title: "Free ride up to GH₵20",
    code: "FREERIDE",
    expiry: "Expires Apr 5",
    savings: 20,
    type: "flat",
  },
  {
    id: "3",
    title: "Airport drop bonus",
    code: "AIRPORT10",
    expiry: "Expires Apr 12",
    savings: 10,
    type: "flat",
  },
];

const Promotions = () => {
  const { isDark } = useTheme();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const totalSavings = useMemo(() => {
    return promos.reduce((sum, promo) => sum + promo.savings, 0);
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]));
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-dark-bg">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white dark:bg-dark-card border-b border-slate-100 dark:border-dark-border">
        <TouchableOpacity onPress={() => router.back()} {...a11yButton("Go back")}>
          <Ionicons name="chevron-back" size={22} color={isDark ? "#F5F5F7" : "#0F172A"} />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-JakartaBold text-slate-900 dark:text-dark-text" {...a11yHeader("Promotions")}>Promotions</Text>
      </View>

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-5 rounded-2xl bg-emerald-600 dark:bg-emerald-700 p-4">
          <Text className="text-white font-JakartaBold">Savings Wallet</Text>
          <Text className="text-emerald-100 mt-1 text-xs">Potential savings this month</Text>
          <Text className="text-white text-2xl mt-1 font-JakartaBold">GH₵{totalSavings.toFixed(2)}</Text>
          <Text className="text-emerald-100 text-xs mt-1">
            {promos.length} active offers available now.
          </Text>
        </View>

        <View className="mt-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border p-4">
          <Text className="font-JakartaMedium text-slate-900 dark:text-dark-text">Have a promo code?</Text>
          <View className="mt-3 flex-row">
            <TextInput
              value={promoCode}
              onChangeText={setPromoCode}
              placeholder="Enter code"
              placeholderTextColor="#8E8E93"
              autoCapitalize="characters"
              className="flex-1 border border-slate-200 dark:border-dark-border rounded-l-xl px-3 py-3 bg-slate-50 dark:bg-dark-bg text-black dark:text-dark-text"
              accessibilityLabel="Promo code"
            />
            <TouchableOpacity
              onPress={() => setAppliedPromo(promoCode.trim() || null)}
              className="px-4 rounded-r-xl bg-slate-900 dark:bg-primary-500 items-center justify-center"
              {...a11yButton("Apply promo code")}
            >
              <Text className="text-white font-JakartaMedium">Apply</Text>
            </TouchableOpacity>
          </View>
          {appliedPromo && (
            <Text className="mt-2 text-emerald-700 dark:text-emerald-400 text-xs">Applied {appliedPromo} successfully.</Text>
          )}
        </View>

        <Text className="mt-5 mb-2 text-slate-600 dark:text-dark-text-secondary text-xs font-JakartaMedium">AVAILABLE OFFERS</Text>
        {promos.map((promo) => (
          <View
            key={promo.id}
            className="mb-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-white dark:bg-dark-card p-4"
            {...a11y(`${promo.title} - ${promo.expiry}`)}
          >
            <View className="flex-row justify-between">
              <View className="flex-1 pr-3">
                <Text className="font-JakartaBold text-slate-900 dark:text-dark-text">{promo.title}</Text>
                <Text className="mt-1 text-xs text-slate-500 dark:text-dark-text-secondary">{promo.expiry}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(promo.id)} {...a11yButton(favorites.includes(promo.id) ? "Remove from favorites" : "Add to favorites")}>
                <Ionicons
                  name={favorites.includes(promo.id) ? "heart" : "heart-outline"}
                  size={20}
                  color={favorites.includes(promo.id) ? "#ef4444" : "#64748b"}
                />
              </TouchableOpacity>
            </View>
            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-sm text-slate-700 dark:text-dark-text-secondary">
                Code: <Text className="font-JakartaBold dark:text-dark-text">{promo.code}</Text>
              </Text>
              <Text className="text-emerald-700 dark:text-emerald-400 font-JakartaBold">
                {promo.type === "percent" ? "Up to GH₵18.00 off" : `GH₵${promo.savings.toFixed(2)} off`}
              </Text>
            </View>
            <TouchableOpacity
              className="mt-3 items-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30 py-2"
              {...a11yButton(`Use ${promo.code} offer`)}
            >
              <Text className="text-emerald-700 dark:text-emerald-400 font-JakartaMedium">Use this offer</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Promotions;
