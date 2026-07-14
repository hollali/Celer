import { useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { setAuthToken } from "@/lib/fetch";

export function TokenSync() {
  const { getToken } = useAuth();

  useEffect(() => {
    let active = true;

    const syncToken = async () => {
      try {
        const token = await getToken();
        if (active) setAuthToken(token);
      } catch {
        if (active) setAuthToken(null);
      }
    };

    syncToken();
    const interval = setInterval(syncToken, 4 * 60 * 1000);

    return () => {
      active = false;
      clearInterval(interval);
      setAuthToken(null);
    };
  }, [getToken]);

  return null;
}
