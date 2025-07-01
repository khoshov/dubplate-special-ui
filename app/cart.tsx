import type { Product } from "@/components/AddToCartButton";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { API_HOST } from "@/constants/api";
import { useCart } from "@/hooks/CartContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import Animated, { FadeInLeft, FadeInRight, SlideInUp } from 'react-native-reanimated';
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { ScrollView, View } from 'react-native';
import { Image } from "@/components/ui/image";
import { Input, InputField } from "@/components/ui/input";

const ORDER_API = `${API_HOST}/api/v1/orders/`;

export default function CartPage() {
  const { items, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const total = items.reduce((sum: number, item: Product) => sum + (item.price || 0), 0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

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
      className="flex-1 bg-gradient-to-b from-gray-50 to-white"
      contentInsetAdjustmentBehavior="automatic"
    >
      <Box className="w-full max-w-7xl mx-auto p-4 md:p-8">
        {/* Заголовок */}
        <Animated.View entering={SlideInUp.springify()}>
          <Text size="3xl" bold className="gradient-text-purple mb-8 text-center">
            🛍️ Корзина
          </Text>
        </Animated.View>

        {items.length === 0 ? (
          <Animated.View entering={FadeInLeft.springify()}>
            <Box className="flex flex-col items-center justify-center mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12 border border-blue-100">
              <Text className="text-6xl mb-4">🛍️</Text>
              <Text size="xl" className="text-gray-600 mb-6 text-center">Ваша корзина пуста</Text>
              <Button 
                onPress={() => router.push("/")} 
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-xl"
              >
                <Text className="text-white font-bold text-lg">🏠 На главную</Text>
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
                    <Box className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                      <HStack space="md" className="items-center">
                        <Box className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <Image source={{uri: item.cover_image}} className="w-full h-full object-cover" />
                        </Box>
                        <Box className="flex-1">
                          <Text bold className="text-gray-800">{item.title}</Text>
                          <Text className="text-sm text-gray-500">{item.artists?.map((a: any) => a.name).join(", ")}</Text>
                          <Text className="text-emerald-600 font-bold mt-1">{item.price ? `${item.price}₽` : "—"}</Text>
                        </Box>
                        <Button 
                          variant="outline" 
                          action="negative"
                          onPress={() => removeFromCart(item.id)}
                          className="rounded-lg px-3 py-2"
                        >
                          <Text className="text-red-600 font-medium">❌</Text>
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
                <Box className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <Text size="xl" bold className="mb-6 text-gray-800">📋 Товары в корзине</Text>
                  <VStack space="lg">
                    {items.map((item: Product, index: number) => (
                      <Animated.View key={item.id} entering={FadeInLeft.delay(300 + index * 100).springify()}>
                        <Box className="flex flex-row items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-200">
                          <Box className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shadow-md">
                            <Image source={{uri: item.cover_image}} className="w-full h-full object-cover" />
                          </Box>
                          <Box className="flex-1 ml-4">
                            <Text bold className="text-lg text-gray-800">{item.title}</Text>
                            <Text className="text-gray-600">{item.artists?.map((a: any) => a.name).join(", ")}</Text>
                            <Text className="text-emerald-600 font-bold text-lg mt-1">{item.price ? `${item.price}₽` : "—"}</Text>
                          </Box>
                          <Button 
                            variant="outline" 
                            action="negative"
                            onPress={() => removeFromCart(item.id)}
                            className="rounded-xl px-4 py-2 hover:bg-red-50"
                          >
                            <Text className="text-red-600 font-medium">❌ Удалить</Text>
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
                  <Box className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 mb-6 border border-emerald-100">
                    <Text size="xl" bold className="mb-4 text-gray-800">📊 Итого</Text>
                    <HStack className="items-center justify-between">
                      <Text size="lg" className="text-gray-700">Общая сумма:</Text>
                      <Text size="2xl" bold className="text-emerald-600">{total}₽</Text>
                    </HStack>
                  </Box>

                  {/* Кнопки управления */}
                  <VStack space="md" className="mb-6">
                    <Button 
                      action="negative" 
                      variant="outline" 
                      onPress={clearCart} 
                      className="rounded-xl py-3"
                    >
                      <Text className="font-bold">🗑️ Очистить корзину</Text>
                    </Button>
                    <Button 
                      action="positive" 
                      onPress={() => setShowForm(f => !f)} 
                      className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl py-3"
                    >
                      <Text className="text-white font-bold">
                        {showForm ? "🔼 Скрыть форму" : "📝 Оформить заказ"}
                      </Text>
                    </Button>
                  </VStack>
                  {/* Форма заказа */}
                  {showForm && (
                    <Animated.View entering={FadeInRight.springify()}>
                      <Box className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                        <Text size="xl" bold className="mb-4 text-gray-800">📝 Оформление заказа</Text>
                        <VStack space="lg">
                          <Box>
                            <Text className="font-medium mb-2 text-gray-700">👤 Имя</Text>
                            <Input className="bg-white border-gray-200">
                              <InputField
                                value={form.name}
                                onChangeText={(text) => setForm(f => ({ ...f, name: text }))}
                                placeholder="Ваше имя"
                              />
                            </Input>
                          </Box>
                          <Box>
                            <Text className="font-medium mb-2 text-gray-700">📞 Телефон</Text>
                            <Input className="bg-white border-gray-200">
                              <InputField
                                value={form.phone}
                                onChangeText={(text) => setForm(f => ({ ...f, phone: text }))}
                                placeholder="+7 (999) 123-45-67"
                                keyboardType="phone-pad"
                              />
                            </Input>
                          </Box>
                          <Box>
                            <Text className="font-medium mb-2 text-gray-700">🏠 Адрес</Text>
                            <Input className="bg-white border-gray-200">
                              <InputField
                                value={form.address}
                                onChangeText={(text) => setForm(f => ({ ...f, address: text }))}
                                placeholder="Город, улица, дом, квартира"
                              />
                            </Input>
                          </Box>
                          {error && (
                            <Box className="bg-red-50 border border-red-200 rounded-xl p-3">
                              <Text className="text-red-600">⚠️ {error}</Text>
                            </Box>
                          )}
                          {success && (
                            <Box className="bg-green-50 border border-green-200 rounded-xl p-3">
                              <Text className="text-green-600">✓ {success}</Text>
                            </Box>
                          )}
                          <Button
                            onPress={handleOrder}
                            disabled={loading || !form.name || !form.phone || !form.address}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl py-4 disabled:opacity-50"
                          >
                            <Text className="text-white font-bold text-lg">
                              {loading ? "🔄 Отправка..." : "🚀 Отправить заказ"}
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
              <Box className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 mb-6 border border-emerald-100">
                <HStack className="items-center justify-between">
                  <Text size="lg" className="text-gray-700">Итого:</Text>
                  <Text size="xl" bold className="text-emerald-600">{total}₽</Text>
                </HStack>
              </Box>

              {/* Кнопки мобильная версия */}
              <VStack space="md" className="mb-6">
                <Button 
                  action="negative" 
                  variant="outline" 
                  onPress={clearCart} 
                  className="rounded-xl py-3"
                >
                  <Text className="font-bold">🗑️ Очистить корзину</Text>
                </Button>
                <Button 
                  action="positive" 
                  onPress={() => setShowForm(f => !f)} 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl py-3"
                >
                  <Text className="text-white font-bold">
                    {showForm ? "🔼 Скрыть форму" : "📝 Оформить заказ"}
                  </Text>
                </Button>
              </VStack>

              {/* Форма мобильная версия */}
              {showForm && (
                <Animated.View entering={FadeInLeft.springify()}>
                  <Box className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                    <Text size="lg" bold className="mb-4 text-gray-800 text-center">📝 Оформление заказа</Text>
                    <VStack space="lg">
                      <Box>
                        <Text className="font-medium mb-2 text-gray-700">👤 Имя</Text>
                        <Input className="bg-white border-gray-200">
                          <InputField
                            value={form.name}
                            onChangeText={(text) => setForm(f => ({ ...f, name: text }))}
                            placeholder="Ваше имя"
                          />
                        </Input>
                      </Box>
                      <Box>
                        <Text className="font-medium mb-2 text-gray-700">📞 Телефон</Text>
                        <Input className="bg-white border-gray-200">
                          <InputField
                            value={form.phone}
                            onChangeText={(text) => setForm(f => ({ ...f, phone: text }))}
                            placeholder="+7 (999) 123-45-67"
                            keyboardType="phone-pad"
                          />
                        </Input>
                      </Box>
                      <Box>
                        <Text className="font-medium mb-2 text-gray-700">🏠 Адрес</Text>
                        <Input className="bg-white border-gray-200">
                          <InputField
                            value={form.address}
                            onChangeText={(text) => setForm(f => ({ ...f, address: text }))}
                            placeholder="Город, улица, дом, квартира"
                          />
                        </Input>
                      </Box>
                      {error && (
                        <Box className="bg-red-50 border border-red-200 rounded-xl p-3">
                          <Text className="text-red-600 text-center">⚠️ {error}</Text>
                        </Box>
                      )}
                      {success && (
                        <Box className="bg-green-50 border border-green-200 rounded-xl p-3">
                          <Text className="text-green-600 text-center">✓ {success}</Text>
                        </Box>
                      )}
                      <Button
                        onPress={handleOrder}
                        disabled={loading || !form.name || !form.phone || !form.address}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl py-4 disabled:opacity-50"
                      >
                        <Text className="text-white font-bold text-lg">
                          {loading ? "🔄 Отправка..." : "🚀 Отправить заказ"}
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