import React, { createContext, useContext, useEffect, useState } from "react";

const CART_KEY = "cart";
const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(CART_KEY);
        setItems(stored ? JSON.parse(stored) : []);
      } catch {
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    }
  }, [items]);

  const addToCart = (product: any) => setItems((prev) => [...prev, product]);
  const removeFromCart = (id: number) => setItems((prev) => prev.filter((item) => item.id !== id));
  const clearCart = () => setItems([]);
  const getCount = () => items.length;

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, getCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
} 