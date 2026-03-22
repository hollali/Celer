import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React from "react";
import {
	Alert,
	Image,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Reusable Components ─────────────────────────────────────────────────────

const RowDivider = () => <View className="h-px bg-gray-100 mx-4" />;

interface MenuRowProps {
	icon: React.ComponentProps<typeof Ionicons>["name"];
	label: string;
	badge?: string;
	onPress: () => void;
	danger?: boolean;
}

const MenuRow = ({ icon, label, badge, onPress, danger = false }: MenuRowProps) => (
	<TouchableOpacity
		onPress={onPress}
		activeOpacity={0.7}
		className="flex-row items-center px-5 py-4"
	>
		{/* Icon circle */}
		<View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-slate-100">
			<Ionicons name={icon} size={18} color={danger ? "#EF4444" : "#0F172A"} />
		</View>

		{/* Label */}
		<Text
			className={`flex-1 text-base font-JakartaMedium ${
				danger ? "text-red-500" : "text-gray-900"
			}`}
		>
			{label}
		</Text>

		{/* Optional badge */}
		{badge && (
			<View className="bg-green-500 rounded-full px-2 py-0.5 mr-2">
				<Text className="text-[10px] font-JakartaBold text-white">
					{badge}
				</Text>
			</View>
		)}

		{/* Chevron */}
		<Ionicons name="chevron-forward" size={18} color="#94A3B8" />
	</TouchableOpacity>
);

// ─── Quick Action Button ──────────────────────────────────────────────────────
interface QuickActionProps {
	icon: React.ComponentProps<typeof Ionicons>["name"];
	label: string;
	onPress: () => void;
}

const QuickAction = ({ icon, label, onPress }: QuickActionProps) => (
	<TouchableOpacity
		onPress={onPress}
		activeOpacity={0.7}
		className="flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50 py-4 gap-2"
	>
		<View className="h-11 w-11 items-center justify-center rounded-full bg-white">
			<Ionicons name={icon} size={19} color="#0F172A" />
		</View>
		<Text className="text-sm font-JakartaMedium text-slate-700">{label}</Text>
	</TouchableOpacity>
);

interface StatCardProps {
	label: string;
	value: string;
	icon: React.ComponentProps<typeof Ionicons>["name"];
}

const StatCard = ({ label, value, icon }: StatCardProps) => (
	<View className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4">
		<View className="h-9 w-9 items-center justify-center rounded-full bg-white">
			<Ionicons name={icon} size={16} color="#0F172A" />
		</View>
		<Text className="mt-3 text-lg font-JakartaBold text-slate-900">{value}</Text>
		<Text className="mt-1 text-xs font-JakartaMedium uppercase tracking-wide text-slate-500">
			{label}
		</Text>
	</View>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Profile = () => {
	const { user } = useUser();
	const { signOut } = useAuth();

	const fullName = user?.fullName || "Celer Rider";
	const email =
		user?.primaryEmailAddress?.emailAddress || "No email available";
	const avatar = user?.imageUrl;
	const firstLetter = fullName.charAt(0).toUpperCase();
	const joinedDate = user?.createdAt
		? new Date(user.createdAt).toLocaleDateString("en-US", {
				month: "short",
				year: "numeric",
		  })
		: "Unknown";

	// Replace with real rating from your backend
	const rating = "4.98";
	const totalTrips = "124";
	const loyaltyTier = "Gold";

	const handleSignOut = () => {
		Alert.alert("Log Out", "Are you sure you want to log out?", [
			{ text: "Cancel", style: "cancel" },
			{ text: "Log Out", style: "destructive", onPress: () => signOut() },
		]);
	};

	return (
		<SafeAreaView className="flex-1 bg-white">
			<SignedIn>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 48 }}
				>
					{/* ── Top bar ── */}
					<View className="flex-row items-center justify-between px-5 pb-2 pt-4">
						<TouchableOpacity
							onPress={() => router.back()}
							className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
						>
							<Ionicons name="chevron-back" size={20} color="#0F172A" />
						</TouchableOpacity>
						<Text className="text-lg font-JakartaBold text-slate-900">
							Account
						</Text>
						<TouchableOpacity
							onPress={() => router.push("/(root)/edit-profile" as any)}
							className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
						>
							<Ionicons name="create-outline" size={19} color="#0F172A" />
						</TouchableOpacity>
					</View>

					{/* ── Avatar section ── */}
					<View className="items-center mt-6 mb-4">
						{/* Avatar with star badge */}
						<View className="relative">
							{avatar ? (
								<Image
									source={{ uri: avatar }}
									className="w-28 h-28 rounded-full"
								/>
							) : (
								<View className="w-28 h-28 rounded-full bg-orange-200 items-center justify-center">
									<Text className="text-5xl font-JakartaExtraBold text-white">
										{firstLetter}
									</Text>
								</View>
							)}
							{/* Star badge — bottom-right */}
							<View className="absolute bottom-1 right-1 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
								<Ionicons name="checkmark" size={15} color="#FFFFFF" />
							</View>
						</View>

						{/* Name */}
						<Text className="mt-4 text-2xl font-JakartaBold text-gray-900">
							{fullName}
						</Text>

						{/* Rating · Member since */}
						<View className="mt-1 flex-row items-center gap-1">
							<MaterialCommunityIcons name="star-four-points" size={13} color="#16A34A" />
							<Text className="text-sm font-Jakarta text-gray-500">{rating} Rating</Text>
							<Text className="text-gray-300 mx-1">•</Text>
							<Text className="text-sm font-Jakarta text-gray-500">
								Member since {joinedDate}
							</Text>
						</View>
					</View>

					{/* ── Profile properties ── */}
					<View className="mt-6 px-5">
						<Text className="text-sm font-JakartaBold uppercase tracking-widest text-slate-400">
							Profile Overview
						</Text>
						<View className="mt-3 flex-row gap-3">
							<StatCard label="Rating" value={rating} icon="star-outline" />
							<StatCard label="Trips" value={totalTrips} icon="car-outline" />
							<StatCard label="Tier" value={loyaltyTier} icon="ribbon-outline" />
						</View>
						<View className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
							<Text className="text-xs font-JakartaBold uppercase tracking-widest text-slate-400">
								Primary Email
							</Text>
							<Text className="mt-2 text-base font-JakartaMedium text-slate-800">
								{email}
							</Text>
						</View>
					</View>

					{/* ── Quick actions ── */}
					<View className="flex-row gap-3 px-5 mt-6">
						<QuickAction
							icon="time-outline"
							label="History"
							onPress={() => router.push("/(root)/ride-history" as any)}
						/>
						<QuickAction
							icon="card-outline"
							label="Payment"
							onPress={() => router.push("/(root)/payment" as any)}
						/>
						<QuickAction
							icon="create-outline"
							label="Edit"
							onPress={() => router.push("/(root)/edit-profile" as any)}
						/>
					</View>

					{/* ── Menu rows ── */}
					<View className="mx-5 mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
						<MenuRow
							icon="shield-checkmark-outline"
							label="Safety Settings"
							onPress={() => router.push("/(root)/safety" as any)}
						/>
						<RowDivider />
						<MenuRow
							icon="pricetags-outline"
							label="Promotions"
							badge="2 NEW"
							onPress={() => router.push("/(root)/promotions" as any)}
						/>
						<RowDivider />
						<MenuRow
							icon="help-circle-outline"
							label="Help & Support"
							onPress={() => router.push("/(root)/help" as any)}
						/>
						<RowDivider />
						<MenuRow
							icon="document-text-outline"
							label="Legal & Privacy"
							onPress={() => router.push("/(root)/legal" as any)}
						/>
					</View>

					{/* ── Log Out button ── */}
					<View className="mx-5 mt-6">
						<TouchableOpacity
							onPress={handleSignOut}
							activeOpacity={0.8}
							className="flex-row items-center justify-center gap-2 rounded-full bg-red-50 py-4"
						>
							<Ionicons name="log-out-outline" size={18} color="#EF4444" />
							<Text className="text-base font-JakartaBold text-red-500">
								Log Out
							</Text>
						</TouchableOpacity>
					</View>

					{/* ── App version ── */}
					<Text className="mt-6 text-center text-xs font-JakartaMedium uppercase tracking-widest text-gray-300">
						APP VERSION 1.0.0 • CELER
					</Text>
				</ScrollView>
			</SignedIn>

			<SignedOut>
				<View className="flex-1 items-center justify-center px-6">
					<View className="h-20 w-20 items-center justify-center rounded-full bg-slate-100">
						<Ionicons name="person-outline" size={38} color="#64748B" />
					</View>
					<Text className="mt-4 text-xl font-JakartaSemiBold text-black">
						You're not signed in
					</Text>
					<Text className="mt-2 text-base font-Jakarta text-gray-500 text-center">
						Sign in to view your profile, rides, and settings.
					</Text>
					<Link href="/(auth)/sign-in" asChild>
						<TouchableOpacity className="mt-8 w-full rounded-full bg-blue-500 py-4 items-center">
							<Text className="text-lg font-JakartaBold text-white">
								Sign In
							</Text>
						</TouchableOpacity>
					</Link>
				</View>
			</SignedOut>
		</SafeAreaView>
	);
};

export default Profile;
