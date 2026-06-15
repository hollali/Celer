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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessibilityLabel={label ? `Dismiss keyboard for ${label}` : "Dismiss keyboard"}
        accessibilityRole="none"
      >
        <View className="my-2 w-full">
          <Text
            className={`text-lg font-JakartaSemiBold mb-3 text-black dark:text-dark-text ${labelStyle}`}
            {...a11y(label, undefined, "header")}
          >
            {label}
          </Text>
          <View
            className={`flex flex-row justify-start items-center relative bg-neutral-100 dark:bg-dark-card rounded-full border border-neutral-100 dark:border-dark-border focus:border-primary-500 ${containerStyle}`}
          >
            {icon && (
              <Image
                source={icon}
                className={`w-6 h-6 ml-4 ${iconStyle}`}
                {...a11y("", "", "none")}
              />
            )}
            <TextInput
              className={`rounded-full p-4 font-JakartaSemiBold text-[15px] flex-1 ${inputStyle} text-left text-black dark:text-dark-text`}
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