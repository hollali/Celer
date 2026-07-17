import { PlaceInputProps } from "@/types/type";
import { Image, View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState, useRef, useCallback } from "react";
import { a11y } from "@/lib/accessibility";
import { useTheme } from "@/lib/ThemeContext";
import { colors } from "@/constants";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const PlaceInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: PlaceInputProps) => {
  const { isDark, useLiquidGlass } = useTheme();
  const bgColor = textInputBackgroundColor || (isDark ? colors.dark.card : "white");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchPlaces = useCallback(async (text: string) => {
    if (text.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=5&countrycodes=gh`;
      const response = await fetch(url, {
        headers: {
          Accept: "application/json, application/geo+json",
          "User-Agent": "CelerApp/1.0",
        },
      });
      const textBody = await response.text();
      if (!response.ok || textBody.startsWith("<")) {
        setResults([]);
        return;
      }
      const data = JSON.parse(textBody);
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const onChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (text.length < 2) {
        setResults([]);
        setSearching(false);
        return;
      }
      setSearching(true);
      debounceRef.current = setTimeout(() => searchPlaces(text), 400);
    },
    [searchPlaces],
  );

  return (
    <View
      className={`relative z-50 flex flex-col rounded-xl ${containerStyle}`}
      accessibilityLabel={initialLocation || "Search destination"}
      accessibilityRole="search"
    >
      <View
        style={{
          backgroundColor: bgColor,
          borderRadius: 20,
          paddingHorizontal: 20,
          borderWidth: useLiquidGlass ? 0.5 : 1,
          borderColor: useLiquidGlass
            ? isDark
              ? "rgba(255,255,255,0.12)"
              : "rgba(60,60,67,0.15)"
            : isDark
              ? colors.dark.border
              : "#E2E8F0",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {icon && (
          <View className="mr-2 h-6 w-6 items-center justify-center">
            <Image
              source={icon}
              className="h-6 w-6"
              resizeMode="contain"
              {...a11y("", "", "none")}
            />
          </View>
        )}
        <TextInput
          placeholder={initialLocation ?? "Where do you want to go?"}
          placeholderTextColor={isDark ? colors.dark["text-secondary"] : "#888"}
          value={query}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 300)}
          returnKeyType="search"
          autoCorrect={false}
          style={{
            backgroundColor: "transparent",
            color: isDark ? colors.dark.text : "#000",
            fontSize: 16,
            fontWeight: "600",
            flex: 1,
            paddingVertical: 14,
          }}
          accessibilityLabel={initialLocation || "Search destination"}
        />
      </View>

      {isFocused && (results.length > 0 || searching) && (
        <View
          style={{
            backgroundColor: bgColor,
            borderRadius: 10,
            marginTop: 4,
            maxHeight: 200,
            zIndex: 99,
            overflow: "hidden",
          }}
        >
          {searching && results.length === 0 && (
            <View style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
              <Text style={{ color: "#888", fontSize: 14 }}>Searching...</Text>
            </View>
          )}
          {results.map((item) => (
            <TouchableOpacity
              key={item.place_id.toString()}
              onPress={() => {
                setQuery(item.display_name);
                setResults([]);
                setIsFocused(false);
                handlePress({
                  latitude: parseFloat(item.lat),
                  longitude: parseFloat(item.lon),
                  address: item.display_name,
                });
              }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: 0.5,
                borderBottomColor: isDark ? colors.dark.border : "#E2E8F0",
              }}
            >
              <Text
                style={{
                  color: isDark ? colors.dark.text : "#333",
                  fontSize: 14,
                }}
                numberOfLines={2}
              >
                {item.display_name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default PlaceInput;
