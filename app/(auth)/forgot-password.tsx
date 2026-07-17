import CustomButton from "@/components/customButton";
import InputField from "@/components/inputField";
import { icons, images } from "@/constants";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { a11yLink, a11yImage } from "@/lib/accessibility";

const ForgotPassword = () => {
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onResetPress = useCallback(async () => {
    if (!isLoaded) return;

    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    try {
      await signIn.create({ identifier: email });
      setSent(true);
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ?? "Could not send reset email. Please try again.";
      Alert.alert("Error", message);
    }
  }, [email, isLoaded, signIn]);

  return (
    <ScrollView className="flex-1 bg-white dark:bg-dark-bg">
      <View className="flex-1 bg-white dark:bg-dark-bg">
        <View className="relative h-[250px] w-full">
          <Image
            source={images.signUpCar}
            className="z-0 h-[250px] w-full"
            {...a11yImage("Reset password illustration")}
          />
          <Text className="absolute bottom-5 left-5 font-JakartaSemiBold text-2xl text-black dark:text-dark-text">
            Reset Password
          </Text>
        </View>
        <View className="p-5">
          {sent ? (
            <View className="mt-6 items-center">
              <Text className="text-center font-JakartaMedium text-lg text-black dark:text-dark-text">
                Check your email
              </Text>
              <Text className="mt-2 text-center text-sm text-general-200 dark:text-dark-text-secondary">
                We sent a password reset link to {email}
              </Text>
              <CustomButton
                title="Back to Sign In"
                onPress={() => router.replace("/(auth)/sign-in")}
                className="mt-6"
              />
            </View>
          ) : (
            <>
              <Text className="mb-4 text-base text-general-200 dark:text-dark-text-secondary">
                Enter your email and we&apos;ll send you a link to reset your password.
              </Text>
              <InputField
                label="Email"
                placeholder="Enter your email"
                icon={icons.email}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <CustomButton title="Send Reset Link" onPress={onResetPress} className="mt-6" />
            </>
          )}
          <Link
            href="/(auth)/sign-in"
            className="mt-10 text-center text-lg text-general-200 dark:text-dark-text-secondary"
            {...a11yLink("Back to sign in", "Navigate to sign in page")}
          >
            <Text className="dark:text-dark-text-secondary">Back to </Text>
            <Text className="text-primary-500">Sign In</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default ForgotPassword;
