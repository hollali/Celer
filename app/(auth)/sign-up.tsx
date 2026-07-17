import CustomButton from "@/components/customButton";
import InputField from "@/components/inputField";
import OAuth from "@/components/oAuth";
import { icons, images } from "@/constants";
import { useSignUp, useAuth } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { Link, router } from "expo-router";
import React, { useRef, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import ReactNativeModal from "react-native-modal";
import { a11yLink, a11yImage } from "@/lib/accessibility";
import { fetchAPI } from "@/lib/fetch";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { getToken } = useAuth();
  const verificationStrategy =
    (process.env.EXPO_PUBLIC_CLERK_EMAIL_VERIFICATION_STRATEGY as
      "email_code" | "email_link" | undefined) ?? "email_code";
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const fallbackTried = useRef(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (!form.email.trim() || !form.password.trim() || !form.name.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const signUpAttempt = await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });

        try {
          const token = await getToken();
          await fetchAPI(
            "/(api)/user",
            {
              method: "POST",
              body: JSON.stringify({ name: form.name, email: form.email }),
            },
            token,
          );
        } catch {
          // DB user creation failed; will be retried on next API call
        }

        router.replace("/(root)/(tabs)/home");
        return;
      }

      await prepareVerification(verificationStrategy);
    } catch (err) {
      if (err && typeof err === "object" && "errors" in err && Array.isArray(err.errors)) {
        const clerkErrors = err.errors as { longMessage?: string }[];
        Alert.alert("Error", clerkErrors[0]?.longMessage || "An error occurred during sign-up");
      } else {
        Alert.alert("Error", "An error occurred during sign-up");
      }
    }
  };

  const prepareVerification = async (strategy: "email_code" | "email_link") => {
    if (!signUp) return;
    try {
      if (strategy === "email_link") {
        await signUp.prepareEmailAddressVerification({
          strategy: "email_link",
          redirectUrl: Linking.createURL("/sign-in"),
        });
        Alert.alert(
          "Check your email",
          "We sent you a verification link. Open the link to verify your email, then sign in.",
        );
        router.push("/sign-in");
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({ ...verification, state: "pending" });
    } catch (err: any) {
      const clerkCode = err?.errors?.[0]?.code;
      if (clerkCode === "strategy_for_user_invalid") {
        const fallback = strategy === "email_code" ? "email_link" : "email_code";
        if (!fallbackTried.current) {
          fallbackTried.current = true;
          await prepareVerification(fallback);
          return;
        }
        const reloaded = await signUp.reload();
        if (reloaded.createdSessionId) {
          await setActive({ session: reloaded.createdSessionId });
          router.replace("/(root)/(tabs)/home");
          return;
        }
      }
      throw err;
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        setVerification({ ...verification, state: "success", code: "" });
      } else {
        setVerification({
          ...verification,
          state: "failed",
          error: "Verification failed. Please try again.",
        });
      }
    } catch (err) {
      setVerification({
        ...verification,
        state: "failed",
        error: "Verification failed. Please try again.",
      });
    }
  };
  return (
    <ScrollView className="flex-1 bg-white dark:bg-dark-bg">
      <View className="flex-1 bg-white dark:bg-dark-bg">
        <View className="relative h-[250px] w-full">
          <Image
            source={images.signUpCar}
            className="z-0 h-[250px] w-full"
            {...a11yImage("Create account illustration")}
          />
          <Text className="absolute bottom-5 left-5 font-JakartaSemiBold text-2xl text-black dark:text-dark-text">
            Create Your Account
          </Text>
        </View>
        <View className="p-5">
          <InputField
            label="Name"
            placeholder="Enter Your Name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />
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
          <CustomButton title="Sign Up" onPress={onSignUpPress} className="mt-6 bg-primary-500" />
          <OAuth />
          <Link
            href="/sign-in"
            className="mt-10 text-center text-lg text-general-200 dark:text-dark-text-secondary"
            {...a11yLink("Sign in", "Navigate to sign in page")}
          >
            <Text className="dark:text-dark-text-secondary">Already have an account? </Text>
            <Text className="text-primary-500">Log In</Text>
          </Link>
        </View>
        <ReactNativeModal
          isVisible={verification.state === "pending"}
          onModalHide={() => {
            if (verification.state === "success") {
              setShowSuccessModal(true);
            }
          }}
        >
          <View className="min-h-[300px] rounded-2xl bg-white px-7 py-9 dark:bg-dark-card">
            <Text className="mb-2 font-JakartaExtraBold text-2xl text-black dark:text-dark-text">
              Verification
            </Text>
            <Text className="mb-5 font-Jakarta text-black dark:text-dark-text-secondary">
              We've sent a verification code to {form.email}
            </Text>
            <InputField
              label="Verification Code"
              placeholder="Enter Verification Code"
              icon={icons.lock}
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) => setVerification({ ...verification, code })}
            />
            {verification.error && (
              <Text className="mt-1 text-sm text-red-500">{verification.error}</Text>
            )}
            <CustomButton
              title="Verify Email"
              onPress={onVerifyPress}
              className="mt-5 bg-success-500"
            />
          </View>
        </ReactNativeModal>
        <ReactNativeModal isVisible={showSuccessModal}>
          <View className="min-h-[300px] rounded-2xl bg-white px-7 py-9 dark:bg-dark-card">
            <Image
              source={images.check}
              className="mx-auto my-5 h-[110px] w-[110px]"
              {...a11yImage("Verified checkmark")}
            />
            <Text className="text-center font-JakartaBold text-3xl text-black dark:text-dark-text">
              Verified
            </Text>
            <Text className="mt-2 text-center font-Jakarta text-base text-gray-400 dark:text-dark-text-secondary">
              Your account has been successfully verified.
            </Text>
            <CustomButton
              title="Continue"
              onPress={async () => {
                try {
                  const token = await getToken();
                  await fetchAPI(
                    "/(api)/user",
                    {
                      method: "POST",
                      body: JSON.stringify({ name: form.name, email: form.email }),
                    },
                    token,
                  );
                } catch {
                  // DB user creation failed; will be retried on next API call
                }
                router.push(`/(root)/(tabs)/home`);
              }}
              className="mt-5"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;
