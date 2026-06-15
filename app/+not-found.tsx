import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
	return (
		<>
			<Stack.Screen options={{ title: "Oops!" }} />
			<View className="flex-1 items-center justify-center p-5 bg-white dark:bg-dark-bg">
				<Text className="text-black dark:text-dark-text">This screen doesn't exist.</Text>
				<Link href="/" className="mt-4 py-3">
					<Text className="text-primary-500 font-JakartaMedium">Go to home screen!</Text>
				</Link>
			</View>
		</>
	);
}
