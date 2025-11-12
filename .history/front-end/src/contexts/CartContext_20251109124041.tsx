import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useMemo,
} from "react";
import { cartApi } from "../api/endpoints/cart.api";
import type { CartResponse, CartItemResponse } from "../types/api/cart.types";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cart: CartResponse | null;
  isLoading: boolean;
  error: string | null;
  addOneToCart: (bookId: number) => Promise<void>;
  removeOneFromCart: (bookId: number) => Promise<void>;
  clearItem: (bookId: number) => Promise<void>;
  updateItemQuantity: (bookId: number, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  cartItemCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (id: string, type: "book" | "series", quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.id === id && item.type === type
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === id && item.type === type
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { id, type, quantity }];
    });
  };

  const updateQuantity = (
    id: string,
    type: "book" | "series",
    quantity: number
  ) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.type === type ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (id: string, type: "book" | "series") => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item.id === id && item.type === type))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartDetails = useMemo(() => {
    // TODO: Fetch product details từ API dựa trên cartItems
    const itemsWithDetails = cartItems.map((cartItem) => ({
      id: cartItem.id,
      type: cartItem.type,
      quantity: cartItem.quantity,
      name: `Product ${cartItem.id}`,
      price: 0,
      image: "/placeholder.jpg",
    }));

    const subtotal = itemsWithDetails.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const promotionDiscount = subtotal * 0.1; // Giảm giá 10%
    const shippingFee = subtotal > 20 ? 0 : 5;
    const total = subtotal - promotionDiscount + shippingFee;

    return {
      itemsWithDetails,
      subtotal,
      promotionDiscount,
      shippingFee,
      total,
    };
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartDetails,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
