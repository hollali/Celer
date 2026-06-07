import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Conversation {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  avatarColor: string;
  avatarInitials: string;
  pinned?: boolean;
  type: "driver" | "support" | "safety" | "promo";
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "Marcus T.",
    role: "Your Driver",
    lastMessage: "I'm 2 minutes away, pulling up now 🚗",
    time: "Now",
    unread: 2,
    online: true,
    avatarColor: colors.primary[500],
    avatarInitials: "MT",
    pinned: true,
    type: "driver",
  },
  {
    id: "2",
    name: "Celer Support",
    role: "24/7 Help Desk",
    lastMessage: "Your refund has been processed. Allow 3–5 days.",
    time: "10m",
    unread: 1,
    online: true,
    avatarColor: colors.success[500],
    avatarInitials: "CS",
    type: "support",
  },
  {
    id: "3",
    name: "Safety Team",
    role: "Emergency Line",
    lastMessage: "Your last trip report has been reviewed.",
    time: "1h",
    unread: 0,
    online: true,
    avatarColor: colors.danger[600],
    avatarInitials: "ST",
    type: "safety",
  },
  {
    id: "4",
    name: "Jordan K.",
    role: "Past Driver",
    lastMessage: "Thanks for the 5-star rating! 🙏",
    time: "Yesterday",
    unread: 0,
    online: false,
    avatarColor: colors.primary[700],
    avatarInitials: "JK",
    type: "driver",
  },
  {
    id: "5",
    name: "Celer Rewards",
    role: "Promotions & Offers",
    lastMessage: "You've unlocked a new Gold tier reward 🥇",
    time: "2d",
    unread: 0,
    online: false,
    avatarColor: colors.warning[500],
    avatarInitials: "CR",
    type: "promo",
  },
  {
    id: "6",
    name: "Aisha M.",
    role: "Past Driver",
    lastMessage: "Have a great day! Come ride with me again soon.",
    time: "3d",
    unread: 0,
    online: false,
    avatarColor: colors.primary[800],
    avatarInitials: "AM",
    type: "driver",
  },
];

// ─── Badge color map ──────────────────────────────────────────────────────────

const TYPE_BADGE: Record<
  Conversation["type"],
  { label: string; bg: string; text: string }
