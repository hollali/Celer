import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useTheme } from "@/lib/ThemeContext";

const Layout = () => {
	const { isLoaded, isSignedIn } = useAuth();
	const { isDark } = useTheme();

	if (!isLoaded) return null;

	if (!isSignedIn) {
		return <Redirect href="/(auth)/sign-in" />;
	}

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: isDark ? "#0C0C0E" : "#FFFFFF" },
			}}
		>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
		</Stack>
	);
};

export default Layout;
