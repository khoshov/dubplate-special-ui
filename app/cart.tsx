import type { Product } from "@/components/AddToCartButton";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { API_HOST } from "@/constants/api";
import { useCart } from "@/hooks/CartContext";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import Animated, { FadeInLeft, FadeInRight, SlideInUp } from 'react-native-reanimated';
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { ScrollView, View, Pressable as RNPressable } from 'react-native';
import { Image } from "@/components/ui/image";
import { Input, InputField } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import { useAddressSuggestions } from "@/hooks/useAddressSuggestions";
import { useAuth } from "@/hooks/AuthContext";

const ORDER_API = `${API_HOST}/api/v1/orders/orders/`;

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
  if (newDigits.length > prevDigits.length) {
    return formatDigits(newDigits);
  }
  if (newDigits.length < prevDigits.length) {
    return formatDigits(newDigits);
  }
  // Same digit count — user backspaced a formatting char, remove last digit
  return formatDigits(prevDigits.slice(0, -1));
};

export default function CartPage() {
  const { items, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const total = items.reduce((sum: number, item: Product) => sum + (item.price || 0), 0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { suggestions, loading: addrLoading, debouncedFetch, clearSuggestions } = useAddressSuggestions();
  const { user, isAuthenticated } = useAuth();

  // Auto-fill form from auth context
  useEffect(() => {
    if (isAuthenticated && user) {
      setForm(f => ({
        ...f,
        name: f.name || (user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : ""),
        phone: f.phone || formatDigits(user.phone_number?.replace(/\D/g, "") || ""),
        address: f.address || user.address || "",
      }));
    }
  }, [isAuthenticated, user]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(ORDER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          address: form.address,
          items: items.map((item) => ({ id: item.id, quantity: 1 })),
        }),
      });
      if (!res.ok) throw new Error("Ошибка оформления заказа");
      setSuccess("Заказ успешно оформлен! Мы свяжемся с вами.");
      clearCart();
      setShowForm(false);
      setForm({ name: "", phone: "", address: "" });
    } catch (err: any) {
      setError(err.message || "Ошибка оформления заказа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-zinc-50"
      contentInsetAdjustmentBehavior="automatic"
    >
      <Box className="w-full max-w-7xl mx-auto p-4 md:p-8">
        {/* Заголовок */}
        <Animated.View entering={SlideInUp.springify()}>
          <Text size="3xl" bold className="text-zinc-900 mb-8 text-center tracking-tight">
            Корзина
          </Text>
        </Animated.View>

        {items.length === 0 ? (
          <Animated.View entering={FadeInLeft.springify()}>
            <Box className="flex flex-col items-center justify-center mt-16 bg-white rounded-2xl p-12 border border-zinc-200">
              <Text className="text-5xl mb-4">🛒</Text>
              <Text size="xl" className="text-zinc-500 mb-6 text-center">Ваша корзина пуста</Text>
              <Button 
                onPress={() => router.push("/")} 
                className="bg-zinc-900 px-8 py-3 rounded-md"
              >
                <Text className="text-white font-bold text-base">На главную</Text>
              </Button>
            </Box>
          </Animated.View>
        ) : (
          <>
            {/* Мобильная версия - 1 колонка */}
            <Box className="block lg:hidden">
            <Animated.View entering={FadeInLeft.springify()}>
              <VStack space="md" className="mb-6">
                {items.map((item: Product, index: number) => (
                  <Animated.View key={item.id} entering={FadeInLeft.delay(index * 100).springify()}>
                    <Box className="bg-white rounded-md p-4 border border-zinc-200">
                      <HStack space="md" className="items-center">
                        <Box className="w-16 h-16 rounded-md overflow-hidden bg-zinc-100">
                          <Image source={{uri: item.cover_image}} className="w-full h-full object-cover" />
                        </Box>
                        <Box className="flex-1">
                          <Text bold className="text-zinc-900">{item.title}</Text>
                          <Text className="text-sm text-zinc-500">{item.artists?.map((a: any) => a.name).join(", ")}</Text>
                          <Text className="text-zinc-900 font-bold mt-1">{item.price ? `${item.price}₽` : "—"}</Text>
                        </Box>
                        <Button 
                          variant="outline" 
                          action="negative"
                          onPress={() => removeFromCart(item.id)}
                          className="rounded-md px-3 py-2"
                        >
                          <Text className="text-zinc-400 font-medium">✕</Text>
                        </Button>
                      </HStack>
                    </Box>
                  </Animated.View>
                ))}
              </VStack>
            </Animated.View>
          </Box>

          {/* Десктоп версия - 2 колонки */}
          <Box className="hidden lg:block">
            <HStack space="xl" className="items-start">
              {/* Левая колонка - Список товаров */}
              <Animated.View entering={FadeInLeft.delay(200).springify()} className="flex-1">
                <Box className="bg-white rounded-md p-6 border border-zinc-200">
                  <Text size="xl" bold className="mb-6 text-zinc-900">Товары в корзине</Text>
                  <VStack space="lg">
                    {items.map((item: Product, index: number) => (
                      <Animated.View key={item.id} entering={FadeInLeft.delay(300 + index * 100).springify()}>
                        <Box className="flex flex-row items-center p-4 bg-zinc-50 rounded-md border border-zinc-100">
                          <Box className="w-20 h-20 rounded-md overflow-hidden bg-zinc-100">
                            <Image source={{uri: item.cover_image}} className="w-full h-full object-cover" />
                          </Box>
                          <Box className="flex-1 ml-4">
                            <Text bold className="text-lg text-zinc-900">{item.title}</Text>
                            <Text className="text-zinc-500">{item.artists?.map((a: any) => a.name).join(", ")}</Text>
                            <Text className="text-zinc-900 font-bold text-lg mt-1">{item.price ? `${item.price}₽` : "—"}</Text>
                          </Box>
                          <Button 
                            variant="outline" 
                            action="negative"
                            onPress={() => removeFromCart(item.id)}
                            className="rounded-md px-4 py-2"
                          >
                            <Text className="text-zinc-400 font-medium">Удалить</Text>
                          </Button>
                        </Box>
                      </Animated.View>
                    ))}
                  </VStack>
                </Box>
              </Animated.View>

              {/* Правая колонка - Оформление */}
              <Animated.View entering={FadeInRight.delay(400).springify()} className="w-96">
                <Box className="sticky top-8">
                  {/* Итого */}
                  <Box className="bg-white rounded-md p-6 mb-6 border border-zinc-200">
                    <Text size="xl" bold className="mb-4 text-zinc-900">Итого</Text>
                    <HStack className="items-center justify-between">
                      <Text size="lg" className="text-zinc-600">Общая сумма:</Text>
                      <Text size="2xl" bold className="text-zinc-900">{total}₽</Text>
                    </HStack>
                  </Box>

                  {/* Кнопки управления */}
                  <VStack space="md" className="mb-6">
                    <Button 
                      action="negative" 
                      variant="outline" 
                      onPress={clearCart} 
                      className="rounded-md py-3"
                    >
                      <Text className="font-bold text-zinc-600">Очистить корзину</Text>
                    </Button>
                    <Button 
                      action="positive" 
                      onPress={() => setShowForm(f => !f)} 
                      className="bg-zinc-900 rounded-md py-3"
                    >
                      <Text className="text-white font-bold">
                        {showForm ? "Скрыть форму" : "Оформить заказ"}
                      </Text>
                    </Button>
                  </VStack>
                  {/* Форма заказа */}
                  {showForm && (
                    <Animated.View entering={FadeInRight.springify()}>
                      <Box className="bg-white rounded-md p-6 border border-zinc-200">
                        <Text size="xl" bold className="mb-4 text-zinc-900">Оформление заказа</Text>
                        <VStack space="lg">
                          <Box>
                            <Text className="font-medium mb-2 text-zinc-600">Имя</Text>
                            <Input className="bg-zinc-50 border-zinc-200">
                              <InputField
                                value={form.name}
                                onChangeText={(text) => setForm(f => ({ ...f, name: text }))}
                                placeholder="Ваше имя"
                              />
                            </Input>
                          </Box>
                          <Box>
                            <Text className="font-medium mb-2 text-zinc-600">Телефон</Text>
                            <Input className="bg-zinc-50 border-zinc-200">
                              <InputField
                                value={form.phone}
                                onChangeText={(text) => setForm(f => ({ ...f, phone: formatPhone(text, f.phone) }))}
                                placeholder="+7 (999) 123-45-67"
                                keyboardType="phone-pad"
                              />
                            </Input>
                          </Box>
                          <Box>
                            <Text className="font-medium mb-2 text-zinc-600">Адрес</Text>
                            <Input className="bg-zinc-50 border-zinc-200">
                              <InputField
                                value={form.address}
                                onChangeText={(text) => {
                                  setForm(f => ({ ...f, address: text }));
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
                                      setForm(f => ({ ...f, address: item.value }));
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
                              <Text className="text-red-600">{error}</Text>
                            </Box>
                          )}
                          {success && (
                            <Box className="bg-zinc-100 border border-zinc-200 rounded-md p-3">
                              <Text className="text-zinc-700">{success}</Text>
                            </Box>
                          )}
                          <Button
                            onPress={handleOrder}
                            disabled={loading || !form.name || !form.phone || !form.address}
                            className="bg-zinc-900 rounded-md py-4 disabled:opacity-50"
                          >
                            <Text className="text-white font-bold text-base">
                              {loading ? "Отправка..." : "Отправить заказ"}
                            </Text>
                          </Button>
                        </VStack>
                      </Box>
                    </Animated.View>
                  )}
                </Box>
              </Animated.View>
            </HStack>
          </Box>

          {/* Мобильная версия - дополнительные элементы */}
          <Box className="block lg:hidden">
            <Animated.View entering={FadeInLeft.delay(600).springify()}>
              {/* Итого мобильная версия */}
              <Box className="bg-white rounded-md p-6 mb-6 border border-zinc-200">
                <HStack className="items-center justify-between">
                  <Text size="lg" className="text-zinc-600">Итого:</Text>
                  <Text size="xl" bold className="text-zinc-900">{total}₽</Text>
                </HStack>
              </Box>

              {/* Кнопки мобильная версия */}
              <VStack space="md" className="mb-6">
                <Button 
                  action="negative" 
                  variant="outline" 
                  onPress={clearCart} 
                  className="rounded-md py-3"
                >
                  <Text className="font-bold text-zinc-600">Очистить корзину</Text>
                </Button>
                <Button 
                  action="positive" 
                  onPress={() => setShowForm(f => !f)} 
                  className="bg-zinc-900 rounded-md py-3"
                >
                  <Text className="text-white font-bold">
                    {showForm ? "Скрыть форму" : "Оформить заказ"}
                  </Text>
                </Button>
              </VStack>

              {/* Форма мобильная версия */}
              {showForm && (
                <Animated.View entering={FadeInLeft.springify()}>
                  <Box className="bg-white rounded-md p-6 border border-zinc-200">
                    <Text size="lg" bold className="mb-4 text-zinc-900 text-center">Оформление заказа</Text>
                    <VStack space="lg">
                      <Box>
                        <Text className="font-medium mb-2 text-zinc-600">Имя</Text>
                        <Input className="bg-zinc-50 border-zinc-200">
                          <InputField
                            value={form.name}
                            onChangeText={(text) => setForm(f => ({ ...f, name: text }))}
                            placeholder="Ваше имя"
                          />
                        </Input>
                      </Box>
                      <Box>
                        <Text className="font-medium mb-2 text-zinc-600">Телефон</Text>
                        <Input className="bg-zinc-50 border-zinc-200">
                          <InputField
                            value={form.phone}
                            onChangeText={(text) => setForm(f => ({ ...f, phone: formatPhone(text, f.phone) }))}
                            placeholder="+7 (999) 123-45-67"
                            keyboardType="phone-pad"
                          />
                        </Input>
                      </Box>
                      <Box>
                        <Text className="font-medium mb-2 text-zinc-600">Адрес</Text>
                        <Input className="bg-zinc-50 border-zinc-200">
                          <InputField
                            value={form.address}
                            onChangeText={(text) => {
                              setForm(f => ({ ...f, address: text }));
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
                                  setForm(f => ({ ...f, address: item.value }));
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
                          <Text className="text-red-600 text-center">{error}</Text>
                        </Box>
                      )}
                      {success && (
                        <Box className="bg-zinc-100 border border-zinc-200 rounded-md p-3">
                          <Text className="text-zinc-700 text-center">{success}</Text>
                        </Box>
                      )}
                      <Button
                        onPress={handleOrder}
                        disabled={loading || !form.name || !form.phone || !form.address}
                        className="bg-zinc-900 rounded-md py-4 disabled:opacity-50"
                      >
                        <Text className="text-white font-bold text-base">
                          {loading ? "Отправка..." : "Отправить заказ"}
                        </Text>
                      </Button>
                    </VStack>
                  </Box>
                </Animated.View>
              )}
            </Animated.View>
          </Box>
          </>
        )}
      </Box>
    </ScrollView>
  );
} 
