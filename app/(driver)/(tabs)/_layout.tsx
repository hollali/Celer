import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/ThemeContext";
import { BlurView } from "expo-blur";
import { View } from "react-native";

const TabIcon = ({ name, focused }: { name: keyof typeof Ionicons.glyphMap; focused: boolean }) => (
	<View
		className={`rounded-full w-12 h-12 items-center justify-center ${
			focused ? "bg-general-400" : ""
		}`}
	>
		<Ionicons name={name} size={24} color={focused ? "#ffffff" : "#9ca3af"} />
	</View>
);

export default function DriverTabLayout() {
	const { isDark, useLiquidGlass } = useTheme();

	const tabBarStyle: Record<string, unknown> = {
		backgroundColor: useLiquidGlass ? "transparent" : isDark ? "#1C1C1E" : "#333333",
		borderRadius: 50,
		paddingBottom: 0,
		overflow: "hidden",
		marginHorizontal: 20,
		marginBottom: 20,
		height: 78,
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		flexDirection: "row",
		position: "absolute",
	};

	return (
		<Tabs
			initialRouteName="index"
			screenOptions={{
				tabBarActiveTintColor: "white",
				tabBarInactiveTintColor: "white",
				tabBarShowLabel: true,
				tabBarStyle,
				tabBarBackground: useLiquidGlass
					? () => (
							<BlurView
								intensity={80}
								tint={isDark ? "systemMaterialDark" : "systemUltraThinMaterialLight"}
								style={{
									flex: 1,
									borderRadius: 50,
									overflow: "hidden",
								}}
							/>
						)
					: undefined,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Rides",
					headerShown: false,
					tabBarIcon: ({ focused }) => <TabIcon name="car-sport" focused={focused} />,
					tabBarAccessibilityLabel: "Rides tab — view incoming ride requests",
				}}
			/>
			<Tabs.Screen
				name="active"
				options={{
					title: "Active",
					headerShown: false,
					tabBarIcon: ({ focused }) => <TabIcon name="navigate" focused={focused} />,
					tabBarAccessibilityLabel: "Active tab — manage your current ride",
				}}
			/>
			<Tabs.Screen
				name="earnings"
				options={{
					title: "Earnings",
					headerShown: false,
					tabBarIcon: ({ focused }) => <TabIcon name="wallet" focused={focused} />,
					tabBarAccessibilityLabel: "Earnings tab — view your earnings and payouts",
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					headerShown: false,
					tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} />,
					tabBarAccessibilityLabel: "Profile tab — your driver profile and settings",
				}}
			/>
		</Tabs>
	);
}
