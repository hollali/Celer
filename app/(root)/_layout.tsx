import { Stack } from "expo-router";
import { Platform } from "react-native";
import { useTheme } from "@/lib/ThemeContext";

const Layout = () => {
	const { isDark, useLiquidGlass } = useTheme();

	const getBackground = () => {
		if (useLiquidGlass) return "transparent";
		return isDark ? "#0C0C0E" : "#FFFFFF";
	};

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: getBackground() },
			}}
		>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen name="appearance" />
			<Stack.Screen name="edit-profile" />
			<Stack.Screen name="ride-history" />
			<Stack.Screen name="payment" />
			<Stack.Screen name="promotions" />
			<Stack.Screen name="safety" />
			<Stack.Screen name="help" />
			<Stack.Screen name="legal" />
		</Stack>
	);
};

export default Layout;
