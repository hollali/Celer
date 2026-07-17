import { useState, useEffect, useCallback, useRef } from "react";

let storedToken: string | null = null;

export function setAuthToken(token: string | null) {
  storedToken = token;
}

const FETCH_MAX_RETRIES = 2;
const FETCH_TIMEOUT_MS = 15_000;
const FETCH_RETRY_DELAY_MS = 1_000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export const fetchAPI = async (
  url: string,
  options?: RequestInit,
  tokenOverride?: string | null,
) => {
  const isFormData = options?.body instanceof FormData;

  const headers: Record<string, string> = {
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const token = tokenOverride !== undefined ? tokenOverride : storedToken;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= FETCH_MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(url, { ...options, headers }, FETCH_TIMEOUT_MS);
      if (!response.ok) {
        let detail = "";
        try {
          const body = await response.json();
          detail = body.error || "";
        } catch {}
        throw new Error(detail || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      lastError = err as Error;
      const isAbort = err instanceof Error && err.name === "AbortError";
      const isNetwork =
        err instanceof Error &&
        (err.message.includes("Network request failed") ||
          err.message.includes("fetch failed") ||
          err.message.includes("Failed to fetch"));
      const canRetry = (isAbort || isNetwork) && attempt < FETCH_MAX_RETRIES;
      if (!canRetry) break;
      await new Promise((r) => setTimeout(r, FETCH_RETRY_DELAY_MS * (attempt + 1)));
    }
  }
  throw lastError;
};

export const useFetch = <T>(
  url: string,
  getToken?: () => Promise<string | null>,
  enabled = true,
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        let token: string | null = null;
        if (getTokenRef.current) {
          token = await getTokenRef.current();
        }
        if (!token) {
          if (!signal?.aborted) {
            setError("Not authenticated");
            setLoading(false);
          }
          return;
        }
        const result = await fetchAPI(url, undefined, token);
        if (!signal?.aborted) {
          setData(result.data);
        }
      } catch (err) {
        if (!signal?.aborted) {
          setError((err as Error).message);
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [url],
  );

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData, enabled]);

  const refetch = useCallback(() => fetchData(), [fetchData]);

  return { data, loading, error, refetch };
};
