import CustomButton from "@/components/customButton";
import InputField from "@/components/inputField";
import OAuth from "@/components/oAuth";
import { icons, images } from "@/constants";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";

const SignUp = () => {
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
	});

	const onSignUpPress = async () => {
		// Handle sign-up logic here
	};
	return (
		<ScrollView className="flex-1 bg-white">
			<View className="flex-1 bg-white">
				<View className="relative w-full h-[250px]">
					<Image
					source={images.signUpCar}
					className="z-0 w-full h-[250px]"
					/>
					<Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
						Create Your Account
					</Text>
				</View>
				<View className="p-5">
					<InputField label="Name"
					placeholder="Enter Your Name"
					icon={icons.person}
					value={form.name}
					onChangeText={(value) => setForm({ ...form, name: value })}
					/>
					<InputField label="Email"
					placeholder="Enter Your Email"
					icon={icons.email}
					value={form.email}
					onChangeText={(value) => setForm({ ...form, email: value })}
					/>
					<InputField label="Password"
					placeholder="Enter Your Password"
					icon={icons.lock}
					secureTextEntry={true}
					value={form.password}
					onChangeText={(value) => setForm({ ...form, password: value })}
					/>
					<CustomButton title="Sign Up" onPress={onSignUpPress} className="mt-6"/>
					<OAuth/>
					<Link href="/sign-in"
					className="text-lg text-center text-general-200 mt-10"
					>
					<Text>Already have an account? </Text>
					<Text className="text-primary-500">Log In</Text>
					</Link>
				</View>
			</View>
		</ScrollView>
	);
};

export default SignUp;
