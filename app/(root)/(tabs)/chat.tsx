import { useUser, useAuth } from "@clerk/clerk-expo";
import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { a11y, a11yButton, a11yHeader } from "@/lib/accessibility";
import { useFetch } from "@/lib/fetch";
import { useTheme } from "@/lib/ThemeContext";
import { Conversation } from "@/types/type";

// ─── Badge config ─────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap; bg: string; text: string }
> = {
  driver: { label: "Driver", icon: "car-outline", bg: "bg-primary-100", text: "text-primary-700" },
  support: {
    label: "Support",
    icon: "headset-outline",
    bg: "bg-success-100",
    text: "text-success-600",
  },
  safety: {
    label: "Safety",
    icon: "shield-checkmark-outline",
    bg: "bg-danger-100",
    text: "text-danger-600",
  },
  promo: {
    label: "Offers",
    icon: "pricetags-outline",
    bg: "bg-warning-100",
    text: "text-warning-700",
  },
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({
  color,
  initials,
  online,
  size = 52,
}: {
  color: string;
  initials: string;
  online: boolean;
  size?: number;
}) => (
  <View
    style={{ width: size, height: size }}
    {...a11y(`${initials}${online ? ", online" : ""}`, "", "image")}
  >
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text className="font-JakartaBold text-white" style={{ fontSize: size * 0.35 }}>
        {initials}
      </Text>
    </View>
    {online && (
      <View
        className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-dark-bg"
        style={{ backgroundColor: colors.general[400] }}
      />
    )}
  </View>
);

// ─── Conversation Card ────────────────────────────────────────────────────────

const ConversationCard = ({ item }: { item: Conversation }) => {
  const badge = TYPE_BADGE[item.type] || TYPE_BADGE.driver;
  const hasUnread = item.user_unread > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.65}
      className="flex-row items-center px-5 py-4 active:bg-black/5 dark:active:bg-white/5"
      onPress={() => router.push(`/(root)/messages/${item.id}`)}
      {...a11yButton(
        `${item.name}, ${item.role}${hasUnread ? `, ${item.user_unread} unread messages` : ""}`,
        "Open conversation",
      )}
    >
      <Avatar color={item.avatar_color} initials={item.avatar_initials} online={item.online} />

      <View className="ml-3 flex-1">
        <View className="flex-row items-center justify-between">
          <View className="flex-shrink flex-row items-center gap-1.5">
            <Text
              className={`text-[15px] ${hasUnread ? "font-JakartaBold" : "font-JakartaSemiBold"} text-secondary-900 dark:text-dark-text`}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </View>
          <Text
            className={`ml-2 text-[11px] ${hasUnread ? "font-JakartaBold text-primary-500" : "font-Jakarta text-secondary-500 dark:text-dark-text-secondary"}`}
          >
            {formatTimeAgo(item.last_message_at)}
          </Text>
        </View>

        <View className="mt-0.5 flex-row items-center gap-1.5">
          <View
            className={`rounded-full px-2 py-0.5 ${badge.bg} flex-row items-center gap-1 dark:opacity-80`}
          >
            <Ionicons
              name={badge.icon}
              size={8}
              color={
                badge.text.includes("primary")
                  ? "#475A99"
                  : badge.text.includes("success")
                    ? "#2F855A"
                    : badge.text.includes("danger")
                      ? "#C53030"
                      : "#A16207"
              }
            />
            <Text className={`font-JakartaBold text-[9px] ${badge.text} dark:text-dark-text`}>
              {badge.label}
            </Text>
          </View>
          <Text className="flex-1 font-JakartaMedium text-[11px] text-secondary-500 dark:text-dark-text-secondary">
            {item.role}
          </Text>
        </View>

        <View className="mt-1 flex-row items-center justify-between">
          <Text
            className={`mr-3 flex-1 text-[13px] leading-4 ${hasUnread ? "font-JakartaMedium text-secondary-800 dark:text-dark-text" : "font-Jakarta text-secondary-500 dark:text-dark-text-secondary"}`}
            numberOfLines={1}
          >
            {item.last_message}
          </Text>
          {hasUnread && (
            <View className="h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5">
              <Text
                className="font-JakartaBold text-[10px] text-white"
                accessibilityLabel={`${item.user_unread} unread`}
              >
                {item.user_unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  return `${diffDay}d`;
}

function getTimeGroup(dateStr: string): "today" | "yesterday" | "older" {
  if (!dateStr) return "older";
  const now = new Date();
  const date = new Date(dateStr);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const dateTs = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  if (dateTs === today) return "today";
  if (dateTs === yesterday) return "yesterday";
  return "older";
}

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ title }: { title: string }) => (
  <View className="px-5 pb-1.5 pt-5">
    <Text className="font-JakartaBold text-[12px] uppercase tracking-[1.5px] text-secondary-500 dark:text-dark-text-secondary">
      {title}
    </Text>
  </View>
);

// ─── Filter Chip ──────────────────────────────────────────────────────────────

const FILTERS: { key: Filter; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "All", label: "All", icon: "chatbubbles-outline" },
  { key: "Drivers", label: "Drivers", icon: "car-outline" },
  { key: "Support", label: "Support", icon: "headset-outline" },
  { key: "Offers", label: "Offers", icon: "pricetags-outline" },
];

