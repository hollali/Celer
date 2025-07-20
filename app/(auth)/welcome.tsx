import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Onboarding = () => {
	return (
		<SafeAreaView className="h-full items-center justify-between bg-white">
            <TouchableOpacity
            onPress={() => {router.replace("/(auth)/sign-up")}}  
            >
                <Text>Skip</Text>
            </TouchableOpacity>
		</SafeAreaView>
	);
};

export default Onboarding;
