import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Link, router } from "expo-router";
import React from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/ThemeContext";
import { a11y, a11yButton, a11yImage, a11yHeader } from "@/lib/accessibility";

// Reusable Components

const RowDivider = () => (
  <View className="mx-4 h-px bg-gray-100 dark:bg-dark-border" accessibilityRole="none" />
);

interface MenuRowProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  badge?: string;
  onPress: () => void;
  danger?: boolean;
  accessibilityHint?: string;
  isDark?: boolean;
}

const MenuRow = ({
  icon,
  label,
  badge,
  onPress,
  danger = false,
  accessibilityHint,
  isDark = false,
}: MenuRowProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="flex-row items-center px-5 py-4"
    {...a11yButton(label, accessibilityHint)}
  >
    <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-dark-card">
      <Ionicons name={icon} size={18} color={danger ? "#EF4444" : isDark ? "#F5F5F7" : "#0F172A"} />
    </View>

    <Text
      className={`flex-1 font-JakartaMedium text-base ${
        danger ? "text-red-500" : "text-gray-900 dark:text-dark-text"
      }`}
    >
      {label}
    </Text>

    {badge && (
      <View className="mr-2 rounded-full bg-green-500 px-2 py-0.5">
        <Text className="font-JakartaBold text-[10px] text-white">{badge}</Text>
      </View>
    )}

    <Ionicons name="chevron-forward" size={18} color={isDark ? "#636366" : "#94A3B8"} />
  </TouchableOpacity>
);

const GlassMenuSection = ({ children, isDark }: { children: React.ReactNode; isDark: boolean }) => {
  return (
    <BlurView
      intensity={70}
      tint={isDark ? "systemMaterialDark" : "systemThinMaterialLight"}
      style={{ marginHorizontal: 20, marginTop: 24, borderRadius: 16, overflow: "hidden" }}
    >
      {children}
    </BlurView>
  );
};

// Quick Action Button
interface QuickActionProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  accessibilityHint?: string;
  isDark?: boolean;
}

const QuickAction = ({
  icon,
  label,
  onPress,
  accessibilityHint,
  isDark = false,
}: QuickActionProps) => {
  const { useLiquidGlass } = useTheme();
  if (useLiquidGlass) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{ flex: 1, borderRadius: 16, overflow: "hidden" }}
        {...a11yButton(label, accessibilityHint)}
      >
        <BlurView
          intensity={60}
          tint={isDark ? "systemMaterialDark" : "systemThinMaterialLight"}
          style={{ alignItems: "center", paddingVertical: 16, gap: 8 }}
        >
          <View className="h-11 w-11 items-center justify-center rounded-full bg-white/50 dark:bg-white/10">
            <Ionicons name={icon} size={19} color={isDark ? "#F5F5F7" : "#0F172A"} />
          </View>
          <Text className="font-JakartaMedium text-sm text-slate-700 dark:text-dark-text-secondary">
            {label}
          </Text>
        </BlurView>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-4 dark:border-dark-border dark:bg-dark-card"
      {...a11yButton(label, accessibilityHint)}
    >
      <View className="h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-dark-bg">
        <Ionicons name={icon} size={19} color={isDark ? "#F5F5F7" : "#0F172A"} />
      </View>
      <Text className="font-JakartaMedium text-sm text-slate-700 dark:text-dark-text-secondary">
        {label}
      </Text>
    </TouchableOpacity>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  isDark?: boolean;
}

const StatCard = ({ label, value, icon, isDark = false }: StatCardProps) => {
  const { useLiquidGlass } = useTheme();
  if (useLiquidGlass) {
    return (
      <BlurView
        intensity={60}
        tint={isDark ? "systemMaterialDark" : "systemThinMaterialLight"}
        style={{
          flex: 1,
          borderRadius: 16,
          overflow: "hidden",
          paddingHorizontal: 12,
          paddingVertical: 16,
        }}
        {...a11y(`${label}: ${value}`)}
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-white/50 dark:bg-white/10">
          <Ionicons name={icon} size={16} color={isDark ? "#F5F5F7" : "#0F172A"} />
        </View>
        <Text className="mt-3 font-JakartaBold text-lg text-slate-900 dark:text-dark-text">
          {value}
        </Text>
        <Text className="mt-1 font-JakartaMedium text-xs uppercase tracking-wide text-slate-500 dark:text-dark-text-secondary">
          {label}
        </Text>
      </BlurView>
    );
  }
  return (
    <View
      className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 dark:border-dark-border dark:bg-dark-card"
      {...a11y(`${label}: ${value}`)}
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-dark-bg">
        <Ionicons name={icon} size={16} color={isDark ? "#F5F5F7" : "#0F172A"} />
      </View>
      <Text className="mt-3 font-JakartaBold text-lg text-slate-900 dark:text-dark-text">
        {value}
      </Text>
      <Text className="mt-1 font-JakartaMedium text-xs uppercase tracking-wide text-slate-500 dark:text-dark-text-secondary">
        {label}
      </Text>
    </View>
  );
};

