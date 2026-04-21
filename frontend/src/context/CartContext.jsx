import { useEffect, useState } from "react";
import { CartContext } from "./createCartContext.js";
import { parsePrice } from "../utils/price.js";

// ✅ CART CONTEXT - created in separate file for fast refresh compatibility
export { CartContext };

const CART_KEY = "reelbite_cart";
const LEGACY_CART_KEY = "cart";

function loadCartFromStorage() {
  try {
    const next = localStorage.getItem(CART_KEY);
    if (next) return JSON.parse(next);
    const legacy = localStorage.getItem(LEGACY_CART_KEY);
    if (legacy) {
      localStorage.setItem(CART_KEY, legacy);
      localStorage.removeItem(LEGACY_CART_KEY);
      return JSON.parse(legacy);
    }
  } catch {
    /* noop */
  }
  return [];
}

/** Normalize items from API or legacy cart: stable id + numeric price */
export function normalizeCartItem(item) {
  if (!item) return item;
  const id = item.id ?? item._id;
  const qty = Number(item.qty) || 0;
  return {
    ...item,
    id,
    qty: qty > 0 ? qty : 1,
    price: parsePrice(item.price),
  };
}

// ✅ CART PROVIDER COMPONENT
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const raw = loadCartFromStorage();
    return Array.isArray(raw) ? raw.map(normalizeCartItem).filter(Boolean) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // ✅ ADD ITEM TO CART
  const addToCart = (item) => {
    const normalized = normalizeCartItem({ ...item, qty: 1 });
    setCart((prev) => {
      const existing = prev.find(
        (cartItem) => cartItem.id === normalized.id
      );

      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === normalized.id
            ? { ...cartItem, qty: cartItem.qty + 1 }
            : cartItem
        );
      }

      return [...prev, normalized];
    });
  };

  // ✅ REMOVE ITEM FROM CART
  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  // ✅ INCREASE QUANTITY
  const increaseQty = (itemId) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  // ✅ DECREASE QUANTITY
  const decreaseQty = (itemId) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId && item.qty > 1
          ? { ...item, qty: item.qty - 1 }
          : item
      )
    );
  };

  // ✅ CALCULATE TOTAL PRICE
  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const p = parsePrice(item.price);
      const q = Number(item.qty) || 0;
      return total + p * q;
    }, 0);
  };

  // ✅ GET TOTAL ITEMS
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + (Number(item.qty) || 0), 0);
  };

  // ✅ CLEAR CART
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        getTotalPrice,
        getTotalItems,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
