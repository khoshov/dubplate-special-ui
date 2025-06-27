import type { Product } from "@/components/AddToCartButton";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { API_HOST } from "@/constants/api";
import { useCart } from "@/hooks/CartContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";

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
    <Box className="p-4 max-w-2xl mx-auto min-h-screen">
      <Text size="xl" bold className="mb-4 text-center">Корзина</Text>
      {items.length === 0 ? (
        <Box className="flex flex-col items-center justify-center mt-16">
          <Text className="text-gray-500 text-lg mb-4">Ваша корзина пуста</Text>
          <Button onPress={() => router.push("/")}>На главную</Button>
        </Box>
      ) : (
        <>
          <Box className="flex flex-col gap-4 mb-6">
            {items.map((item: Product) => (
              <Box key={item.id} className="flex flex-row items-center border-b border-gray-200 py-3 gap-4">
                <img src={item.cover_image} alt={item.title} className="w-16 h-16 object-cover rounded" />
                <Box className="flex-1">
                  <Text bold>{item.title}</Text>
                  <Text className="text-xs text-gray-500">{item.artists?.map((a: any) => a.name).join(", ")}</Text>
                  <Text className="text-primary-500 mt-1">{item.price ? `$${item.price}` : "—"}</Text>
                </Box>
                <Button variant="link" onPress={() => removeFromCart(item.id)}>
                  <Text>Удалить</Text>
                </Button>
              </Box>
            ))}
          </Box>
          <Box className="flex flex-row items-center justify-between mb-6">
            <Text bold>Итого:</Text>
            <Text size="lg" bold className="text-primary-600">${total}</Text>
          </Box>
          <Button action="negative" variant="outline" onPress={clearCart} className="mb-4">Очистить корзину</Button>
          <Button action="positive" onPress={() => setShowForm(f => !f)} className="mb-4">
            <Text>{showForm ? "Скрыть форму" : "Оформить заказ"}</Text>
          </Button>
          {showForm && (
            <form onSubmit={handleOrder} className="bg-gray-50 rounded-lg p-4 flex flex-col gap-4 mb-4">
              <label className="flex flex-col gap-1">
                <span className="font-medium">Имя</span>
                <input
                  className="border rounded px-3 py-2"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ваше имя"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-medium">Телефон</span>
                <input
                  className="border rounded px-3 py-2"
                  required
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+7 (999) 123-45-67"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-medium">Адрес</span>
                <input
                  className="border rounded px-3 py-2"
                  required
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Город, улица, дом, квартира"
                />
              </label>
              {error && <Text className="text-red-500">{error}</Text>}
              {success && <Text className="text-green-600">{success}</Text>}
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded px-4 py-2 transition-colors disabled:opacity-60"
              >
                {loading ? "Отправка..." : "Отправить заказ"}
              </button>
            </form>
          )}
        </>
      )}
    </Box>
  );
} 