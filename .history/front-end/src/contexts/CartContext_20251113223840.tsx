import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useMemo,
} from "react";
import { booksApi } from "../api";
import type { Book } from "../types";

type CartItem = {
  id: string;
  type: "book" | "series";
  quantity: number;
  selected: boolean;
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
  showNotification: boolean;
  toggleSelectItem: (id: string, type: "book" | "series") => void;
  toggleSelectAll: () => void;
  removeSelectedItems: () => void;
  cartDetails: {
    itemsWithDetails: Array<{
      id: string;
      type: string;
      quantity: number;
      selected: boolean;
      title: string;
      price: number;
      image: string;
      categoryName?: string;
      stockQuantity: number;
    }>;
    selectedItems: Array<{
      id: string;
      type: string;
      quantity: number;
      title: string;
      price: number;
      image: string;
      categoryName?: string;
      stockQuantity: number;
    }>;
    subtotal: number;
    promotionDiscount: number;
    shippingFee: number;
    total: number;
    selectedCount: number;
    totalCount: number;
  };
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [showNotification, setShowNotification] = useState(false);
  const [bookDetails, setBookDetails] = useState<Record<string, Book>>({});

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Fetch book details when cart items change
  useEffect(() => {
    const fetchBookDetails = async () => {
      const bookIds = cartItems
        .filter((item) => item.type === "book")
        .map((item) => item.id);

      for (const id of bookIds) {
        if (!bookDetails[id]) {
          try {
            const book = await booksApi.getById(Number(id));
            setBookDetails((prev) => ({ ...prev, [id]: book }));
          } catch (error) {
            console.error(`Failed to fetch book ${id}:`, error);
          }
        }
      }
    };

    if (cartItems.length > 0) {
      fetchBookDetails();
    }
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
      return [...prevItems, { id, type, quantity, selected: true }];
    });

    // Show notification
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
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

  const toggleSelectItem = (id: string, type: "book" | "series") => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.type === type
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  const toggleSelectAll = () => {
    const allSelected = cartItems.every((item) => item.selected);
    setCartItems((prevItems) =>
      prevItems.map((item) => ({ ...item, selected: !allSelected }))
    );
  };

  const removeSelectedItems = () => {
    setCartItems((prevItems) => prevItems.filter((item) => !item.selected));
  };

  const cartDetails = useMemo(() => {
    // Map cart items with book details
    const itemsWithDetails = cartItems.map((cartItem) => {
      const book = bookDetails[cartItem.id];
      return {
        id: cartItem.id,
        type: cartItem.type,
        quantity: cartItem.quantity,
        selected: cartItem.selected,
        title: book?.title || `Product ${cartItem.id}`,
        price: book?.price || 0,
        image: book?.image || "/placeholder.jpg",
        categoryName: book?.categoryName,
        stockQuantity: book?.stockQuantity || 0,
      };
    });

    const selectedItems = itemsWithDetails.filter((item) => item.selected);

    const subtotal = selectedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const promotionDiscount = 0; // Will be calculated based on promotions
    const shippingFee = subtotal >= 50 ? 0 : 5;
    const total = subtotal - promotionDiscount + shippingFee;

    return {
      itemsWithDetails,
      selectedItems,
      subtotal,
      promotionDiscount,
      shippingFee,
      total,
      selectedCount: selectedItems.length,
      totalCount: cartItems.length,
    };
  }, [cartItems, bookDetails]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        showNotification,
        toggleSelectItem,
        toggleSelectAll,
        removeSelectedItems,
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
