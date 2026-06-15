import { GoogleInputProps } from "@/types/type";
import { Image, View, useColorScheme } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { colors } from "@/constants";
import { a11y } from "@/lib/accessibility";

const googlePlacesApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const GoogleInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  const isDark = useColorScheme() === "dark";
  const bgColor = textInputBackgroundColor || (isDark ? colors.dark.card : "white");

  return (
    <View
      className={`flex flex-row items-center justify-center relative z-50 rounded-xl ${containerStyle}`}
      accessibilityLabel={initialLocation || "Search destination"}
      accessibilityRole="search"
    >
      <GooglePlacesAutocomplete
        fetchDetails
        placeholder={initialLocation ?? "Where do you want to go?"}
        debounce={200}
        styles={{
          textInputContainer: {
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: bgColor,
            borderRadius: 20,
            paddingHorizontal: 20,
            borderWidth: 1,
            borderColor: isDark ? colors.dark.border : "#E2E8F0",
          },
          textInput: {
            backgroundColor: bgColor,
            color: isDark ? colors.dark.text : "#000",
            fontSize: 16,
            fontWeight: "600",
            marginTop: 5,
            width: "100%",
          },
          listView: {
            backgroundColor: bgColor,
            position: "relative",
            top: 0,
            width: "100%",
            borderRadius: 10,
            zIndex: 99,
          },
        }}
        onPress={(data, details = null) => {
          handlePress({
            latitude: details?.geometry.location.lat!,
            longitude: details?.geometry.location.lng!,
            address: data.description,
          });
        }}
        query={{
          key: googlePlacesApiKey,
          language: "en",
        }}
        renderLeftButton={() =>
          icon && (
            <View className="justify-center items-center w-6 h-6">
              <Image source={icon} className="w-6 h-6" resizeMode="contain" {...a11y("", "", "none")} />
            </View>
          )
        }
        textInputProps={{
          placeholderTextColor: isDark ? colors.dark["text-secondary"] : "#888",
          accessibilityLabel: initialLocation || "Search destination",
        }}
      />
    </View>
  );
};

export default GoogleInput;
