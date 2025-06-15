import { useState } from "react";

let cart: any[] = [];

export const useCart = () => {
  const [items, setItems] = useState(cart);

  const addToCart = (product) => {
    cart.push(product);
    setItems([...cart]);
  };

  const removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    setItems([...cart]);
  };

  return { items, addToCart, removeFromCart };
};
