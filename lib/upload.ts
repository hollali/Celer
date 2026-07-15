import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export type DocumentType =
  | "profile_photo"
  | "drivers_license"
  | "vehicle_registration"
  | "insurance"
  | "vehicle_photo";

export interface UploadResult {
  url: string;
  type: DocumentType;
}

const pickImage = async (allowEditing = true): Promise<ImagePicker.ImagePickerResult> => {
  return ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: allowEditing,
    quality: 0.8,
    base64: false,
  });
};

const pickFromCamera = async (allowEditing = true): Promise<ImagePicker.ImagePickerResult> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Camera permission is required to take photos");
  }

  return ImagePicker.launchCameraAsync({
    allowsEditing: allowEditing,
    quality: 0.8,
    base64: false,
  });
};

export const pickAndUploadImage = async (
  type: DocumentType,
  source: "library" | "camera" = "library"
): Promise<UploadResult | null> => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary not configured. Check EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET");
  }

  const result = source === "camera"
    ? await pickFromCamera(type !== "vehicle_photo")
    : await pickImage(type !== "vehicle_photo");

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];
  const fileUri = asset.uri;

  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: "base64",
  });

  const uploadUrl = `https://api.cloudinary.com/v1_2/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append("file", `data:image/jpeg;base64,${base64}`);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", `celer/drivers/${type}`);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Upload failed");
  }

  const data = await response.json();

  return {
    url: data.secure_url,
    type,
  };
};

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  profile_photo: "Profile Photo",
  drivers_license: "Driver's License",
  vehicle_registration: "Vehicle Registration",
  insurance: "Insurance Certificate",
  vehicle_photo: "Vehicle Photo",
};
