import { BlurView } from "expo-blur";
import { Text, TouchableOpacity, View } from "react-native";

import { ButtonProps } from "@/types/type";
import { a11yButton } from "@/lib/accessibility";
import { useTheme } from "@/lib/ThemeContext";

const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
	switch (variant) {
		case "secondary":
			return "bg-gray-500 dark:bg-dark-text-secondary";
		case "danger":
			return "bg-red-500";
		case "success":
			return "bg-green-500";
		case "outline":
			return "bg-transparent border-neutral-300 dark:border-dark-border border-[0.5px]";
		default:
			return "bg-[#0286FF]";
	}
};

const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
	switch (variant) {
		case "primary":
			return "text-black dark:text-dark-text";
		case "secondary":
			return "text-gray-100";
		case "danger":
			return "text-red-100";
		case "success":
			return "text-green-100";
		default:
			return "text-white";
	}
};

const CustomButton = ({
	onPress,
	title,
	bgVariant = "primary",
	textVariant = "default",
	IconLeft,
	IconRight,
	className,
	disabled,
	...props
}: ButtonProps) => {
	const { isDark, useLiquidGlass } = useTheme();

	if (useLiquidGlass && bgVariant === "primary") {
		return (
			<TouchableOpacity
				onPress={onPress}
				disabled={disabled}
				activeOpacity={0.8}
				className={`rounded-full ${disabled ? "opacity-50" : ""} ${className}`}
				{...a11yButton(title, undefined, disabled)}
				{...props}
			>
				<BlurView
					intensity={80}
					tint={isDark ? "systemMaterialDark" : "systemThinMaterialLight"}
					style={{
						flexDirection: "row",
						justifyContent: "center",
						alignItems: "center",
						padding: 12,
						borderRadius: 999,
						overflow: "hidden",
					}}
				>
					{IconLeft && <IconLeft />}
					<Text className={`text-lg font-bold ${getTextVariantStyle(textVariant)}`}>
						{title}
					</Text>
					{IconRight && <IconRight />}
				</BlurView>
			</TouchableOpacity>
		);
	}

	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={disabled}
			className={`rounded-full p-3 flex flex-row justify-center items-center shadow-md shadow-neutral-400/70 dark:shadow-dark-border ${getBgVariantStyle(bgVariant)} ${disabled ? "opacity-50" : ""} ${className}`}
			{...a11yButton(title, undefined, disabled)}
			{...props}>
			{IconLeft && <IconLeft />}
			<Text className={`text-lg font-bold ${getTextVariantStyle(textVariant)}`}>
				{title}
			</Text>
			{IconRight && <IconRight />}
		</TouchableOpacity>
	);
};

export default CustomButton;
