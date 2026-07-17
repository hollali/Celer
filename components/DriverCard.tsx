import { BlurView } from "expo-blur";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { icons, CURRENCY_SYMBOL } from "@/constants";
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
        className="h-14 w-14 rounded-full"
        {...a11y(`${item.title} profile photo`, "", "image")}
      />

      <View className="mx-3 flex flex-1 flex-col items-start justify-center">
        <View className="mb-1 flex flex-row items-center justify-start">
          <Text className="font-JakartaRegular text-lg text-black dark:text-dark-text">
            {item.title}
          </Text>

          <View className="ml-2 flex flex-row items-center space-x-1">
            <Image source={icons.star} className="h-3.5 w-3.5" {...a11y("Rating", "", "image")} />
            <Text className="font-JakartaRegular text-sm text-black dark:text-dark-text">
              {item.rating}
            </Text>
          </View>
        </View>

        <View className="flex flex-row items-center justify-start">
          <View className="flex flex-row items-center">
            <Image source={icons.dollar} className="h-4 w-4" {...a11y("Price", "", "image")} />
            <Text className="ml-1 font-JakartaRegular text-sm text-black dark:text-dark-text">
              ₵{item.price}
            </Text>
          </View>

          <Text className="mx-1 font-JakartaRegular text-sm text-general-800 dark:text-dark-text-secondary">
            |
          </Text>

          <Text className="font-JakartaRegular text-sm text-general-800 dark:text-dark-text-secondary">
            {formatTime(item.time!)}
          </Text>

          <Text className="mx-1 font-JakartaRegular text-sm text-general-800 dark:text-dark-text-secondary">
            |
          </Text>

          <Text className="font-JakartaRegular text-sm text-general-800 dark:text-dark-text-secondary">
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
          `Select driver ${item.title}, rating ${item.rating}, price ₵${item.price}`,
          "Double tap to select this driver",
          false,
          isSelected,
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
      } flex flex-row items-center justify-between rounded-xl border border-transparent px-3 py-5 dark:border-dark-border`}
      {...a11yButton(
        `Select driver ${item.title}, rating ${item.rating}, price ₵${item.price}`,
        "Double tap to select this driver",
        false,
        isSelected,
      )}
    >
      {cardContent}
    </TouchableOpacity>
  );
};

export default DriverCard;
