import { Stack } from "expo-router";

const Layout = () => {
	return (
		<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#FFFFFF" } }}>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