> = {
  driver: { label: "Driver", bg: "bg-primary-100", text: "text-primary-700" },
  support: { label: "Support", bg: "bg-success-100", text: "text-success-600" },
  safety: { label: "Safety", bg: "bg-danger-100", text: "text-danger-600" },
  promo: { label: "Offers", bg: "bg-warning-100", text: "text-warning-700" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Avatar = ({
  color,
  initials,
  online,
  size = 48,
}: {
  color: string;
  initials: string;
  online: boolean;
  size?: number;
}) => (
  <View style={{ width: size, height: size }}>
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
      <Text
        className="text-white font-JakartaBold"
        style={{ fontSize: size * 0.33 }}
      >
        {initials}
      </Text>
    </View>
    {online && (
      <View className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-general-400 border-2 border-white" />
    )}
  </View>
);

const PinnedBadge = () => (
  <View className="flex-row items-center gap-0.5 mb-0.5">
    <Ionicons name="pin" size={10} color={colors.secondary[500]} />
    <Text className="text-[10px] font-JakartaMedium text-secondary-500">
      Pinned
    </Text>
  </View>
);

const ConversationCard = ({ item }: { item: Conversation }) => {
  const badge = TYPE_BADGE[item.type];
  const hasUnread = item.unread > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      className="flex-row items-center px-5 py-4"
    >
      {/* Avatar */}
      <Avatar
        color={item.avatarColor}
        initials={item.avatarInitials}
        online={item.online}
      />

      {/* Content */}
      <View className="flex-1 ml-3">
        {item.pinned && <PinnedBadge />}
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-base ${hasUnread ? "font-JakartaBold" : "font-JakartaMedium"} text-secondary-900`}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text
            className={`text-xs ml-2 ${hasUnread ? "font-JakartaBold text-primary-500" : "font-Jakarta text-secondary-500"}`}
          >
            {item.time}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5 mt-0.5">
          <View className={`rounded-full px-1.5 py-0.5 ${badge.bg}`}>
            <Text className={`text-[9px] font-JakartaBold ${badge.text}`}>
              {badge.label}
            </Text>
          </View>
          <Text className="text-xs font-JakartaMedium text-secondary-500 flex-1">
            {item.role}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-1">
          <Text
            className={`text-sm flex-1 mr-2 ${hasUnread ? "font-JakartaMedium text-secondary-800" : "font-Jakarta text-secondary-500"}`}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {hasUnread && (
            <View className="h-5 min-w-5 rounded-full bg-primary-500 items-center justify-center px-1">
              <Text className="text-[10px] font-JakartaBold text-white">
                {item.unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Divider = () => <View className="h-px bg-general-300 mx-5" />;

// ─── Filter Chip ──────────────────────────────────────────────────────────────

const FILTERS = ["All", "Drivers", "Support", "Offers"] as const;
type Filter = (typeof FILTERS)[number];

const FilterChip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className={`mr-2 rounded-full px-4 py-1.5 border ${
      active ? "bg-secondary-900 border-secondary-900" : "bg-white border-secondary-300"
    }`}
  >
    <Text
      className={`text-sm font-JakartaMedium ${active ? "text-white" : "text-secondary-700"}`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <View className="flex-1 items-center justify-center py-24">
    <View className="h-16 w-16 rounded-full bg-general-300 items-center justify-center">
      <Ionicons name="chatbubbles-outline" size={30} color={colors.general[800]} />
    </View>
    <Text className="mt-4 text-base font-JakartaSemiBold text-secondary-800">
      No conversations found
    </Text>
    <Text className="mt-1 text-sm font-Jakarta text-secondary-500 text-center px-8">
      Start a ride to chat with your driver or contact support.
    </Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const Chat = () => {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const totalUnread = CONVERSATIONS.reduce((acc, c) => acc + c.unread, 0);

  const filtered = CONVERSATIONS.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(query.toLowerCase());

    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Drivers" && c.type === "driver") ||
      (activeFilter === "Support" &&
        (c.type === "support" || c.type === "safety")) ||
      (activeFilter === "Offers" && c.type === "promo");

    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* ── Header ── */}
      <View className="px-5 pt-2 pb-4 bg-white border-b border-general-300">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-JakartaBold text-secondary-900">
              Messages
            </Text>
            {totalUnread > 0 && (
              <Text className="text-xs font-JakartaMedium text-secondary-500 mt-0.5">
                {totalUnread} unread message{totalUnread > 1 ? "s" : ""}
              </Text>
            )}
          </View>
          <TouchableOpacity className="h-10 w-10 rounded-full bg-general-300 items-center justify-center">
            <Ionicons name="create-outline" size={19} color={colors.secondary[900]} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View className="mt-4 flex-row items-center bg-general-500 rounded-2xl px-4 py-3 gap-2">
          <Ionicons name="search-outline" size={18} color={colors.general[800]} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search conversations…"
            placeholderTextColor={colors.general[800]}
            className="flex-1 text-sm font-JakartaMedium text-secondary-800"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.general[800]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <View className="flex-row mt-3">
          {FILTERS.map((f) => (
            <FilterChip
              key={f}
              label={f}
              active={activeFilter === f}
              onPress={() => setActiveFilter(f)}
            />
          ))}
        </View>
      </View>

      {/* ── Active ride banner ── */}
      <TouchableOpacity
        activeOpacity={0.85}
        className="mx-5 mt-4 rounded-2xl bg-primary-500 p-4 flex-row items-center"
      >
        <View className="h-10 w-10 rounded-full bg-white/20 items-center justify-center">
          <Ionicons name="car" size={20} color={colors.white} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-white font-JakartaBold text-sm">
            Active Ride · Marcus T.
          </Text>
          <Text className="text-primary-300 text-xs font-JakartaMedium mt-0.5">
            Tap to open your live trip chat
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.whiteMuted}
        />
      </TouchableOpacity>

      {/* ── Conversation list ── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ConversationCard item={item} />}
        ItemSeparatorComponent={Divider}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filtered.length === 0
            ? { flex: 1 }
            : { paddingTop: 8, paddingBottom: 32 }
        }
      />

      {/* ── Support FAB ── */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push("/(root)/help" as any)}
        className="absolute bottom-8 right-5 h-14 w-14 rounded-full bg-secondary-900 items-center justify-center shadow-lg"
        style={{
          shadowColor: colors.secondary[900],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="headset-outline" size={24} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Chat;
