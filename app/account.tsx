import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ScrollView, Pressable as RNPressable } from 'react-native';
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Input, InputField } from "@/components/ui/input";
import { useAuth } from "@/hooks/AuthContext";
import { useAddressSuggestions } from "@/hooks/useAddressSuggestions";

const formatDigits = (digits: string): string => {
  if (digits.length === 0) return "";
  const local = digits.startsWith("7") || digits.startsWith("8") ? digits.slice(1) : digits;
  if (local.length === 0) return "+7";
  let formatted = "+7";
  if (local.length > 0) formatted += " (" + local.slice(0, 3);
  if (local.length >= 3) formatted += ") " + local.slice(3, 6);
  if (local.length >= 6) formatted += "-" + local.slice(6, 8);
  if (local.length >= 8) formatted += "-" + local.slice(8, 10);
  return formatted;
};

const formatPhone = (text: string, prev: string): string => {
  const newDigits = text.replace(/\D/g, "");
  const prevDigits = prev.replace(/\D/g, "");
  if (newDigits.length > prevDigits.length) return formatDigits(newDigits);
  if (newDigits.length < prevDigits.length) return formatDigits(newDigits);
  return formatDigits(prevDigits.slice(0, -1));
};

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, sendCode, verifyCode, logout, updateProfile, fetchProfile } = useAuth();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Profile editing
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ first_name: "", last_name: "", address: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const { suggestions, debouncedFetch, clearSuggestions } = useAddressSuggestions();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        address: user.address || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendCode = async () => {
    setError("");
    setLoading(true);
    try {
      await sendCode(phone);
      setStep("code");
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message || "Ошибка отправки SMS");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    setLoading(true);
    try {
      await verifyCode(phone, code);
    } catch (err: any) {
      setError(err.message || "Неверный код");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    setProfileSuccess("");
    setError("");
    try {
      await updateProfile({
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        address: profileForm.address,
      });
      setProfileSuccess("Профиль обновлён");
      setEditing(false);
    } catch (err: any) {
      setError(err.message || "Ошибка сохранения");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setStep("phone");
    setPhone("");
    setCode("");
    setEditing(false);
  };

  if (isAuthenticated && user) {
    return (
      <ScrollView className="flex-1 bg-zinc-50" contentInsetAdjustmentBehavior="automatic">
        <Box className="w-full max-w-md mx-auto p-4 md:p-8 mt-8">
          <Text size="2xl" bold className="text-zinc-900 mb-6 text-center tracking-tight">
            Личный кабинет
          </Text>

          <Box className="bg-white rounded-md p-6 border border-zinc-200">
            <VStack space="lg">
              {/* Avatar */}
              <Box className="flex items-center mb-2">
                <Box className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-3">
                  <Text className="text-white text-2xl font-bold">
                    {(user.first_name?.[0] || user.phone_number?.[3] || "?").toUpperCase()}
                  </Text>
                </Box>
                <Text size="lg" bold className="text-zinc-900">
                  {user.first_name
                    ? `${user.first_name} ${user.last_name || ""}`.trim()
                    : user.phone_number}
                </Text>
                {user.email && (
                  <Text className="text-zinc-500 text-sm mt-1">{user.email}</Text>
                )}
              </Box>

              <Box className="border-t border-zinc-100 pt-4">
                <Text className="text-zinc-500 text-sm">Телефон</Text>
                <Text className="text-zinc-900 font-medium">{user.phone_number}</Text>
              </Box>

              {editing ? (
                <>
                  <Box>
                    <Text className="font-medium mb-2 text-zinc-600">Имя</Text>
                    <Input className="bg-zinc-50 border-zinc-200">
                      <InputField
                        value={profileForm.first_name}
                        onChangeText={(text) => setProfileForm(f => ({ ...f, first_name: text }))}
                        placeholder="Имя"
                      />
                    </Input>
                  </Box>
                  <Box>
                    <Text className="font-medium mb-2 text-zinc-600">Фамилия</Text>
                    <Input className="bg-zinc-50 border-zinc-200">
                      <InputField
                        value={profileForm.last_name}
                        onChangeText={(text) => setProfileForm(f => ({ ...f, last_name: text }))}
                        placeholder="Фамилия"
                      />
                    </Input>
                  </Box>
                  <Box>
                    <Text className="font-medium mb-2 text-zinc-600">Адрес доставки</Text>
                    <Input className="bg-zinc-50 border-zinc-200">
                      <InputField
                        value={profileForm.address}
                        onChangeText={(text) => {
                          setProfileForm(f => ({ ...f, address: text }));
                          debouncedFetch(text);
                        }}
                        placeholder="Город, улица, дом, квартира"
                      />
                    </Input>
                    {suggestions.length > 0 && (
                      <Box className="bg-white border border-zinc-200 rounded-md mt-1 overflow-hidden">
                        {suggestions.map((item: any, idx: number) => (
                          <RNPressable
                            key={idx}
                            onPress={() => {
                              setProfileForm(f => ({ ...f, address: item.value }));
                              clearSuggestions();
                            }}
                            className="px-3 py-2.5 border-b border-zinc-100 active:bg-zinc-50"
                          >
                            <Text className="text-zinc-700 text-sm" numberOfLines={1}>{item.value}</Text>
                          </RNPressable>
                        ))}
                      </Box>
                    )}
                  </Box>
                  {error && (
                    <Box className="bg-red-50 border border-red-200 rounded-md p-3">
                      <Text className="text-red-600 text-sm">{error}</Text>
                    </Box>
                  )}
                  {profileSuccess && (
                    <Box className="bg-zinc-100 border border-zinc-200 rounded-md p-3">
                      <Text className="text-zinc-700 text-sm">{profileSuccess}</Text>
                    </Box>
                  )}
                  <Button
                    onPress={handleSaveProfile}
                    disabled={profileLoading}
                    className="bg-zinc-900 rounded-md py-3 disabled:opacity-50"
                  >
                    <Text className="text-white font-bold">
                      {profileLoading ? "Сохранение..." : "Сохранить"}
                    </Text>
                  </Button>
                  <Button
                    variant="outline"
                    onPress={() => {
                      setEditing(false);
                      setError("");
                      setProfileSuccess("");
                      setProfileForm({
                        first_name: user.first_name || "",
                        last_name: user.last_name || "",
                        address: user.address || "",
                      });
                    }}
                    className="rounded-md py-3"
                  >
                    <Text className="text-zinc-600 font-bold">Отмена</Text>
                  </Button>
                </>
              ) : (
                <>
                  <Box className="border-t border-zinc-100 pt-4">
                    <Text className="text-zinc-500 text-sm">Имя</Text>
                    <Text className="text-zinc-900 font-medium">
                      {user.first_name
                        ? `${user.first_name} ${user.last_name || ""}`.trim()
                        : "Не указано"}
                    </Text>
                  </Box>
                  <Box className="border-t border-zinc-100 pt-4">
                    <Text className="text-zinc-500 text-sm">Адрес доставки</Text>
                    <Text className="text-zinc-900 font-medium">
                      {user.address || "Не указан"}
                    </Text>
                  </Box>
                  <Button
                    onPress={() => setEditing(true)}
                    className="bg-zinc-900 rounded-md py-3"
                  >
                    <Text className="text-white font-bold">Редактировать</Text>
                  </Button>
                </>
              )}

              <Button
                onPress={handleLogout}
                variant="outline"
                className="rounded-md py-3 mt-2"
              >
                <Text className="text-zinc-600 font-bold">Выйти</Text>
              </Button>
            </VStack>
          </Box>

          <Button
            variant="link"
            onPress={() => router.push("/")}
            className="self-center mt-4"
          >
            <Text className="text-zinc-400 text-sm">← На главную</Text>
          </Button>
        </Box>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-zinc-50" contentInsetAdjustmentBehavior="automatic">
      <Box className="w-full max-w-md mx-auto p-4 md:p-8 mt-8">
        <Text size="2xl" bold className="text-zinc-900 mb-6 text-center tracking-tight">
          {step === "phone" ? "Вход" : "Подтверждение"}
        </Text>

        <Box className="bg-white rounded-md p-6 border border-zinc-200">
          <VStack space="lg">
            {step === "phone" ? (
              <>
                <Text className="text-zinc-500 text-center text-sm mb-2">
                  Введите номер телефона — мы отправим код подтверждения
                </Text>
                <Box>
                  <Text className="font-medium mb-2 text-zinc-600">Телефон</Text>
                  <Input className="bg-zinc-50 border-zinc-200">
                    <InputField
                      value={phone}
                      onChangeText={(text) => setPhone(formatPhone(text, phone))}
                      placeholder="+7 (999) 123-45-67"
                      keyboardType="phone-pad"
                    />
                  </Input>
                </Box>
                {error && (
                  <Box className="bg-red-50 border border-red-200 rounded-md p-3">
                    <Text className="text-red-600 text-center text-sm">{error}</Text>
                  </Box>
                )}
                <Button
                  onPress={handleSendCode}
                  disabled={loading || phone.replace(/\D/g, "").length < 11}
                  className="bg-zinc-900 rounded-md py-3 disabled:opacity-50"
                >
                  <Text className="text-white font-bold">
                    {loading ? "Отправка..." : "Получить код"}
                  </Text>
                </Button>
              </>
            ) : (
              <>
                <Text className="text-zinc-500 text-center text-sm mb-2">
                  Код отправлен на {phone}
                </Text>
                <Box>
                  <Text className="font-medium mb-2 text-zinc-600">Код из SMS</Text>
                  <Input className="bg-zinc-50 border-zinc-200">
                    <InputField
                      value={code}
                      onChangeText={setCode}
                      placeholder="123456"
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </Input>
                </Box>
                {error && (
                  <Box className="bg-red-50 border border-red-200 rounded-md p-3">
                    <Text className="text-red-600 text-center text-sm">{error}</Text>
                  </Box>
                )}
                <Button
                  onPress={handleVerifyCode}
                  disabled={loading || code.length < 6}
                  className="bg-zinc-900 rounded-md py-3 disabled:opacity-50"
                >
                  <Text className="text-white font-bold">
                    {loading ? "Проверка..." : "Войти"}
                  </Text>
                </Button>
                <Button
                  variant="link"
                  onPress={resendTimer <= 0 ? handleSendCode : undefined}
                  disabled={resendTimer > 0}
                  className="self-center"
                >
                  <Text className={`text-sm ${resendTimer > 0 ? "text-zinc-300" : "text-zinc-500"}`}>
                    {resendTimer > 0 ? `Повторить через ${resendTimer}с` : "Отправить код повторно"}
                  </Text>
                </Button>
                <Button
                  variant="link"
                  onPress={() => { setStep("phone"); setCode(""); setError(""); }}
                  className="self-center"
                >
                  <Text className="text-zinc-500 text-sm">Изменить номер</Text>
                </Button>
              </>
            )}
          </VStack>
        </Box>

        <Button
          variant="link"
          onPress={() => router.push("/")}
          className="self-center mt-4"
        >
          <Text className="text-zinc-400 text-sm">← На главную</Text>
        </Button>
      </Box>
    </ScrollView>
  );
}
