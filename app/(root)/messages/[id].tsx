import { useAuth } from "@clerk/clerk-expo";
import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { a11y, a11yButton, a11yHeader } from "@/lib/accessibility";
import { fetchAPI, useFetch } from "@/lib/fetch";
import { useTheme } from "@/lib/ThemeContext";
import { Conversation, Message } from "@/types/type";

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble = ({ item, isOwn }: { item: Message; isOwn: boolean }) => {
  const time = new Date(item.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View
      className={`mb-2 px-5 ${isOwn ? "items-end" : "items-start"}`}
      {...a11y(`${isOwn ? "You" : item.sender_name} said: ${item.text}, ${time}`, "", "text")}
    >
      <View
        className={`max-w-[78%] rounded-2xl px-4 py-3 ${
          isOwn ? "rounded-br-md bg-primary-500" : "rounded-bl-md bg-general-500 dark:bg-dark-card"
        }`}
      >
        <Text
          className={`text-[15px] leading-5 ${
            isOwn
              ? "font-JakartaMedium text-white"
              : "font-JakartaMedium text-secondary-800 dark:text-dark-text"
          }`}
        >
          {item.text}
        </Text>
        <Text
          className={`mt-1 text-[10px] ${
            isOwn
              ? "font-Jakarta text-white/60"
              : "font-Jakarta text-secondary-500 dark:text-dark-text-secondary"
          }`}
        >
          {time}
        </Text>
      </View>
    </View>
  );
};

// ─── Date Separator ───────────────────────────────────────────────────────────

const DateSeparator = ({ label }: { label: string }) => (
  <View className="my-3 flex-row items-center justify-center px-5">
    <View className="h-px flex-1 bg-general-300 dark:bg-dark-border" />
    <Text className="mx-3 font-JakartaSemiBold text-[11px] text-secondary-500 dark:text-dark-text-secondary">
      {label}
    </Text>
    <View className="h-px flex-1 bg-general-300 dark:bg-dark-border" />
  </View>
);

// ─── Loading / Error States ───────────────────────────────────────────────────

