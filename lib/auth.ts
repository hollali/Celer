import * as Linking from "expo-linking";

import { fetchAPI } from "./fetch";

interface OAuthFlowResult {
  createdSessionId?: string;
  setActive?: (config: { session: string }) => Promise<void>;
  signUp?: {
    createdUserId?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    emailAddress?: string | null;
  };
}

export const googleOAuth = async (
  startOAuthFlow: (config?: { redirectUrl?: string }) => Promise<OAuthFlowResult>,
  getToken?: () => Promise<string | null>,
) => {
  try {
    const { createdSessionId, setActive, signUp } = await startOAuthFlow({
      redirectUrl: Linking.createURL("/(root)/(tabs)/home"),
    });

    if (createdSessionId) {
      if (setActive) {
        await setActive({ session: createdSessionId });

        if (signUp?.createdUserId) {
          const token = (await getToken?.()) ?? null;
          await fetchAPI(
            "/(api)/user",
            {
              method: "POST",
              body: JSON.stringify({
                name: `${signUp.firstName} ${signUp.lastName}`,
                email: signUp.emailAddress,
              }),
            },
            token,
          );
        }

        return {
          success: true,
          code: "success",
          message: "You have successfully signed in with Google",
        };
      }
    }

    return {
      success: false,
      message: "An error occurred while signing in with Google",
    };
  } catch (err: unknown) {
    const errorObj = err as Record<string, unknown>;
    const errors = (errorObj?.errors as Record<string, string>[] | undefined) ?? [];
    const firstError = errors[0];
    const errorCode = firstError?.code ?? (errorObj?.code as string);
    const rawMessage =
      firstError?.longMessage ?? firstError?.message ?? (errorObj?.message as string);
    const normalizedMessage =
      typeof rawMessage === "string" ? rawMessage.replace(/^e:/i, "").trim() : undefined;
    const alreadySignedIn =
      errorCode === "session_exists" ||
      (typeof normalizedMessage === "string" &&
        normalizedMessage.toLowerCase().includes("already signed in"));

    if (alreadySignedIn) {
      return {
        success: true,
        code: "session_exists",
        message: "You're already signed in.",
      };
    }

    return {
      success: false,
      code: errorCode,
      message: normalizedMessage ?? "An error occurred while signing in with Google",
    };
  }
};
