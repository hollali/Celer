import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { useTheme } from "@/lib/ThemeContext";
import { useFetch, fetchAPI } from "@/lib/fetch";
import {
  a11y,
  a11yButton,
  a11yHeader,
} from "@/lib/accessibility";

interface Notification {
  id: string;
  type: "ride" | "promo" | "safety" | "support" | "general";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const NOTIFICATION_ICONS: Record<
  Notification["type"],
  React.ComponentProps<typeof Ionicons>["name"]
> = {
  ride: "car-outline",
  promo: "pricetags-outline",
  safety: "shield-checkmark-outline",
  support: "help-circle-outline",
  general: "notifications-outline",
};

const NOTIFICATION_COLORS: Record<Notification["type"], string> = {
  ride: "#3B82F6",
  promo: "#8B5CF6",
  safety: "#10B981",
  support: "#F59E0B",
  general: "#6B7280",
};

function getDateGroup(dateString: string): "Today" | "Yesterday" | "Earlier" {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const notifDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (notifDate.getTime() === today.getTime()) return "Today";
  if (notifDate.getTime() === yesterday.getTime()) return "Yesterday";
  return "Earlier";
}

function groupNotifications(notifications: Notification[]) {
  const groups: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };
  for (const n of notifications) {
    groups[getDateGroup(n.createdAt)].push(n);
  }
  return Object.entries(groups).filter(([, items]) => items.length > 0);
}

