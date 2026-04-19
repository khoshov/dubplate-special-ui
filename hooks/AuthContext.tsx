import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_HOST } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

interface User {
  id?: number;
  phone_number?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  sendCode: (phone: string) => Promise<void>;
  verifyCode: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  sendCode: async () => {},
  verifyCode: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  fetchProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const saveUser = async (u: User) => {
    setUser(u);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
  };

  useEffect(() => {
    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const savedUser = await AsyncStorage.getItem(USER_KEY);
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sendCode = useCallback(async (phone: string) => {
    const res = await fetch(`${API_HOST}/api/v1/accounts/sms-auth/send_code/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number: phone }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || data.phone_number?.[0] || "Ошибка отправки SMS");
    }
  }, []);

  const verifyCode = useCallback(async (phone: string, code: string) => {
    const res = await fetch(`${API_HOST}/api/v1/accounts/sms-auth/auth/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number: phone, code }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || data.code?.[0] || data.non_field_errors?.[0] || "Ошибка верификации");
    }
    const data = await res.json();
    const newToken = data.token || data.key || data.auth_token;
    const newUser: User = {
      id: data.id,
      phone_number: data.phone_number || phone,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      address: data.address,
      city: data.city,
      country: data.country,
      postal_code: data.postal_code,
    };
    if (newToken) {
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
    }
    await saveUser(newUser);
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_HOST}/api/v1/accounts/me/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        await saveUser({
          ...user,
          id: data.id || data.pk,
          phone_number: data.phone_number || data.phone || user?.phone_number,
          email: data.email || user?.email,
          first_name: data.first_name || user?.first_name,
          last_name: data.last_name || user?.last_name,
          address: data.address || user?.address,
          city: data.city || user?.city,
          country: data.country || user?.country,
          postal_code: data.postal_code || user?.postal_code,
        });
      }
    } catch {
      // ignore
    }
  }, [token, user]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!token || !user?.id) throw new Error("Не авторизован");
    const res = await fetch(`${API_HOST}/api/v1/accounts/profile/${user.id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.non_field_errors?.[0] || "Ошибка обновления профиля");
    }
    const updated = await res.json();
    await saveUser({
      ...user,
      first_name: updated.first_name ?? user.first_name,
      last_name: updated.last_name ?? user.last_name,
      phone: updated.phone ?? user.phone_number,
      address: updated.address ?? user.address,
      city: updated.city ?? user.city,
      country: updated.country ?? user.country,
      postal_code: updated.postal_code ?? user.postal_code,
    });
  }, [token, user]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_HOST}/api/v1/accounts/auth/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
      });
    } catch {
      // ignore
    }
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        sendCode,
        verifyCode,
        logout,
        updateProfile,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
