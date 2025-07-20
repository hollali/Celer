import { router } from "expo-router";
import React, { useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from 'react-native-swiper';

const Onboarding = () => {
    const swiperRef = useRef<Swiper>(null);
    const [activeIndex, setActiveIndex] = React.useState(0);
	return (
		<SafeAreaView className="h-full items-center justify-between bg-white">
            <TouchableOpacity
            onPress={() => {router.replace("/(auth)/sign-up")}}
            className="w-full flex justify-end items-end p-5"  
            >
                <Text className="text-black text-md font-JakartaBold">Skip</Text>
            </TouchableOpacity>
            <Swiper ref={swiperRef} showsButtons={false} loop={false} 
            dot={<View className="w-[32px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full"/>}
            activeDot={<View className="w-[32px] h-[4px] mx-1 bg-[#0286FF] rounded-full"/>} 
            paginationStyle={{ bottom: 50 }}
            onIndexChanged={(index) => setActiveIndex(index)}
            >
                <View className="flex-1 items-center justify-center">
                    <Text className="text-black text-lg font-JakartaBold">Welcome to the App!</Text>
                </View>
                {/* Add more slides as needed */}
            </Swiper>
        </SafeAreaView>
    );
};

export default Onboarding;