type Filter = "All" | "Drivers" | "Support" | "Offers";

const FilterChip = ({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className={`mr-2.5 flex-row items-center gap-1.5 rounded-full px-4 py-2 ${
      active
        ? "bg-secondary-900 dark:bg-primary-500"
        : "border border-secondary-300/40 bg-white/60 dark:border-white/15 dark:bg-white/10"
    }`}
    {...a11yButton(label, `Filter by ${label}`, false, active)}
  >
    <Ionicons name={icon} size={14} color={active ? "#FFFFFF" : "#8E8E93"} />
    <Text
      className={`font-JakartaSemiBold text-[13px] ${active ? "text-white" : "text-secondary-500 dark:text-dark-text-secondary"}`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── Active Ride Banner ───────────────────────────────────────────────────────

const ActiveRideBanner = () => {
  const { isDark, useLiquidGlass } = useTheme();

  const bannerContent = (onPress: () => void) => (
    <View className="flex-row items-center">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-500">
        <Ionicons name="car-sport-outline" size={22} color="white" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-JakartaBold text-sm text-primary-500 dark:text-primary-400">
          Active Ride
        </Text>
        <Text className="mt-0.5 font-Jakarta text-[11px] text-secondary-500 dark:text-dark-text-secondary">
          Tap to view live trip
        </Text>
      </View>
      <View className="h-8 w-8 items-center justify-center rounded-full bg-primary-500/10 dark:bg-primary-500/20">
        <Ionicons name="chevron-forward" size={16} color={colors.primary[500]} />
      </View>
    </View>
  );

  if (useLiquidGlass) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={{ marginHorizontal: 16, marginTop: 16, borderRadius: 20, overflow: "hidden" }}
        {...a11yButton("Active ride", "Open live trip chat")}
      >
        <BlurView
          intensity={80}
          tint={isDark ? "systemMaterialDark" : "systemThinMaterialLight"}
          style={{ flexDirection: "row", alignItems: "center", padding: 16 }}
        >
          {bannerContent(() => {})}
        </BlurView>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className="mx-5 mt-4 flex-row items-center rounded-2xl bg-primary-500 p-4"
      {...a11yButton("Active ride", "Open live trip chat")}
    >
      {bannerContent(() => {})}
    </TouchableOpacity>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <View
    className="flex-1 items-center justify-center py-24"
    accessibilityLabel="No conversations found"
  >
    <View className="h-20 w-20 items-center justify-center rounded-full bg-general-300 dark:bg-dark-card">
      <Ionicons name="chatbubbles-outline" size={36} color={colors.general[800]} />
    </View>
    <Text className="mt-5 font-JakartaSemiBold text-[17px] text-secondary-800 dark:text-dark-text">
      No conversations found
    </Text>
    <Text className="mt-1.5 px-10 text-center font-Jakarta text-[13px] leading-5 text-secondary-500 dark:text-dark-text-secondary">
      Start a ride to chat with your driver or contact support.
    </Text>
  </View>
);

// ─── Header Content ───────────────────────────────────────────────────────────

const HeaderContent = ({
  totalUnread,
  isDark,
  query,
  setQuery,
  activeFilter,
  setActiveFilter,
}: {
  totalUnread: number;
  isDark: boolean;
  query: string;
  setQuery: (q: string) => void;
  activeFilter: Filter;
  setActiveFilter: (f: Filter) => void;
}) => (
  <>
    <View className="mb-4 flex-row items-center justify-between">
      <View>
        <Text
          className="font-JakartaExtraBold text-[28px] text-secondary-900 dark:text-dark-text"
          {...a11yHeader("Messages")}
        >
          Messages
        </Text>
        {totalUnread > 0 && (
          <View className="mt-0.5 flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-primary-500" />
            <Text className="font-JakartaMedium text-[12px] text-secondary-500 dark:text-dark-text-secondary">
              {totalUnread} unread
            </Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={() => Alert.alert("Coming Soon", "New message feature coming soon!")}
        className="h-11 w-11 items-center justify-center rounded-full bg-primary-500"
        {...a11yButton("New message", "Compose a new message")}
      >
        <Ionicons name="create-outline" size={20} color="white" />
      </TouchableOpacity>
    </View>

    <View className="h-11 flex-row items-center gap-2 rounded-2xl bg-general-500 px-4 dark:bg-dark-card">
      <Ionicons name="search-outline" size={17} color={colors.general[800]} />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search messages"
        placeholderTextColor={colors.general[800]}
        className="h-11 flex-1 font-JakartaMedium text-[14px] text-secondary-800 dark:text-dark-text"
        accessibilityLabel="Search conversations"
        returnKeyType="search"
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={() => setQuery("")} {...a11yButton("Clear search")}>
          <View className="h-5 w-5 items-center justify-center rounded-full bg-general-800/30">
            <Ionicons name="close" size={12} color={colors.general[800]} />
          </View>
        </TouchableOpacity>
      )}
    </View>

    <View
      className="mt-3.5 flex-row"
      accessibilityLabel="Filter conversations"
      accessibilityRole="none"
    >
      {FILTERS.map((f) => (
        <FilterChip
          key={f.key}
          label={f.label}
          icon={f.icon}
          active={activeFilter === f.key}
          onPress={() => setActiveFilter(f.key)}
        />
      ))}
    </View>
  </>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface Section {
  title: string;
  data: Conversation[];
}

function groupConversations(convs: Conversation[]): Section[] {
  const groups: Record<string, Conversation[]> = { today: [], yesterday: [], older: [] };
  for (const c of convs) {
    const group = getTimeGroup(c.last_message_at);
    groups[group]?.push(c);
  }
  const result: Section[] = [];
  if (groups.today.length) result.push({ title: "Today", data: groups.today });
  if (groups.yesterday.length) result.push({ title: "Yesterday", data: groups.yesterday });
  if (groups.older.length) result.push({ title: "Earlier", data: groups.older });
  return result;
}

type ListItem =
  | { type: "section"; title: string; data: Conversation[] }
  | { type: "conversation"; data: Conversation };

// ─── Main Screen ──────────────────────────────────────────────────────────────

const Chat = () => {
  const { user } = useUser();
  const { isDark, useLiquidGlass } = useTheme();
  const { getToken, isLoaded } = useAuth();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const listRef = useRef<FlatList>(null);

  const email = user?.primaryEmailAddress?.emailAddress;

  const {
    data: conversations,
    loading,
    refetch,
    error,
  } = useFetch<Conversation[]>("/(api)/chat", getToken, isLoaded);

  const convs = conversations ?? [];

  const totalUnread = useMemo(
    () => convs.reduce((acc, c) => acc + (c.user_unread || 0), 0),
    [convs],
  );

  const filtered = useMemo(() => {
    return convs.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.last_message || "").toLowerCase().includes(query.toLowerCase());
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Drivers" && c.type === "driver") ||
        (activeFilter === "Support" && (c.type === "support" || c.type === "safety")) ||
        (activeFilter === "Offers" && c.type === "promo");
      return matchesSearch && matchesFilter;
    });
  }, [convs, query, activeFilter]);

  const sections = useMemo(() => groupConversations(filtered), [filtered]);

  const flatData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];
    for (const section of sections) {
      items.push({ type: "section", title: section.title, data: section.data });
      for (const conv of section.data) {
        items.push({ type: "conversation", data: conv });
      }
    }
    return items;
  }, [sections]);

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === "section") {
      return <SectionHeader title={item.title} />;
    }
    return <ConversationCard item={item.data} />;
  }, []);

  const keyExtractor = useCallback((item: ListItem, idx: number) => {
    if (item.type === "section") return `section-${item.title}`;
    return `${item.data.id}`;
  }, []);

  const totalUnreadHeader = useMemo(() => {
    if (!totalUnread && !loading) return null;
    return totalUnread;
  }, [totalUnread, loading]);

  const renderHeader = () => {
    if (useLiquidGlass) {
      return (
        <BlurView
          intensity={80}
          tint={isDark ? "systemMaterialDark" : "systemChromeMaterialLight"}
          style={{
            paddingHorizontal: 20,
            paddingTop: Platform.OS === "ios" ? 8 : 12,
            paddingBottom: 16,
            borderBottomWidth: Platform.OS === "ios" ? 0.5 : 1,
            borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(60,60,67,0.12)",
          }}
        >
          <HeaderContent
            totalUnread={totalUnreadHeader ?? 0}
            isDark={isDark}
            query={query}
            setQuery={setQuery}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        </BlurView>
      );
    }
    return (
      <View className="border-b border-general-300 bg-white px-5 pb-4 pt-3 dark:border-dark-border dark:bg-dark-bg">
        <HeaderContent
          totalUnread={totalUnreadHeader ?? 0}
          isDark={isDark}
          query={query}
          setQuery={setQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-bg">
      {renderHeader()}

      {loading && conversations === null ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text className="mt-3 font-JakartaMedium text-sm text-secondary-500 dark:text-dark-text-secondary">
            Loading messages...
          </Text>
        </View>
      ) : error && !conversations ? (
        <View className="flex-1 items-center justify-center px-5">
          <Ionicons name="cloud-offline-outline" size={48} color="#9CA3AF" />
          <Text className="mt-3 text-center font-JakartaBold text-base text-secondary-900 dark:text-dark-text">
            Unable to load conversations
          </Text>
          <Text className="mt-1 text-center font-JakartaMedium text-sm text-general-200 dark:text-dark-text-secondary">
            {error}
          </Text>
          <TouchableOpacity
            onPress={refetch}
            className="mt-4 rounded-full bg-primary-500 px-6 py-3"
          >
            <Text className="font-JakartaBold text-sm text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={flatData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={<ActiveRideBanner />}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refetch}
              tintColor={colors.primary[500]}
              colors={[colors.primary[500]]}
            />
          }
          contentContainerStyle={flatData.length === 0 ? { flex: 1 } : { paddingBottom: 100 }}
          ItemSeparatorComponent={() => null}
        />
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push("/help")}
        className="absolute bottom-8 right-5 h-14 w-14 items-center justify-center rounded-full bg-secondary-900 shadow-lg dark:bg-primary-500"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        }}
        {...a11yButton("Help and support", "Get assistance")}
      >
        <Ionicons name="headset-outline" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Chat;
