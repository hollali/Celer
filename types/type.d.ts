import { TextInputProps, TouchableOpacityProps } from "react-native";
import type { ComponentType } from "react";
import type { ImageSourcePropType } from "react-native";

declare interface Driver {
	id: number;
	first_name: string;
	last_name: string;
	profile_image_url: string;
	car_image_url: string;
	car_seats: number;
	rating: number;
	is_available: boolean;
	current_latitude: number | null;
	current_longitude: number | null;
	phone: string;
	email: string;
	vehicle_type: string;
	license_number: string;
}

declare interface MarkerData {
	latitude: number;
	longitude: number;
	id: number;
	title: string;
	profile_image_url: string;
	car_image_url: string;
	car_seats: number;
	rating: number;
	first_name: string;
	last_name: string;
	time?: number;
	price?: string;
}

declare interface Ride {
	ride_id: number;
	origin_address: string;
	destination_address: string;
	origin_latitude: number;
	origin_longitude: number;
	destination_latitude: number;
	destination_longitude: number;
	ride_time: number;
	fare_price: number;
	ride_status: "requested" | "accepted" | "in_progress" | "completed" | "canceled";
	payment_status: "pending" | "paid" | "failed" | "refunded";
	driver_id: number | null;
	user_id: number;
	created_at: string;
	updated_at: string;
	completed_at: string | null;
	driver: {
		first_name: string;
		last_name: string;
		car_seats: number;
	} | null;
}

declare interface ButtonProps extends TouchableOpacityProps {
	title: string;
	bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
	textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
	IconLeft?: ComponentType<{ size?: number; color?: string }>;
	IconRight?: ComponentType<{ size?: number; color?: string }>;
	className?: string;
}

declare interface PlaceInputProps {
	icon?: ImageSourcePropType;
	initialLocation?: string;
	containerStyle?: string;
	textInputBackgroundColor?: string;
	handlePress: ({
		latitude,
		longitude,
		address,
	}: {
		latitude: number;
		longitude: number;
		address: string;
	}) => void;
}

declare interface InputFieldProps extends TextInputProps {
	label: string;
	icon?: ImageSourcePropType;
	secureTextEntry?: boolean;
	labelStyle?: string;
	containerStyle?: string;
	inputStyle?: string;
	iconStyle?: string;
	className?: string;
}

declare interface PaymentProps {
	fullName: string;
	email: string;
	amount: string;
	driverId: number;
	rideTime: number;
}

declare interface LocationStore {
	userLatitude: number | null;
	userLongitude: number | null;
	userAddress: string | null;
	destinationLatitude: number | null;
	destinationLongitude: number | null;
	destinationAddress: string | null;
	setUserLocation: ({
		latitude,
		longitude,
		address,
	}: {
		latitude: number;
		longitude: number;
		address: string;
	}) => void;
	setDestinationLocation: ({
		latitude,
		longitude,
		address,
	}: {
		latitude: number;
		longitude: number;
		address: string;
	}) => void;
}

declare interface DriverStore {
	drivers: MarkerData[];
	selectedDriver: number | null;
	driversLoading: boolean;
	setSelectedDriver: (driverId: number) => void;
	setDrivers: (drivers: MarkerData[]) => void;
	setDriversReady: () => void;
	clearSelectedDriver: () => void;
}

declare interface DriverCardProps {
	item: MarkerData;
	selected: number;
	setSelected: () => void;
}

declare interface Conversation {
	id: number;
	driver_id: number | null;
	is_support: boolean;
	is_safety: boolean;
	is_promo: boolean;
	last_message: string;
	last_message_at: string;
	user_unread: number;
	created_at: string;
	name: string;
	role: string;
	avatar_color: string;
	avatar_initials: string;
	type: "driver" | "support" | "safety" | "promo";
	online: boolean;
}

declare interface Message {
	id: number;
	conversation_id: number;
	sender_type: "user" | "driver" | "support" | "safety" | "promo";
	sender_name: string;
	text: string;
	created_at: string;
}

declare interface UserProfile {
	id: number;
	name: string;
	email: string;
	clerk_id: string;
	phone: string;
	bio: string;
	preferred_vehicle: string;
	avatar_url: string;
	marketing_opt_in: boolean;
	ride_updates: boolean;
	total_trips: number;
	rating: number;
	loyalty_tier: string;
	created_at: string;
	updated_at: string;
}

declare interface Notification {
	id: number;
	user_id: number;
	title: string;
	body: string;
	type: "general" | "ride" | "promo" | "safety" | "support";
	is_read: boolean;
	data: Record<string, unknown>;
	created_at: string;
}

declare interface SupportTicket {
	id: number;
	user_id: number;
	subject: string;
	message: string;
	status: "open" | "in_progress" | "resolved" | "closed";
	priority: "low" | "medium" | "high" | "urgent";
	created_at: string;
	updated_at: string;
}

declare interface SavedPlace {
	id: number;
	user_id: number;
	label: string;
	address: string;
	latitude: number;
	longitude: number;
	icon: string;
	created_at: string;
}

declare interface PaymentMethod {
	id: number;
	user_id: number;
	method_type: "card" | "momo" | "cash";
	provider: string;
	account_number: string;
	is_default: boolean;
	created_at: string;
}

declare interface SafetySettings {
	id: number;
	user_id: number;
	share_trip: boolean;
	emergency_alerts: boolean;
	audio_recording: boolean;
	check_in_interval: number;
}

declare interface SafetyContact {
	id: number;
	user_id: number;
	name: string;
	phone: string;
	relationship: string;
}

declare interface Rating {
	id: number;
	ride_id: number;
	user_id: number;
	driver_id: number;
	rating: number;
	comment: string;
	created_at: string;
}

declare interface Promotion {
	id: number;
	code: string;
	title: string;
	description: string;
	discount_type: "percent" | "flat";
	discount_value: number;
	max_uses: number;
	current_uses: number;
	min_fare: number;
	expires_at: string;
	is_active: boolean;
}
