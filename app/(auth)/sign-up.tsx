import CustomButton from "@/components/customButton";
import InputField from "@/components/inputField";
import OAuth from "@/components/oAuth";
import { icons, images } from "@/constants";
import { useSignUp } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import ReactNativeModal from "react-native-modal";
import { a11yLink, a11yImage } from "@/lib/accessibility";

const SignUp = () => {
	const { isLoaded, signUp, setActive } = useSignUp();
	const verificationStrategy = (process.env.EXPO_PUBLIC_CLERK_EMAIL_VERIFICATION_STRATEGY as
		| "email_code"
		| "email_link"
		| undefined) ?? "email_code";
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
	});

	const [verification, setVerification] = useState({
		state: "default",
		error: "",
		code: "",
	});

	const onSignUpPress = async () => {
		if (!isLoaded) return;

		// Start sign-up process using email and password provided
		try {
			await signUp.create({
				emailAddress: form.email,
				password: form.password,
			});

			if (verificationStrategy === "email_link") {
				await signUp.prepareEmailAddressVerification({
					strategy: "email_link",
					redirectUrl: Linking.createURL("/sign-in"),
				});
				Alert.alert(
					"Check your email",
					"We sent you a verification link. Open the link to verify your email, then sign in.",
				);
				router.push("/sign-in");
				return;
			}

			// Send user an email with verification code
			await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
			// Set 'pendingVerification' to true to display second form
			// and capture OTP code
			setVerification({
				...verification,
				state: "pending",
			});
		} catch (err) {
			if (err && typeof err === "object" && "errors" in err && Array.isArray((err as any).errors)) {
				const clerkCode = (err as any).errors[0]?.code;
				if (clerkCode === "strategy_for_user_invalid") {
					Alert.alert(
						"Email verification strategy mismatch",
						"Your Clerk instance does not support this verification strategy. Set Clerk Email Verification Strategy in app config (email_code or email_link) to match your Clerk dashboard.",
					);
					return;
				}
				Alert.alert("Error", ((err as any).errors[0]?.longMessage) || "An error occurred during sign-up");
			} else {
				Alert.alert("Error", "An error occurred during sign-up");
			}
		}
	};

	// Handle submission of verification form
	const onVerifyPress = async () => {
		if (!isLoaded) return;

		try {
			// Use the code the user provided to attempt verification
			const signUpAttempt = await signUp.attemptEmailAddressVerification({
				code: verification.code,
			});

			// If verification was completed, set the session to active
			// and redirect the user
			if (signUpAttempt.status === "complete") {
				await setActive({ session: signUpAttempt.createdSessionId });
				setVerification({...verification, state: "success", code: "" });
			} else {
				setVerification({
					...verification,
					state: "failed",
					error: "Verification failed. Please try again.",})
			}
		} catch (err) {
			setVerification({
					...verification,
					state: "failed",
					error: "Verification failed. Please try again.",})
		}
	};
	return (
		<ScrollView className="flex-1 bg-white dark:bg-dark-bg">
			<View className="flex-1 bg-white dark:bg-dark-bg">
				<View className="relative w-full h-[250px]">
					<Image source={images.signUpCar} className="z-0 w-full h-[250px]" {...a11yImage("Create account illustration")} />
					<Text className="text-2xl text-black dark:text-dark-text font-JakartaSemiBold absolute bottom-5 left-5">
						Create Your Account
					</Text>
				</View>
				<View className="p-5">
					<InputField
						label="Name"
						placeholder="Enter Your Name"
						icon={icons.person}
						value={form.name}
						onChangeText={(value) => setForm({ ...form, name: value })}
					/>
					<InputField
						label="Email"
						placeholder="Enter Your Email"
						icon={icons.email}
						value={form.email}
						onChangeText={(value) => setForm({ ...form, email: value })}
					/>
					<InputField
						label="Password"
						placeholder="Enter Your Password"
						icon={icons.lock}
						secureTextEntry={true}
						value={form.password}
						onChangeText={(value) => setForm({ ...form, password: value })}
					/>
					<CustomButton
						title="Sign Up"
						onPress={onSignUpPress}
						className="mt-6"
					/>
					<OAuth />
					<Link
						href="/sign-in"
						className="text-lg text-center text-general-200 dark:text-dark-text-secondary mt-10"
						{...a11yLink("Sign in", "Navigate to sign in page")}>
						<Text className="dark:text-dark-text-secondary">Already have an account? </Text>
						<Text className="text-primary-500">Log In</Text>
					</Link>
				</View>
				<ReactNativeModal isVisible={verification.state === 'pending'}
				onModalHide={() => {
					if (verification.state === 'success') {
						setShowSuccessModal(true);
					}
				}}>
					<View className="bg-white dark:bg-dark-card px-7 py-9 rounded-2xl min-h-[300px]">
						<Text className="text-2xl font-JakartaExtraBold mb-2 text-black dark:text-dark-text">
							Verification
						</Text>
						<Text className="font-Jakarta mb-5 text-black dark:text-dark-text-secondary">
							We've sent a verification code to {form.email}
						</Text>
						<InputField
							label="Verification Code"
							placeholder="Enter Verification Code"
							icon={icons.lock}
							value={verification.code}
							keyboardType="numeric"
							onChangeText={(code) => setVerification({ ...verification, code })}
						/>
						{verification.error && (
							<Text className="text-red-500 text-sm mt-1">
								{verification.error}
							</Text>
						)}
						<CustomButton
							title="Verify Email"
							onPress={onVerifyPress}
							className="mt-5 bg-success-500"
						/>
					</View>
				</ReactNativeModal>
				<ReactNativeModal isVisible={showSuccessModal}>
					<View className="bg-white dark:bg-dark-card px-7 py-9 rounded-2xl min-h-[300px]">
						<Image source={images.check} className="w-[110px] h-[110px] mx-auto my-5" {...a11yImage("Verified checkmark")} />
						<Text className="text-3xl font-JakartaBold text-center text-black dark:text-dark-text">
							Verified
						</Text>
						<Text className="text-base text-gray-400 dark:text-dark-text-secondary font-Jakarta text-center mt-2">
							Your account has been successfully verified.
						</Text>
						<CustomButton title="continue"
						onPress={() => router.push(`/(root)/(tabs)/home`)}
						className="mt-5"
						/>
					</View>
				</ReactNativeModal>
			</View>
		</ScrollView>
	);
};

export default SignUp;
