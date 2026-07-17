import CustomButton from "@/components/customButton";
import { onboarding } from "@/constants";
import { router } from "expo-router";
import React, { useRef } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import { a11yButton, a11y, a11yImage } from "@/lib/accessibility";

const Onboarding = () => {
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const isLastSlide = activeIndex === onboarding.length - 1;
  return (
    <SafeAreaView className="flex h-full items-center justify-between bg-white dark:bg-dark-bg">
      <TouchableOpacity
        onPress={() => {
          router.replace("/(auth)/sign-up");
        }}
        className="flex w-full items-end justify-end p-5"
        {...a11yButton("Skip onboarding", "Go directly to sign up")}
      >
        <Text className="text-md font-JakartaBold text-black dark:text-dark-text">Skip</Text>
      </TouchableOpacity>
      <Swiper
        ref={swiperRef}
        showsButtons={false}
        loop={false}
        accessibilityLabel="Onboarding carousel"
        dot={
          <View className="mx-1 h-[4px] w-[32px] rounded-full bg-[#E2E8F0] dark:bg-dark-border" />
        }
        activeDot={<View className="mx-1 h-[4px] w-[32px] rounded-full bg-primary-500" />}
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {onboarding.map((item, idx) => (
          <View
            key={item.id}
            className="flex items-center justify-center p-5"
            accessibilityLabel={`Slide ${idx + 1}: ${item.title}`}
          >
            <Image
              source={item.image}
              className="h-[300px] w-full"
              resizeMode="contain"
              {...a11yImage(item.title)}
            />
            <View className="mt-10 flex w-full flex-row items-center justify-center">
              <Text className="mx-10 text-center text-3xl font-bold text-black dark:text-dark-text">
                {item.title}
              </Text>
            </View>
            <Text className="mx-10 mt-3 text-center font-JakartaSemiBold text-lg text-[#858585] dark:text-dark-text-secondary">
              {item.description}
            </Text>
          </View>
        ))}
      </Swiper>
      <CustomButton
        title={isLastSlide ? "Get Started" : "Next"}
        onPress={() =>
          isLastSlide ? router.replace("/(auth)/sign-up") : swiperRef.current?.scrollBy(1)
        }
        className="mb-6 mt-10 w-11/12"
      />
    </SafeAreaView>
  );
};

export default Onboarding;
