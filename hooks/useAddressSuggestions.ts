import { useState, useEffect, useRef, useCallback } from "react";
import { DADATA_API_URL, DADATA_API_KEY } from "@/constants/api";

interface DaDataSuggestion {
  value: string;
  unrestricted_value: string;
  data: {
    country: string;
    region: string;
    city: string;
    street: string;
    house: string;
    flat: string;
    postal_code: string;
  };
}

export function useAddressSuggestions() {
  const [suggestions, setSuggestions] = useState<DaDataSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!DADATA_API_KEY) {
      return;
    }
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const res = await fetch(DADATA_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Token ${DADATA_API_KEY}`,
        },
        body: JSON.stringify({ query, count: 5 }),
        signal: abortRef.current.signal,
      });
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setSuggestions([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(
    (query: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fetchSuggestions(query), 300);
    },
    [fetchSuggestions]
  );

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  return { suggestions, loading, debouncedFetch, clearSuggestions };
}
