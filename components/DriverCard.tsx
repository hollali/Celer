import { BlurView } from "expo-blur";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants";
import { formatTime } from "@/lib/utils";
import { useTheme } from "@/lib/ThemeContext";
import { DriverCardProps } from "@/types/type";
import { a11yButton, a11y } from "@/lib/accessibility";

const DriverCard = ({ item, selected, setSelected }: DriverCardProps) => {
  const { isDark, useLiquidGlass } = useTheme();
  const isSelected = selected === item.id;

  const cardContent = (
    <>
      <Image
        source={{ uri: item.profile_image_url }}
        className="w-14 h-14 rounded-full"
        {...a11y(`${item.title} profile photo`, "", "image")}
      />

      <View className="flex-1 flex flex-col items-start justify-center mx-3">
        <View className="flex flex-row items-center justify-start mb-1">
          <Text className="text-lg font-JakartaRegular text-black dark:text-dark-text">
            {item.title}
          </Text>

          <View className="flex flex-row items-center space-x-1 ml-2">
            <Image source={icons.star} className="w-3.5 h-3.5" {...a11y("Rating", "", "image")} />
            <Text className="text-sm font-JakartaRegular text-black dark:text-dark-text">
              {item.rating}
            </Text>
          </View>
        </View>

        <View className="flex flex-row items-center justify-start">
          <View className="flex flex-row items-center">
            <Image source={icons.dollar} className="w-4 h-4" {...a11y("Price", "", "image")} />
            <Text className="text-sm font-JakartaRegular ml-1 text-black dark:text-dark-text">
              ${item.price}
            </Text>
          </View>

          <Text className="text-sm font-JakartaRegular text-general-800 dark:text-dark-text-secondary mx-1">
            |
          </Text>

          <Text className="text-sm font-JakartaRegular text-general-800 dark:text-dark-text-secondary">
            {formatTime(item.time!)}
          </Text>

          <Text className="text-sm font-JakartaRegular text-general-800 dark:text-dark-text-secondary mx-1">
            |
          </Text>

          <Text className="text-sm font-JakartaRegular text-general-800 dark:text-dark-text-secondary">
            {item.car_seats} seats
          </Text>
        </View>
      </View>

      <Image
        source={{ uri: item.car_image_url }}
        className="h-14 w-14"
        resizeMode="contain"
        {...a11y(`${item.title}'s car`, "", "image")}
      />
    </>
  );

  if (useLiquidGlass) {
    return (
      <TouchableOpacity
        onPress={setSelected}
        activeOpacity={0.75}
        style={{ borderRadius: 12, overflow: "hidden" }}
        {...a11yButton(
          `Select driver ${item.title}, rating ${item.rating}, price $${item.price}`,
          "Double tap to select this driver",
          false,
          isSelected
        )}
      >
        <BlurView
          intensity={isSelected ? 90 : 65}
          tint={isDark ? "systemMaterialDark" : "systemThinMaterialLight"}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 20,
            paddingHorizontal: 12,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {cardContent}
        </BlurView>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={setSelected}
      className={`${
        isSelected ? "bg-general-600 dark:bg-primary-800" : "bg-white dark:bg-dark-card"
      } flex flex-row items-center justify-between py-5 px-3 rounded-xl border border-transparent dark:border-dark-border`}
      {...a11yButton(
        `Select driver ${item.title}, rating ${item.rating}, price $${item.price}`,
        "Double tap to select this driver",
        false,
        isSelected
      )}
    >
      {cardContent}
    </TouchableOpacity>
  );
};

export default DriverCard;
