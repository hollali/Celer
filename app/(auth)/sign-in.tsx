import CustomButton from "@/components/customButton";
import InputField from "@/components/inputField";
import OAuth from "@/components/oAuth";
import { icons, images } from "@/constants";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { a11yLink, a11yImage } from "@/lib/accessibility";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    if (!form.email.trim() || !form.password.trim()) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        Alert.alert("Error", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage ?? "Log in failed. Please try again.";
      Alert.alert("Error", message);
    }
  }, [form, isLoaded, router, setActive, signIn]);

  return (
    <ScrollView className="flex-1 bg-white dark:bg-dark-bg">
      <View className="flex-1 bg-white dark:bg-dark-bg">
        <View className="relative h-[250px] w-full">
          <Image
            source={images.signUpCar}
            className="z-0 h-[250px] w-full"
            {...a11yImage("Welcome back illustration")}
          />
          <Text className="absolute bottom-5 left-5 font-JakartaSemiBold text-2xl text-black dark:text-dark-text">
            Welcome Back
          </Text>
        </View>
        <View className="p-5">
          <InputField
            label="Email"
            placeholder="Enter Your Email"
            icon={icons.email}
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Password"
            placeholder="Enter Your Password"
            icon={icons.lock}
            secureTextEntry={true}
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />
          <Link
            href="/(auth)/forgot-password"
            className="mt-2 text-right text-sm text-primary-500"
            {...a11yLink("Forgot password", "Navigate to password reset")}
          >
            Forgot Password?
          </Link>
          <CustomButton title="Sign In" onPress={onSignInPress} className="mt-6 bg-primary-500" />
          <OAuth />
          <Link
            href="/sign-up"
            className="mt-10 text-center text-lg text-general-200 dark:text-dark-text-secondary"
            {...a11yLink("Sign up", "Navigate to create account page")}
          >
            <Text className="dark:text-dark-text-secondary">Don't have an account? </Text>
            <Text className="text-primary-500">Sign Up</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
