import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  useMemo,
} from "react";
import { cartApi } from "../api/endpoints/cart.api";
import type { CartResponse } from "../types/api/cart.types";
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

  // Fetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated]);

  const refreshCart = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      const cartData = await cartApi.getMyCart();
      setCart(cartData);
    } catch (err: any) {
      console.error("Failed to fetch cart:", err);
      setError(err.response?.data?.message || "Failed to load cart");
    } finally {
      setIsLoading(false);
    }
  };

  const addOneToCart = async (bookId: number) => {
    setError(null);
    try {
      const updatedCart = await cartApi.addOneToCart({ bookId });
      setCart(updatedCart);
    } catch (err: any) {
      console.error("Failed to add to cart:", err);
      setError(err.response?.data?.message || "Failed to add to cart");
      throw err;
    }
  };

  const removeOneFromCart = async (bookId: number) => {
    setError(null);
    try {
      const updatedCart = await cartApi.removeOneFromCart({ bookId });
      setCart(updatedCart);
    } catch (err: any) {
      console.error("Failed to remove from cart:", err);
      setError(err.response?.data?.message || "Failed to remove from cart");
      throw err;
    }
  };

  const clearItem = async (bookId: number) => {
    setError(null);
    try {
      const updatedCart = await cartApi.clearAnItem({ bookId });
      setCart(updatedCart);
    } catch (err: any) {
      console.error("Failed to clear item:", err);
      setError(err.response?.data?.message || "Failed to clear item");
      throw err;
    }
  };

  const updateItemQuantity = async (bookId: number, quantity: number) => {
    setError(null);
    try {
      const updatedCart = await cartApi.updateItemQuantity({ bookId, quantity });
      setCart(updatedCart);
    } catch (err: any) {
      console.error("Failed to update quantity:", err);
      setError(err.response?.data?.message || "Failed to update quantity");
      throw err;
    }
  };

  // Calculate cart item count
  const cartItemCount = useMemo(() => {
    if (!cart?.cartItems) return 0;
    return cart.cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Calculate cart total
  const cartTotal = useMemo(() => {
    if (!cart?.cartItems) return 0;
    return cart.cartItems.reduce((total, item) => total + item.subtotal, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        addOneToCart,
        removeOneFromCart,
        clearItem,
        updateItemQuantity,
        refreshCart,
        cartItemCount,
        cartTotal,
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