const LoadingState = () => (
  <View className="flex-1 items-center justify-center" accessibilityLabel="Loading messages">
    <ActivityIndicator size="large" color={colors.primary[500]} />
    <Text className="mt-3 font-JakartaMedium text-sm text-secondary-500 dark:text-dark-text-secondary">
      Loading conversation...
    </Text>
  </View>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <View
    className="flex-1 items-center justify-center px-10"
    accessibilityLabel={`Error: ${message}`}
  >
    <View className="h-16 w-16 items-center justify-center rounded-full bg-danger-100 dark:bg-danger-900/30">
      <Ionicons name="alert-circle-outline" size={28} color={colors.danger[500]} />
    </View>
    <Text className="mt-4 text-center font-JakartaSemiBold text-[16px] text-secondary-800 dark:text-dark-text">
      Something went wrong
    </Text>
    <Text className="mt-1.5 text-center font-Jakarta text-[13px] leading-5 text-secondary-500 dark:text-dark-text-secondary">
      {message}
    </Text>
    <TouchableOpacity
      onPress={onRetry}
      activeOpacity={0.7}
      className="mt-5 rounded-full bg-primary-500 px-6 py-2.5"
      {...a11yButton("Retry", "Try loading the conversation again")}
    >
      <Text className="font-JakartaSemiBold text-[14px] text-white">Retry</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const MessageThread = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();
  const { getToken, isLoaded } = useAuth();
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const conversationId = Number(id);

  const {
    data: messages,
    loading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useFetch<Message[]>(`/(api)/messages?conversation_id=${conversationId}`, getToken, isLoaded);

  const { data: conversations, loading: convLoading } = useFetch<Conversation[]>(
    "/(api)/chat",
    getToken,
    isLoaded,
  );

  const conversation = conversations?.find((c) => c.id === conversationId);

  // ─── Auto-scroll on new messages ──────────────────────────────────────────
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages?.length]);

  // ─── Send Message ─────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    setInputText("");

    try {
      const token = await getToken();
      await fetchAPI(
        "/(api)/messages",
        {
          method: "POST",
          body: JSON.stringify({
            conversation_id: conversationId,
            text,
          }),
        },
        token,
      );
      await refetchMessages();
    } catch (err) {
      setInputText(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [inputText, sending, conversationId, getToken, refetchMessages]);

  // ─── Build flat list with date separators ─────────────────────────────────
  type FlatItem =
    { kind: "date"; label: string; key: string } | { kind: "message"; data: Message; key: string };

  const flatData = React.useMemo<FlatItem[]>(() => {
    if (!messages) return [];
    const items: FlatItem[] = [];
    let lastDate = "";

    for (const msg of messages) {
      const d = new Date(msg.created_at);
      const dateKey = d.toLocaleDateString();
      if (dateKey !== lastDate) {
        lastDate = dateKey;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let label = dateKey;
        if (d.toDateString() === today.toDateString()) {
          label = "Today";
        } else if (d.toDateString() === yesterday.toDateString()) {
          label = "Yesterday";
        }
        items.push({ kind: "date", label, key: `date-${dateKey}` });
      }
      items.push({ kind: "message", data: msg, key: `msg-${msg.id}` });
    }
    return items;
  }, [messages]);

  const renderItem = useCallback(({ item }: { item: FlatItem }) => {
    if (item.kind === "date") {
      return <DateSeparator label={item.label} />;
    }
    return <MessageBubble item={item.data} isOwn={item.data.sender_type === "user"} />;
  }, []);

  const keyExtractor = useCallback((item: FlatItem) => item.key, []);

  // ─── Header ───────────────────────────────────────────────────────────────
  const renderHeader = () => (
    <View className="flex-row items-center border-b border-general-300 bg-white px-3 py-3 dark:border-dark-border dark:bg-dark-bg">
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.6}
        className="h-10 w-10 items-center justify-center rounded-full"
        {...a11yButton("Go back", "Return to messages list")}
      >
        <Ionicons
          name="chevron-back"
          size={22}
          color={isDark ? colors.dark.text : colors.secondary[800]}
        />
      </TouchableOpacity>

      <View className="ml-1.5 flex-1 flex-row items-center">
        {conversation ? (
          <>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: conversation.avatar_color,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text className="font-JakartaBold text-[13px] text-white">
                {conversation.avatar_initials}
              </Text>
            </View>
            <View className="ml-2.5 flex-1">
              <Text
                className="font-JakartaSemiBold text-[15px] text-secondary-900 dark:text-dark-text"
                numberOfLines={1}
                {...a11y(conversation.name, "", "header")}
              >
                {conversation.name}
              </Text>
              <View className="mt-0.5 flex-row items-center gap-1">
                {conversation.online && (
                  <View className="h-1.5 w-1.5 rounded-full bg-success-500" />
                )}
                <Text className="font-Jakarta text-[11px] text-secondary-500 dark:text-dark-text-secondary">
                  {conversation.online ? "Online" : conversation.role}
                </Text>
              </View>
            </View>
          </>
        ) : convLoading ? (
          <ActivityIndicator size="small" color={colors.primary[500]} />
        ) : null}
      </View>

      <TouchableOpacity
        activeOpacity={0.6}
        className="h-10 w-10 items-center justify-center rounded-full"
        {...a11yButton("More options", "Conversation options menu")}
      >
        <Ionicons
          name="ellipsis-vertical"
          size={18}
          color={isDark ? colors.dark.text : colors.secondary[700]}
        />
      </TouchableOpacity>
    </View>
  );

  // ─── Compose Bar ──────────────────────────────────────────────────────────
  const renderComposeBar = () => (
    <View className="border-t border-general-300 bg-white px-4 py-3 dark:border-dark-border dark:bg-dark-bg">
      <View className="flex-row items-end gap-2">
        <TouchableOpacity
          activeOpacity={0.6}
          className="mb-0.5 h-10 w-10 items-center justify-center rounded-full bg-general-500 dark:bg-dark-card"
          {...a11yButton("Attach file", "Attach a file to your message")}
        >
          <Ionicons name="add-circle-outline" size={22} color={colors.primary[500]} />
        </TouchableOpacity>

        <View className="min-h-[42px] flex-1 flex-row items-end rounded-2xl bg-general-500 px-4 py-2 dark:bg-dark-card">
          <TextInput
            ref={inputRef}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.general[800]}
            className="flex-1 font-JakartaMedium text-[15px] text-secondary-800 dark:text-dark-text"
            multiline
            maxLength={2000}
            accessibilityLabel="Message input"
            returnKeyType="default"
          />
        </View>

        <TouchableOpacity
          onPress={handleSend}
          activeOpacity={0.6}
          disabled={!inputText.trim() || sending}
          className={`mb-0.5 h-10 w-10 items-center justify-center rounded-full ${
            inputText.trim() && !sending ? "bg-primary-500" : "bg-general-300 dark:bg-dark-border"
          }`}
          {...a11yButton(
            "Send message",
            inputText.trim() ? "Send your message" : "Type a message first",
          )}
        >
          {sending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons
              name="arrow-up-circle"
              size={22}
              color={
                inputText.trim()
                  ? "white"
                  : isDark
                    ? colors.dark["text-tertiary"]
                    : colors.general[800]
              }
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  const isLoading = messagesLoading && messages === null;
  const hasError = messagesError && messages === null;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-bg" edges={["bottom"]}>
      {renderHeader()}

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {isLoading ? (
          <LoadingState />
        ) : hasError ? (
          <ErrorState message={messagesError!} onRetry={refetchMessages} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={flatData}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              flatData.length === 0 ? { flex: 1 } : { paddingTop: 12, paddingBottom: 8 }
            }
            ListEmptyComponent={
              <View
                className="flex-1 items-center justify-center py-24"
                accessibilityLabel="No messages yet"
              >
                <View className="h-16 w-16 items-center justify-center rounded-full bg-general-300 dark:bg-dark-card">
                  <Ionicons name="chatbubble-outline" size={28} color={colors.general[800]} />
                </View>
                <Text className="mt-4 font-JakartaSemiBold text-[15px] text-secondary-800 dark:text-dark-text">
                  No messages yet
                </Text>
                <Text className="mt-1.5 px-10 text-center font-Jakarta text-[13px] leading-5 text-secondary-500 dark:text-dark-text-secondary">
                  Send a message to start the conversation.
                </Text>
              </View>
            }
          />
        )}

        {!isLoading && !hasError && renderComposeBar()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MessageThread;
