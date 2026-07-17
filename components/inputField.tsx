import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { InputFieldProps } from "@/types/type";
import { a11y } from "@/lib/accessibility";

const InputField = ({
  label,
  icon,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
  className,
  ...props
}: InputFieldProps) => {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessibilityLabel={label ? `Dismiss keyboard for ${label}` : "Dismiss keyboard"}
        accessibilityRole="none"
      >
        <View className="my-2 w-full">
          <Text
            className={`mb-3 font-JakartaSemiBold text-lg text-black dark:text-dark-text ${labelStyle}`}
            {...a11y(label, undefined, "header")}
          >
            {label}
          </Text>
          <View
            className={`relative flex flex-row items-center justify-start rounded-full border border-neutral-100 bg-neutral-100 focus:border-primary-500 dark:border-dark-border dark:bg-dark-card ${containerStyle}`}
          >
            {icon && (
              <Image
                source={icon}
                className={`ml-4 h-6 w-6 ${iconStyle}`}
                {...a11y("", "", "none")}
              />
            )}
            <TextInput
              className={`flex-1 rounded-full p-4 font-JakartaSemiBold text-[15px] ${inputStyle} text-left text-black dark:text-dark-text`}
              secureTextEntry={secureTextEntry}
              placeholderTextColor="#888"
              accessibilityLabel={label || props.placeholder || "Input field"}
              {...props}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default InputField;
