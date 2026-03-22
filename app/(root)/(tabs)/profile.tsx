import CustomButton from "@/components/customButton";
import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
	const { user } = useUser();
	const { signOut } = useAuth();

	const fullName = user?.fullName || "Celer Rider";
	const email = user?.primaryEmailAddress?.emailAddress || "No email available";
	const avatar = user?.imageUrl;
	const firstLetter = fullName.charAt(0).toUpperCase();
	const joinedDate = user?.createdAt
		? new Date(user.createdAt).toLocaleDateString("en-US", {
			month: "long",
			year: "numeric",
		})
		: "Unknown";

	return (
		<SafeAreaView className="flex-1 bg-general-100 px-6 pt-8">
			<SignedIn>
				<View className="flex-1">
					<Text className="text-3xl font-JakartaBold text-black">Profile</Text>
					<Text className="mt-2 text-base font-Jakarta text-gray-500">
						Manage your account details.
					</Text>

					<View className="mt-8 items-center rounded-3xl bg-white px-6 py-8">
						{avatar ? (
							<Image
								source={{ uri: avatar }}
								className="h-24 w-24 rounded-full"
							/>
						) : (
							<View className="h-24 w-24 items-center justify-center rounded-full bg-blue-500">
								<Text className="text-3xl font-JakartaExtraBold text-white">
									{firstLetter}
								</Text>
							</View>
						)}

						<Text className="mt-4 text-2xl font-JakartaBold text-black">
							{fullName}
						</Text>
						<Text className="mt-1 text-base font-Jakarta text-gray-500">{email}</Text>
					</View>

					<View className="mt-6 rounded-3xl bg-white p-5">
						<Text className="text-sm font-JakartaMedium uppercase text-gray-400">
							Account
						</Text>
						<View className="mt-4 flex-row items-center justify-between border-b border-gray-100 pb-4">
							<Text className="text-base font-Jakarta text-gray-500">Member since</Text>
							<Text className="text-base font-JakartaMedium text-black">{joinedDate}</Text>
						</View>
						<View className="mt-4 flex-row items-center justify-between">
							<Text className="text-base font-Jakarta text-gray-500">User ID</Text>
							<Text className="max-w-[60%] text-right text-sm font-JakartaMedium text-black" numberOfLines={1}>
								{user?.id}
							</Text>
						</View>
					</View>

					<CustomButton
						title="Sign Out"
						onPress={() => signOut()}
						bgVariant="danger"
						className="mt-8"
					/>
				</View>
			</SignedIn>

			<SignedOut>
				<View className="flex-1 items-center justify-center">
					<Text className="text-xl font-JakartaSemiBold text-black">You are not signed in</Text>
					<Text className="mt-2 text-base font-Jakarta text-gray-500">
						Sign in to view and manage your profile.
					</Text>
					<Link href="/(auth)/sign-in" className="mt-6 rounded-full bg-blue-500 px-8 py-3">
						<Text className="text-lg font-JakartaBold text-white">Sign in</Text>
					</Link>
				</View>
			</SignedOut>
		</SafeAreaView>
	);
};

export default Profile;