// Menu Section (extracted to avoid duplication)
const MenuSection = ({
  isDark,
  useLiquidGlass,
  themeMode,
}: {
  isDark: boolean;
  useLiquidGlass: boolean;
  themeMode: string;
}) => {
  const menuItems = (
    <>
      <MenuRow
        icon="notifications-outline"
        label="Notifications"
        accessibilityHint="View your notifications"
        onPress={() => router.push("/notifications")}
        isDark={isDark}
      />
      <RowDivider />
      <MenuRow
        icon="shield-checkmark-outline"
        label="Safety Settings"
        accessibilityHint="Configure safety features"
        onPress={() => router.push("/safety")}
        isDark={isDark}
      />
      <RowDivider />
      <MenuRow
        icon="moon-outline"
        label="Appearance"
        badge={themeMode === "system" ? "System" : themeMode === "dark" ? "Dark" : "Light"}
        accessibilityHint="Choose light, dark, or system appearance"
        onPress={() => router.push("/appearance")}
        isDark={isDark}
      />
      <RowDivider />
      <MenuRow
        icon="pricetags-outline"
        label="Promotions"
        badge="2 NEW"
        accessibilityHint="View available promotions and offers"
        onPress={() => router.push("/promotions")}
        isDark={isDark}
      />
      <RowDivider />
      <MenuRow
        icon="help-circle-outline"
        label="Help & Support"
        accessibilityHint="Get help and contact support"
        onPress={() => router.push("/help")}
        isDark={isDark}
      />
      <RowDivider />
      <MenuRow
        icon="document-text-outline"
        label="Legal & Privacy"
        accessibilityHint="Review legal agreements and privacy settings"
        onPress={() => router.push("/legal")}
        isDark={isDark}
      />
      <RowDivider />
      <MenuRow
        icon="car-sport-outline"
        label="Become a Driver"
        accessibilityHint="Apply to drive with Celer"
        onPress={() => router.push("/(driver)/(tabs)")}
        isDark={isDark}
      />
    </>
  );

  if (useLiquidGlass) {
    return <GlassMenuSection isDark={isDark}>{menuItems}</GlassMenuSection>;
  }

  return (
    <View className="mx-5 mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-dark-border dark:bg-dark-card">
      {menuItems}
    </View>
  );
};

