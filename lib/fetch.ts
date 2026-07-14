import { useState, useEffect, useCallback, useRef } from "react";

let storedToken: string | null = null;

export function setAuthToken(token: string | null) {
  storedToken = token;
}

export const fetchAPI = async (url: string, options?: RequestInit, tokenOverride?: string | null) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> || {}),
  };

  const token = tokenOverride !== undefined ? tokenOverride : storedToken;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

export const useFetch = <T>(url: string, getToken?: () => Promise<string | null>, enabled = true) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const fetchData = useCallback(async (signal?: AbortSignal) => {
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
  }, [url]);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData, enabled]);

  const refetch = useCallback(() => fetchData(), [fetchData]);

  return { data, loading, error, refetch };
};
