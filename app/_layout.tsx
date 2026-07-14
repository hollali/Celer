import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import "react-native-reanimated";
import "./global.css";
import { ThemeProvider } from "@/lib/ThemeContext";
import { TokenSync } from "@/components/TokenSync";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Prevent the splash screen from auto-hiding before asset loading is complete.
void SplashScreen.preventAutoHideAsync().catch((error) => {
	console.warn("Failed to prevent splash screen auto-hide:", error);
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
if (!publishableKey) {
	throw new Error(
		"Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file."
	);
}

export default function RootLayout() {
	const [loaded] = useFonts({
		"Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
		"Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
		"Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
		"Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
		"Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
		"Jakarta-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
		"Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
	});

	useEffect(() => {
		if (loaded) {
			void SplashScreen.hideAsync().catch((error) => {
				console.warn("Failed to hide splash screen:", error);
			});
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
            <TokenSync />
            <ThemeProvider>
					<ErrorBoundary>
						<StatusBar barStyle="dark-content" />
						<Stack>
							<Stack.Screen name="index" options={{ headerShown: false }} />
							<Stack.Screen name="(root)" options={{ headerShown: false }} />
							<Stack.Screen name="(auth)" options={{ headerShown: false }} />
							<Stack.Screen name="+not-found" />
						</Stack>
					</ErrorBoundary>
				</ThemeProvider>
			</ClerkLoaded>
		</ClerkProvider>
	);
}
