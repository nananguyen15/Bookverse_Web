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
    itemsWithDetails: Array<{
      id: string;
      type: string;
      quantity: number;
      name: string;
      price: number;
      image: string;
    }>;
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
