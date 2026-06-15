import CustomButton from "@/components/customButton";
import { onboarding } from "@/constants";
import { router } from "expo-router";
import React, { useRef } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from 'react-native-swiper';
import { a11yButton, a11y, a11yImage } from "@/lib/accessibility";

const Onboarding = () => {
    const swiperRef = useRef<Swiper>(null);
    const [activeIndex, setActiveIndex] = React.useState(0);
    const isLastSlide = activeIndex === onboarding.length - 1;
	return (
		<SafeAreaView className="flex h-full items-center justify-between bg-white dark:bg-dark-bg">
            <TouchableOpacity
            onPress={() => {router.replace("/(auth)/sign-up")}}
            className="w-full flex justify-end items-end p-5"
            {...a11yButton("Skip onboarding", "Go directly to sign up")}
            >
                <Text className="text-black dark:text-dark-text text-md font-JakartaBold">Skip</Text>
            </TouchableOpacity>
            <Swiper ref={swiperRef} showsButtons={false} loop={false}
            accessibilityLabel="Onboarding carousel"
            dot={<View className="w-[32px] h-[4px] mx-1 bg-[#E2E8F0] dark:bg-dark-border rounded-full"/>}
            activeDot={<View className="w-[32px] h-[4px] mx-1 bg-[#0286FF] rounded-full"/>}
            onIndexChanged={(index) => setActiveIndex(index)}
            >
                {onboarding.map((item, idx) => (
                    <View key={item.id} className="flex items-center justify-center p-5" accessibilityLabel={`Slide ${idx + 1}: ${item.title}`}>
                        <Image source={item.image} className="w-full h-[300px]" resizeMode="contain" {...a11yImage(item.title)} />
                        <View className="flex flex-row items-center justify-center w-full mt-10">
                            <Text className="text-black dark:text-dark-text text-3xl font-bold mx-10 text-center">{item.title}</Text>
                        </View>
                        <Text className="text-lg font-JakartaSemiBold text-center text-[#858585] dark:text-dark-text-secondary mx-10 mt-3">{item.description}</Text>
                    </View>
                ))}
            </Swiper>
            <CustomButton
            title={isLastSlide ? "Get Started" : "Next"}
            onPress={() =>
                isLastSlide
                ? router.replace("/(auth)/sign-up")
                : swiperRef.current?.scrollBy(1)}
            className="w-11/12 mt-10 mb-6"/>
        </SafeAreaView>
    );
};

export default Onboarding;