const NotificationsScreen = () => {
  const { getToken, isLoaded } = useAuth();
  const { isDark, useLiquidGlass } = useTheme();

  const {
    data: notifications,
    loading,
    error,
    refetch,
  } = useFetch<Notification[]>("/(api)/notifications", getToken, isLoaded);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        const token = await getToken();
        await fetchAPI(
          "/(api)/notifications",
          {
            method: "PATCH",
            body: JSON.stringify({ id }),
          },
          token
        );
        refetch();
      } catch (e) {
        // silently fail
      }
    },
    [getToken, refetch]
  );

  const markAllRead = useCallback(async () => {
    try {
      const token = await getToken();
      await fetchAPI(
        "/(api)/notifications",
        {
          method: "PATCH",
          body: JSON.stringify({ markAll: true }),
        },
        token
      );
      refetch();
    } catch (e) {
      // silently fail
    }
  }, [getToken, refetch]);

  const grouped = useMemo(
    () => groupNotifications(notifications ?? []),
    [notifications]
  );

  const unreadCount = useMemo(
    () => (notifications ?? []).filter((n) => !n.read).length,
    [notifications]
  );

  const getBackground = () => {
    if (useLiquidGlass) return "transparent";
    return isDark ? "#0C0C0E" : "#FFFFFF";
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => !item.read && markAsRead(item.id)}
      activeOpacity={0.7}
      className={`flex-row items-start px-5 py-4 ${
        item.read ? "opacity-60" : ""
      }`}
      {...a11yButton(
        `${item.title}: ${item.body}`,
        item.read ? "Already read" : "Tap to mark as read"
      )}
    >
      <View
        className="mr-3 mt-0.5 h-10 w-10 items-center justify-center rounded-full"
        style={{
          backgroundColor: `${NOTIFICATION_COLORS[item.type]}15`,
        }}
      >
        <Ionicons
          name={NOTIFICATION_ICONS[item.type]}
          size={18}
          color={NOTIFICATION_COLORS[item.type]}
        />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text
            className={`flex-1 text-base font-JakartaSemiBold ${
              item.read
                ? "text-gray-500 dark:text-dark-text-secondary"
                : "text-gray-900 dark:text-dark-text"
            }`}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {!item.read && (
            <View className="ml-2 h-2 w-2 rounded-full bg-blue-500" />
          )}
        </View>
        <Text
          className="mt-1 text-sm font-Jakarta text-gray-500 dark:text-dark-text-secondary"
          numberOfLines={2}
        >
          {item.body}
        </Text>
        <Text className="mt-1.5 text-xs font-Jakarta text-gray-400 dark:text-dark-text-tertiary">
          {new Date(item.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({
    section: [title],
  }: {
    section: [string, Notification[]];
  }) => (
    <Text
      className="px-5 pt-5 pb-2 text-xs font-JakartaBold uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary"
      {...a11yHeader(title)}
    >
      {title}
    </Text>
  );

  const sections = grouped.map(([title, items]) => ({
    title,
    data: items,
  }));

  const flatData = useMemo(() => {
    const result: (Notification | string)[] = [];
    for (const section of sections) {
      result.push(section.title);
      result.push(...section.data);
    }
    return result;
  }, [sections]);

  const renderFlatItem = ({
    item,
  }: {
    item: Notification | string;
  }) => {
    if (typeof item === "string") {
      return (
        <Text
          className="px-5 pt-5 pb-2 text-xs font-JakartaBold uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary"
          {...a11yHeader(item)}
        >
          {item}
        </Text>
      );
    }
    return renderItem({ item });
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: getBackground() }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-2 pt-4">
        <TouchableOpacity
          onPress={() => {}}
          className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-dark-card"
          accessibilityLabel="Back"
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={isDark ? "#F5F5F7" : "#0F172A"}
          />
        </TouchableOpacity>
        <Text
          className="text-lg font-JakartaBold text-slate-900 dark:text-dark-text"
          {...a11yHeader("Notifications")}
        >
          Notifications
        </Text>
        {unreadCount > 0 ? (
          <TouchableOpacity
            onPress={markAllRead}
            activeOpacity={0.7}
            className="h-9 items-center justify-center rounded-full bg-slate-100 dark:bg-dark-card px-3"
            {...a11yButton(
              "Mark all read",
              `Mark ${unreadCount} notifications as read`
            )}
          >
            <Text className="text-xs font-JakartaSemiBold text-blue-500">
              Read all
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="h-9 w-9" />
        )}
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center" {...a11y("Loading notifications")}>
          <ActivityIndicator
            size="large"
            color={isDark ? "#F5F5F7" : "#0F172A"}
          />
          <Text className="mt-3 text-sm font-Jakarta text-gray-500 dark:text-dark-text-secondary">
            Loading notifications...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6" {...a11y("Error loading notifications")}>
          <View className="h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
            <Ionicons name="alert-circle-outline" size={28} color="#EF4444" />
          </View>
          <Text className="mt-4 text-lg font-JakartaSemiBold text-gray-900 dark:text-dark-text">
            Something went wrong
          </Text>
          <Text className="mt-2 text-sm font-Jakarta text-gray-500 dark:text-dark-text-secondary text-center">
            {error}
          </Text>
          <TouchableOpacity
            onPress={refetch}
            activeOpacity={0.7}
            className="mt-5 rounded-full bg-blue-500 px-6 py-3"
            {...a11yButton("Retry", "Try loading notifications again")}
          >
            <Text className="text-sm font-JakartaBold text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : flatData.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6" {...a11y("No notifications")}>
          <View className="h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-dark-card">
            <Ionicons
              name="notifications-off-outline"
              size={28}
              color={isDark ? "#636366" : "#94A3B8"}
            />
          </View>
          <Text className="mt-4 text-lg font-JakartaSemiBold text-gray-900 dark:text-dark-text">
            No notifications yet
          </Text>
          <Text className="mt-2 text-sm font-Jakarta text-gray-500 dark:text-dark-text-secondary text-center">
            You'll see ride updates, promotions, and safety alerts here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={flatData}
          renderItem={renderFlatItem}
          keyExtractor={(item, index) =>
            typeof item === "string"
              ? `section-${item}`
              : item.id || `notif-${index}`
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 48 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={isDark ? "#F5F5F7" : "#0F172A"}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen;
