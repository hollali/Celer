import { GoogleInputProps } from "@/types/type";
import { images } from "@/constants";
import { Image, View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const googlePlacesApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const GoogleInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  return (
    <View
      className={`flex flex-row items-center justify-center relative z-50 rounded-xl ${containerStyle}`}
    >
      <GooglePlacesAutocomplete
        fetchDetails
        placeholder={initialLocation ?? "Where do you want to go?"}
        debounce={200}
        styles={{
          textInputContainer: {
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: textInputBackgroundColor || "white",
            borderRadius: 20,
            paddingHorizontal: 20,
            borderWidth: 1,
            borderColor: "#E2E8F0",
          },
          textInput: {
            backgroundColor: textInputBackgroundColor || "white",
            fontSize: 16,
            fontWeight: "600",
            marginTop: 5,
            width: "100%",
          },
          listView: {
            backgroundColor: textInputBackgroundColor || "white",
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
              <Image source={icon} className="w-6 h-6" resizeMode="contain" />
            </View>
          )
        }
        textInputProps={{
          placeholderTextColor: "#888",
        }}
      />
    </View>
  );
};

export default GoogleInput;
