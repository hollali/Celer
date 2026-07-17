import * as ImagePicker from "expo-image-picker";

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const UPLOAD_TIMEOUT_MS = 30_000;

export type DocumentType =
  "profile_photo" | "drivers_license" | "vehicle_registration" | "insurance" | "vehicle_photo";

export interface UploadResult {
  url: string;
  type: DocumentType;
}

const pickImage = async (allowEditing = true): Promise<ImagePicker.ImagePickerResult> => {
  return ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: allowEditing,
    quality: 0.8,
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
  });
};

const validateAsset = (asset: ImagePicker.ImagePickerAsset) => {
  const mimeType = asset.mimeType ?? "image/jpeg";
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(
      `Unsupported file type "${mimeType}". Please choose a JPEG, PNG, or WebP image.`,
    );
  }
};

const uploadWithRetry = async (url: string, body: FormData): Promise<Response> => {
  const attempt = async (retriesLeft: number): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: "POST",
        body,
        signal: controller.signal,
      });
      return response;
    } catch (err) {
      const isNetworkError =
        err instanceof Error && (err.name === "AbortError" || err.message.includes("Network"));
      if (isNetworkError && retriesLeft > 0) {
        return attempt(retriesLeft - 1);
      }
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error("Upload timed out. Check your connection and try again.");
      }
      throw new Error("Network error. Please check your connection and try again.");
    } finally {
      clearTimeout(timer);
    }
  };

  return attempt(1);
};

export const pickAndUploadImage = async (
  type: DocumentType,
  source: "library" | "camera" = "library",
): Promise<UploadResult | null> => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary not configured. Check EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET",
    );
  }

  const result =
    source === "camera"
      ? await pickFromCamera(type !== "vehicle_photo")
      : await pickImage(type !== "vehicle_photo");

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];
  validateAsset(asset);

  const uploadUrl = `https://api.cloudinary.com/v1_2/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append("file", {
    uri: asset.uri,
    type: asset.mimeType ?? "image/jpeg",
    name: asset.fileName ?? "upload.jpg",
  } as unknown as Blob);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", `celer/drivers/${type}`);

  const response = await uploadWithRetry(uploadUrl, formData);

  const responseText = await response.text();

  if (!response.ok) {
    let message = "Upload failed";
    try {
      const parsed = JSON.parse(responseText);
      const error = parsed.error;
      if (error?.message?.includes("File is too large")) {
        message = "Image is too large. Please choose a photo under 10 MB.";
      } else {
        message = error?.message || message;
      }
    } catch {
      message = `Upload failed (HTTP ${response.status}). Check your Cloudinary cloud name and upload preset.`;
    }
    throw new Error(message);
  }

  let data: { secure_url?: string };
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error("Invalid response from Cloudinary");
  }

  if (!data.secure_url) {
    throw new Error("Upload succeeded but no URL returned");
  }

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
