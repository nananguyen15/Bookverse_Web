import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useMemo,
} from "react";

// TODO: Fetch từ API khi cần
// import { booksApi } from "../api";
// import type { Book } from "../types";

type CartItem = {
  id: string;
  type: "book" | "series";
  quantity: number;
};

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (id: string, type: "book" | "series", quantity?: number) => void;
  updateQuantity: (
    id: string,
    type: "book" | "series",
    quantity: number
  ) => void;
  removeFromCart: (id: string, type: "book" | "series") => void;
  clearCart: () => void;
  cartDetails: {
    itemsWithDetails: any[];
    subtotal: number;
    promotionDiscount: number;
    shippingFee: number;
    total: number;
  };
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const allProducts = useMemo(
    () => [
      ...heroBookGroups.flat().map((p) => ({ ...p, type: "book" as const })),
      ...seriesData.map((p) => ({ ...p, type: "series" as const })),
    ],
    []
  );

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
    const itemsWithDetails = cartItems
      .map((cartItem) => {
        const product = allProducts.find(
          (p) => p.id.toString() === cartItem.id && p.type === cartItem.type
        );
        return { ...product, ...cartItem };
      })
      .filter((item) => item.title); // Ensure product was found

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
  }, [cartItems, allProducts]);

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
