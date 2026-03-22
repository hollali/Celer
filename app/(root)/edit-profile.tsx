import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EditProfile = () => {
  const { user } = useUser();

  const [name, setName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(
    user?.primaryEmailAddress?.emailAddress || "",
  );

  const handleSave = () => {
    // TODO: connect to backend / Clerk update
    console.log("Updated:", name, email);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      {/* Name */}
      <View className="mt-6">
        <Text className="text-gray-500 mb-1">Full Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          className="border border-gray-200 rounded-lg px-4 py-3"
        />
      </View>

      {/* Email */}
      <View className="mt-4">
        <Text className="text-gray-500 mb-1">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          className="border border-gray-200 rounded-lg px-4 py-3"
        />
      </View>

      {/* Save */}
      <TouchableOpacity
        onPress={handleSave}
        className="mt-8 rounded-full bg-green-500 py-4 items-center"
      >
        <Text className="text-white font-JakartaBold">Save Changes</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default EditProfile;