// Main Component
const Profile = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { isDark, themeMode, useLiquidGlass } = useTheme();

  const fullName = user?.fullName || "Celer Rider";
  const email = user?.primaryEmailAddress?.emailAddress || "No email available";
  const avatar = user?.imageUrl;
  const firstLetter = fullName.charAt(0).toUpperCase();
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Unknown";

  const rating = "—";
  const totalTrips = "—";
  const loyaltyTier = "—";

  const handleSignOut = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-bg">
      <SignedIn>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 48 }}
        >
          {/* Top bar  */}
          <View className="flex-row items-center justify-between px-5 pb-2 pt-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-dark-card"
              {...a11yButton("Go back", "Return to previous screen")}
            >
              <Ionicons name="chevron-back" size={20} color={isDark ? "#F5F5F7" : "#0F172A"} />
            </TouchableOpacity>
            <Text
              className="font-JakartaBold text-lg text-slate-900 dark:text-dark-text"
              {...a11yHeader("Account")}
            >
              Account
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/edit-profile")}
              className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-dark-card"
              {...a11yButton("Edit profile", "Change your name, email, and preferences")}
            >
              <Ionicons name="create-outline" size={19} color={isDark ? "#F5F5F7" : "#0F172A"} />
            </TouchableOpacity>
          </View>

          {/* Avatar section  */}
          <View className="mb-4 mt-6 items-center">
            <View className="relative">
              {avatar ? (
                <Image
                  source={{ uri: avatar }}
                  className="h-28 w-28 rounded-full"
                  {...a11yImage("Your profile photo")}
                />
              ) : (
                <View className="h-28 w-28 items-center justify-center rounded-full bg-orange-200">
                  <Text className="font-JakartaExtraBold text-5xl text-white">{firstLetter}</Text>
                </View>
              )}
              <View className="absolute bottom-1 right-1 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-dark-bg">
                <Ionicons name="checkmark" size={15} color="#FFFFFF" />
              </View>
            </View>

            <Text className="mt-4 font-JakartaBold text-2xl text-gray-900 dark:text-dark-text">
              {fullName}
            </Text>

            <View className="mt-1 flex-row items-center gap-1">
              <MaterialCommunityIcons name="star-four-points" size={13} color="#16A34A" />
              <Text className="font-Jakarta text-sm text-gray-500 dark:text-dark-text-secondary">
                {rating} Rating
              </Text>
              <Text className="mx-1 text-gray-300 dark:text-dark-border">•</Text>
              <Text className="font-Jakarta text-sm text-gray-500 dark:text-dark-text-secondary">
                Member since {joinedDate}
              </Text>
            </View>
          </View>

          {/* Profile properties  */}
          <View className="mt-6 px-5">
            <Text className="font-JakartaBold text-sm uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
              Profile Overview
            </Text>
            <View className="mt-3 flex-row gap-3">
              <StatCard label="Rating" value={rating} icon="star-outline" isDark={isDark} />
              <StatCard label="Trips" value={totalTrips} icon="car-outline" isDark={isDark} />
              <StatCard label="Tier" value={loyaltyTier} icon="ribbon-outline" isDark={isDark} />
            </View>
            {useLiquidGlass ? (
              <BlurView
                intensity={60}
                tint={isDark ? "systemMaterialDark" : "systemThinMaterialLight"}
                style={{
                  marginTop: 12,
                  borderRadius: 16,
                  overflow: "hidden",
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                }}
              >
                <Text className="font-JakartaBold text-xs uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                  Primary Email
                </Text>
                <Text className="mt-2 font-JakartaMedium text-base text-slate-800 dark:text-dark-text">
                  {email}
                </Text>
              </BlurView>
            ) : (
              <View className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-dark-border dark:bg-dark-card">
                <Text className="font-JakartaBold text-xs uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                  Primary Email
                </Text>
                <Text className="mt-2 font-JakartaMedium text-base text-slate-800 dark:text-dark-text">
                  {email}
                </Text>
              </View>
            )}
          </View>

          {/* Quick actions  */}
          <View className="mt-6 flex-row gap-3 px-5">
            <QuickAction
              icon="time-outline"
              label="History"
              onPress={() => router.push("/ride-history")}
              accessibilityHint="View your ride history"
              isDark={isDark}
            />
            <QuickAction
              icon="card-outline"
              label="Payment"
              onPress={() => router.push("/payment")}
              accessibilityHint="Manage payments and pending rides"
              isDark={isDark}
            />
            <QuickAction
              icon="help-circle-outline"
              label="Support"
              onPress={() => router.push("/help")}
              accessibilityHint="Get help and support"
              isDark={isDark}
            />
          </View>

          {/* Menu rows */}
          <MenuSection isDark={isDark} useLiquidGlass={useLiquidGlass} themeMode={themeMode} />

          {/* Log Out button */}
          <View className="mx-5 mt-6">
            {useLiquidGlass ? (
              <BlurView
                intensity={60}
                tint={isDark ? "systemMaterialDark" : "systemThinMaterialLight"}
                style={{ borderRadius: 999, overflow: "hidden" }}
              >
                <TouchableOpacity
                  onPress={handleSignOut}
                  activeOpacity={0.8}
                  className="flex-row items-center justify-center gap-2 py-4"
                  {...a11yButton("Log Out", "Sign out of your account")}
                >
                  <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                  <Text className="font-JakartaBold text-base text-red-500">Log Out</Text>
                </TouchableOpacity>
              </BlurView>
            ) : (
              <TouchableOpacity
                onPress={handleSignOut}
                activeOpacity={0.8}
                className="flex-row items-center justify-center gap-2 rounded-full bg-red-50 py-4 dark:bg-red-900/20"
                {...a11yButton("Log Out", "Sign out of your account")}
              >
                <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                <Text className="font-JakartaBold text-base text-red-500">Log Out</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* App version */}
          <Text className="mt-6 text-center font-JakartaMedium text-xs uppercase tracking-widest text-gray-300 dark:text-dark-text-tertiary">
            APP VERSION 1.0.0 • CELER
          </Text>
        </ScrollView>
      </SignedIn>

      <SignedOut>
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-dark-card">
            <Ionicons name="person-outline" size={38} color="#64748B" />
          </View>
          <Text className="mt-4 font-JakartaSemiBold text-xl text-black dark:text-dark-text">
            You're not signed in
          </Text>
          <Text className="mt-2 text-center font-Jakarta text-base text-gray-500 dark:text-dark-text-secondary">
            Sign in to view your profile, rides, and settings.
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity className="mt-8 w-full items-center rounded-full bg-blue-500 py-4">
              <Text className="font-JakartaBold text-lg text-white">Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SignedOut>
    </SafeAreaView>
  );
};

export default Profile;
