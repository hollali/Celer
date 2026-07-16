import { useUser, useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import CustomButton from "@/components/customButton";
import { fetchAPI } from "@/lib/fetch";
import { useTheme } from "@/lib/ThemeContext";
import { pickAndUploadImage, DOCUMENT_LABELS, type DocumentType } from "@/lib/upload";
import { a11y, a11yButton, a11yHeader } from "@/lib/accessibility";

type VehicleType = "Economy" | "Premium" | "XL";

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  vehicleType: VehicleType;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  vehiclePlate: string;
  carSeats: string;
  licenseNumber: string;
  documents: Partial<Record<DocumentType, string>>;
}

const STEPS = ["Personal Info", "Vehicle Details", "Documents", "Review"];

const VEHICLE_TYPES: { value: VehicleType; label: string; icon: React.ComponentProps<typeof Ionicons>["name"] }[] = [
  { value: "Economy", label: "Economy", icon: "car-outline" },
  { value: "Premium", label: "Premium", icon: "car-sport-outline" },
  { value: "XL", label: "XL", icon: "bus-outline" },
];

const REQUIRED_DOCUMENTS: DocumentType[] = [
  "profile_photo",
  "drivers_license",
  "vehicle_registration",
  "insurance",
  "vehicle_photo",
];

const DriverRegister = () => {
  const { user } = useUser();
  const { getToken, isLoaded } = useAuth();
  const { isDark } = useTheme();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<DocumentType | null>(null);
  const [form, setForm] = useState<FormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phoneNumbers?.[0]?.phoneNumber || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    vehicleType: "Economy",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleColor: "",
    vehiclePlate: "",
    carSeats: "4",
    licenseNumber: "",
    documents: {},
  });

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUploadDocument = async (type: DocumentType, source: "library" | "camera" = "library") => {
    try {
      setUploadingDoc(type);
      const result = await pickAndUploadImage(type, source);
      if (result) {
        setForm((prev) => ({
          ...prev,
          documents: { ...prev.documents, [type]: result.url },
        }));
      }
    } catch (err) {
      Alert.alert("Upload Failed", (err as Error).message || "Could not upload document.");
    } finally {
      setUploadingDoc(null);
    }
  };

  const promptDocumentSource = (type: DocumentType) => {
    Alert.alert(
      `Upload ${DOCUMENT_LABELS[type]}`,
      "Choose an option",
      [
        { text: "Take Photo", onPress: () => handleUploadDocument(type, "camera") },
        { text: "Choose from Library", onPress: () => handleUploadDocument(type, "library") },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!form.firstName.trim() || !form.lastName.trim()) {
        Alert.alert("Missing Info", "Please enter your full name.");
        return false;
      }
      if (!form.phone.trim()) {
        Alert.alert("Missing Info", "Please enter your phone number.");
        return false;
      }
      return true;
    }
    if (step === 1) {
      if (!form.vehicleMake.trim() || !form.vehicleModel.trim()) {
        Alert.alert("Missing Info", "Please enter vehicle make and model.");
        return false;
      }
      if (!form.vehicleYear.trim() || isNaN(Number(form.vehicleYear))) {
        Alert.alert("Missing Info", "Please enter a valid vehicle year.");
        return false;
      }
      if (!form.vehicleColor.trim()) {
        Alert.alert("Missing Info", "Please enter the vehicle color.");
        return false;
      }
      if (!form.vehiclePlate.trim()) {
        Alert.alert("Missing Info", "Please enter the license plate number.");
        return false;
      }
      if (!form.licenseNumber.trim()) {
        Alert.alert("Missing Info", "Please enter your driver's license number.");
        return false;
      }
      return true;
    }
    if (step === 2) {
      const missing = REQUIRED_DOCUMENTS.filter((d) => !form.documents[d]);
      if (missing.length > 0) {
        Alert.alert("Missing Documents", `Please upload: ${missing.map((d) => DOCUMENT_LABELS[d]).join(", ")}`);
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = await getToken();
      await fetchAPI("/(api)/driver-ride", {
        method: "POST",
        body: JSON.stringify({
          action: "register_driver",
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          vehicle_type: form.vehicleType,
          vehicle_make: form.vehicleMake.trim(),
          vehicle_model: form.vehicleModel.trim(),
          vehicle_year: Number(form.vehicleYear),
          vehicle_color: form.vehicleColor.trim(),
          vehicle_plate: form.vehiclePlate.trim(),
          car_seats: Number(form.carSeats) || 4,
          license_number: form.licenseNumber.trim(),
          documents: form.documents,
        }),
      }, token);
      router.replace("/(driver)/pending");
    } catch (err) {
      Alert.alert("Submission Failed", (err as Error).message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-bg">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
      <ScrollView contentContainerClassName="pb-12" keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-2">
          <TouchableOpacity
            onPress={() => (step > 0 ? setStep(step - 1) : router.back())}
            className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-dark-card"
            {...a11yButton("Go back", step > 0 ? "Previous step" : "Return to previous screen")}
          >
            <Ionicons name="chevron-back" size={20} color={isDark ? "#F5F5F7" : "#0F172A"} />
          </TouchableOpacity>
          <Text className="ml-3 text-lg font-JakartaBold text-slate-900 dark:text-dark-text" {...a11yHeader("Become a Driver")}>
            Become a Driver
          </Text>
        </View>

        {/* Progress bar */}
        <View className="px-5 mt-4 mb-2">
          <View className="flex-row gap-2">
            {STEPS.map((label, i) => (
              <View key={label} className="flex-1">
                <View className={`h-1.5 rounded-full ${i <= step ? "bg-primary-500" : "bg-slate-200 dark:bg-dark-border"}`} />
                <Text className={`mt-1 text-[10px] font-JakartaMedium ${i === step ? "text-primary-500" : "text-slate-400 dark:text-dark-text-secondary"}`}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="px-5 mt-6">
          {step === 0 && (
            <View>
              <Text className="text-xl font-JakartaBold text-slate-900 dark:text-dark-text mb-1">
                Personal Information
              </Text>
              <Text className="text-sm font-JakartaMedium text-slate-500 dark:text-dark-text-secondary mb-6">
                Tell us about yourself
              </Text>

              <Text className="text-xs font-JakartaBold uppercase tracking-wide text-slate-400 dark:text-dark-text-secondary mb-2">
                First Name
              </Text>
              <TextInput
                value={form.firstName}
                onChangeText={(v) => updateField("firstName", v)}
                placeholder="First name"
                placeholderTextColor={isDark ? "#4a4a4a" : "#94a3b8"}
                className="mb-4 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card px-4 py-3.5 text-base font-JakartaMedium text-slate-900 dark:text-dark-text"
                {...a11y("First name")}
              />

              <Text className="text-xs font-JakartaBold uppercase tracking-wide text-slate-400 dark:text-dark-text-secondary mb-2">
                Last Name
              </Text>
              <TextInput
                value={form.lastName}
                onChangeText={(v) => updateField("lastName", v)}
                placeholder="Last name"
                placeholderTextColor={isDark ? "#4a4a4a" : "#94a3b8"}
                className="mb-4 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card px-4 py-3.5 text-base font-JakartaMedium text-slate-900 dark:text-dark-text"
                {...a11y("Last name")}
              />

              <Text className="text-xs font-JakartaBold uppercase tracking-wide text-slate-400 dark:text-dark-text-secondary mb-2">
                Phone Number
              </Text>
              <TextInput
                value={form.phone}
                onChangeText={(v) => updateField("phone", v)}
                placeholder="+233 XX XXX XXXX"
                keyboardType="phone-pad"
                placeholderTextColor={isDark ? "#4a4a4a" : "#94a3b8"}
                className="mb-4 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card px-4 py-3.5 text-base font-JakartaMedium text-slate-900 dark:text-dark-text"
                {...a11y("Phone number")}
              />

              <Text className="text-xs font-JakartaBold uppercase tracking-wide text-slate-400 dark:text-dark-text-secondary mb-2">
                Email
              </Text>
              <TextInput
                value={form.email}
                onChangeText={(v) => updateField("email", v)}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={isDark ? "#4a4a4a" : "#94a3b8"}
                className="rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card px-4 py-3.5 text-base font-JakartaMedium text-slate-900 dark:text-dark-text"
                {...a11y("Email address")}
              />
            </View>
          )}

          {step === 1 && (
            <View>
              <Text className="text-xl font-JakartaBold text-slate-900 dark:text-dark-text mb-1">
                Vehicle Details
              </Text>
              <Text className="text-sm font-JakartaMedium text-slate-500 dark:text-dark-text-secondary mb-6">
                What will you be driving?
              </Text>

              <Text className="text-xs font-JakartaBold uppercase tracking-wide text-slate-400 dark:text-dark-text-secondary mb-3">
                Vehicle Type
              </Text>
              <View className="flex-row gap-3 mb-6">
                {VEHICLE_TYPES.map((vt) => (
                  <TouchableOpacity
                    key={vt.value}
                    onPress={() => updateField("vehicleType", vt.value)}
                    className={`flex-1 items-center rounded-xl border py-4 ${
                      form.vehicleType === vt.value
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card"
                    }`}
                    {...a11yButton(vt.label, `Select ${vt.label} vehicle type`)}
                  >
                    <Ionicons
                      name={vt.icon}
                      size={24}
                      color={form.vehicleType === vt.value ? "#0286FF" : isDark ? "#F5F5F7" : "#0F172A"}
                    />
                    <Text className={`mt-2 text-sm font-JakartaBold ${
                      form.vehicleType === vt.value ? "text-primary-500" : "text-slate-700 dark:text-dark-text"
                    }`}>
                      {vt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-xs font-JakartaBold uppercase tracking-wide text-slate-400 dark:text-dark-text-secondary mb-2">
                    Make
                  </Text>
                  <TextInput
                    value={form.vehicleMake}
                    onChangeText={(v) => updateField("vehicleMake", v)}
                    placeholder="Toyota"
                    placeholderTextColor={isDark ? "#4a4a4a" : "#94a3b8"}
                    className="rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card px-4 py-3.5 text-base font-JakartaMedium text-slate-900 dark:text-dark-text"
                    {...a11y("Vehicle make")}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-JakartaBold uppercase tracking-wide text-slate-400 dark:text-dark-text-secondary mb-2">
                    Model
                  </Text>
                  <TextInput
                    value={form.vehicleModel}
                    onChangeText={(v) => updateField("vehicleModel", v)}
                    placeholder="Corolla"
                    placeholderTextColor={isDark ? "#4a4a4a" : "#94a3b8"}
                    className="rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card px-4 py-3.5 text-base font-JakartaMedium text-slate-900 dark:text-dark-text"
                    {...a11y("Vehicle model")}
                  />
                </View>
              </View>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-xs font-JakartaBold uppercase tracking-wide text-slate-400 dark:text-dark-text-secondary mb-2">
                    Year
                  </Text>
                  <TextInput
                    value={form.vehicleYear}
                    onChangeText={(v) => updateField("vehicleYear", v)}
                    placeholder="2020"
                    keyboardType="number-pad"
                    placeholderTextColor={isDark ? "#4a4a4a" : "#94a3b8"}
                    className="rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card px-4 py-3.5 text-base font-JakartaMedium text-slate-900 dark:text-dark-text"
                    {...a11y("Vehicle year")}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-JakartaBold uppercase tracking-wide text-slate-400 dark:text-dark-text-secondary mb-2">
                    Color
                  </Text>
                  <TextInput
                    value={form.vehicleColor}
                    onChangeText={(v) => updateField("vehicleColor", v)}
                    placeholder="White"
                    placeholderTextColor={isDark ? "#4a4a4a" : "#94a3b8"}
                    className="rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card px-4 py-3.5 text-base font-JakartaMedium text-slate-900 dark:text-dark-text"
                    {...a11y("Vehicle color")}
                  />
                </View>
              </View>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-xs font-JakartaBold uppercase tracking-wide text-slate-400 dark:text-dark-text-secondary mb-2">
                    License Plate
                  </Text>
                  <TextInput
                    value={form.vehiclePlate}
                    onChangeText={(v) => updateField("vehiclePlate", v)}
                    placeholder="GR-1234-20"
                    autoCapitalize="characters"
                    placeholderTextColor={isDark ? "#4a4a4a" : "#94a3b8"}
                    className="rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card px-4 py-3.5 text-base font-JakartaMedium text-slate-900 dark:text-dark-text"
                    {...a11y("License plate number")}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-JakartaBold uppercase tracking-wide text-slate-400 dark:text-dark-text-secondary mb-2">
                    Seats
                  </Text>
                  <TextInput
                    value={form.carSeats}
                    onChangeText={(v) => updateField("carSeats", v)}
                    placeholder="4"
                    keyboardType="number-pad"
                    placeholderTextColor={isDark ? "#4a4a4a" : "#94a3b8"}
                    className="rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card px-4 py-3.5 text-base font-JakartaMedium text-slate-900 dark:text-dark-text"
                    {...a11y("Number of seats")}
                  />
                </View>
              </View>

              <Text className="text-xs font-JakartaBold uppercase tracking-wide text-slate-400 dark:text-dark-text-secondary mb-2">
                Driver's License Number
              </Text>
              <TextInput
                value={form.licenseNumber}
                onChangeText={(v) => updateField("licenseNumber", v)}
                placeholder="DL-XXXXXXXX"
                autoCapitalize="characters"
                placeholderTextColor={isDark ? "#4a4a4a" : "#94a3b8"}
                className="rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card px-4 py-3.5 text-base font-JakartaMedium text-slate-900 dark:text-dark-text"
                {...a11y("Driver's license number")}
              />
            </View>
          )}

          {step === 2 && (
            <View>
              <Text className="text-xl font-JakartaBold text-slate-900 dark:text-dark-text mb-1">
                Upload Documents
              </Text>
              <Text className="text-sm font-JakartaMedium text-slate-500 dark:text-dark-text-secondary mb-6">
                Please upload clear photos of each document
              </Text>

              {REQUIRED_DOCUMENTS.map((docType) => (
                <TouchableOpacity
                  key={docType}
                  onPress={() => promptDocumentSource(docType)}
                  disabled={uploadingDoc === docType}
                  className="mb-4 flex-row items-center rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card p-4"
                  {...a11yButton(
                    `Upload ${DOCUMENT_LABELS[docType]}`,
                    form.documents[docType] ? "Document uploaded, tap to replace" : "Tap to select a photo"
                  )}
                >
                  {form.documents[docType] ? (
                    <Image
                      source={{ uri: form.documents[docType] }}
                      className="w-16 h-16 rounded-lg"
                      {...a11y(`Uploaded ${DOCUMENT_LABELS[docType]}`)}
                    />
                  ) : (
                    <View className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-dark-border items-center justify-center">
                      {uploadingDoc === docType ? (
                        <ActivityIndicator size="small" color="#0286FF" />
                      ) : (
                        <Ionicons name="camera-outline" size={28} color="#94a3b8" />
                      )}
                    </View>
                  )}
                  <View className="ml-4 flex-1">
                    <Text className="text-sm font-JakartaBold text-slate-900 dark:text-dark-text">
                      {DOCUMENT_LABELS[docType]}
                    </Text>
                    <Text className="text-xs font-JakartaMedium text-slate-500 dark:text-dark-text-secondary mt-0.5">
                      {form.documents[docType]
                        ? "Uploaded — tap to replace"
                        : "Tap to upload"}
                    </Text>
                  </View>
                  <Ionicons
                    name={form.documents[docType] ? "checkmark-circle" : "add-circle-outline"}
                    size={22}
                    color={form.documents[docType] ? "#22c55e" : "#94a3b8"}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 3 && (
            <View>
              <Text className="text-xl font-JakartaBold text-slate-900 dark:text-dark-text mb-1">
                Review Your Application
              </Text>
              <Text className="text-sm font-JakartaMedium text-slate-500 dark:text-dark-text-secondary mb-6">
                Confirm everything looks correct before submitting
              </Text>

              <ReviewSection title="Personal Info" onEdit={() => setStep(0)} isDark={isDark}>
                <ReviewRow label="Name" value={`${form.firstName} ${form.lastName}`} />
                <ReviewRow label="Phone" value={form.phone} />
                <ReviewRow label="Email" value={form.email} />
              </ReviewSection>

              <ReviewSection title="Vehicle" onEdit={() => setStep(1)} isDark={isDark}>
                <ReviewRow label="Type" value={form.vehicleType} />
                <ReviewRow label="Vehicle" value={`${form.vehicleYear} ${form.vehicleMake} ${form.vehicleModel}`} />
                <ReviewRow label="Color" value={form.vehicleColor} />
                <ReviewRow label="Plate" value={form.vehiclePlate} />
                <ReviewRow label="Seats" value={form.carSeats} />
                <ReviewRow label="License #" value={form.licenseNumber} />
              </ReviewSection>

              <ReviewSection title="Documents" onEdit={() => setStep(2)} isDark={isDark}>
                {REQUIRED_DOCUMENTS.map((docType) => (
                  <View key={docType} className="flex-row items-center justify-between py-1.5">
                    <Text className="text-sm font-JakartaMedium text-slate-600 dark:text-dark-text-secondary">
                      {DOCUMENT_LABELS[docType]}
                    </Text>
                    <Ionicons
                      name={form.documents[docType] ? "checkmark-circle" : "close-circle"}
                      size={18}
                      color={form.documents[docType] ? "#22c55e" : "#EF4444"}
                    />
                  </View>
                ))}
              </ReviewSection>

              <Text className="mt-4 text-xs font-JakartaMedium text-slate-400 dark:text-dark-text-secondary text-center">
                By submitting, you agree to Celer's driver terms and verification process.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom action */}
      <View className="px-5 pb-6 pt-3 bg-white dark:bg-dark-bg border-t border-slate-100 dark:border-dark-border">
        {step < STEPS.length - 1 ? (
          <CustomButton
            title="Continue"
            onPress={handleNext}
            className="bg-primary-500"
          />
        ) : (
          <CustomButton
            title={submitting ? "Submitting..." : "Submit Application"}
            onPress={handleSubmit}
            className="bg-primary-500"
            disabled={submitting}
          />
        )}
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- Review sub-components ---

const ReviewSection = ({
  title,
  onEdit,
  isDark,
  children,
}: {
  title: string;
  onEdit: () => void;
  isDark: boolean;
  children: React.ReactNode;
}) => (
  <View className="mb-5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card p-4">
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-sm font-JakartaBold text-slate-900 dark:text-dark-text">{title}</Text>
      <TouchableOpacity onPress={onEdit} {...a11yButton("Edit", `Edit ${title}`)}>
        <Text className="text-xs font-JakartaBold text-primary-500">Edit</Text>
      </TouchableOpacity>
    </View>
    {children}
  </View>
);

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between py-1.5">
    <Text className="text-sm font-JakartaMedium text-slate-500 dark:text-dark-text-secondary">{label}</Text>
    <Text className="text-sm font-JakartaMedium text-slate-900 dark:text-dark-text">{value}</Text>
  </View>
);

export default DriverRegister;
