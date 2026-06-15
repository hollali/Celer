import { useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Alert, Image, Text, View } from "react-native";
import CustomButton from "@/components/customButton";
import { icons } from "@/constants";
import { googleOAuth } from "@/lib/auth";
import { a11y } from "@/lib/accessibility";

const OAuth = () => {
	const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

	const handleGoogleSignIn = async () => {
		const result = await googleOAuth(startOAuthFlow);

		if (result.code === "session_exists") {
			Alert.alert("Success", "You're already signed in. Redirecting to home screen.");
			router.replace("/(root)/(tabs)/home");
			return;
		}

		Alert.alert(result.success ? "Success" : "Error", result.message);

		if (result.success) {
			router.replace("/(root)/(tabs)/home");
		}
	};

	return (
		<View>
			<View
				className="flex flex-row justify-center items-center mt-4 gap-x-3"
				accessibilityLabel="or sign in with"
				accessibilityRole="none"
			>
				<View
					className="flex-1 h-[1px] bg-general-100 dark:bg-dark-border"
					accessibilityRole="none"
				/>
				<Text className="text-lg dark:text-dark-text">Or</Text>
				<View
					className="flex-1 h-[1px] bg-general-100 dark:bg-dark-border"
					accessibilityRole="none"
				/>
			</View>

			<CustomButton
				title="Log In with Google"
				className="mt-5 w-full shadow-none"
				IconLeft={() => (
					<Image
						source={icons.google}
						resizeMode="contain"
						className="w-5 h-5 mx-2"
						{...a11y("Google logo", "", "image")}
					/>
				)}
				bgVariant="outline"
				textVariant="primary"
				onPress={handleGoogleSignIn}
			/>
		</View>
	);
};

export default OAuth;
