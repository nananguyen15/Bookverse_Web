import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useMemo,
} from "react";
import { booksApi, categoriesApi, cartApi, promotionApi } from "../api";
import type { Book, SubCategory, PromotionResponse } from "../types";
import { useAuth } from "./AuthContext";
import { transformImageUrl } from "../utils/imageHelpers";

type CartItem = {
  id: string;
  type: "book" | "series";
  quantity: number;
  selected: boolean;
};

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (id: string, type: "book" | "series", quantity?: number) => Promise<void>;
  updateQuantity: (
    id: string,
    type: "book" | "series",
    quantity: number
  ) => Promise<void>;
  removeFromCart: (id: string, type: "book" | "series") => Promise<void>;
  clearCart: () => void;
  showNotification: boolean;
  isLoading: boolean;
  toggleSelectItem: (id: string, type: "book" | "series") => void;
  toggleSelectAll: () => void;
  removeSelectedItems: () => Promise<void>;
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
      promotionPercentage?: number;
      originalPrice?: number;
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
      promotionPercentage?: number;
      originalPrice?: number;
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
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [bookDetails, setBookDetails] = useState<Record<string, Book>>({});
  const [categoryDetails, setCategoryDetails] = useState<Record<number, SubCategory>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [subCategoryPromotions, setSubCategoryPromotions] = useState<Record<string, PromotionResponse | null>>({});

  // Fetch cart from backend when user logs in
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setCartItems([]);
        return;
      }

      try {
        setIsLoading(true);
        const cartResponse = await cartApi.getMyCart();

        // Convert backend CartItemResponse to local CartItem format
        const items: CartItem[] = cartResponse.cartItems.map((item) => ({
          id: item.bookId.toString(),
          type: "book" as const,
          quantity: item.quantity,
          selected: true,
        }));

        setCartItems(items);
      } catch (error) {
        console.error("Failed to fetch cart:", error);

        // Check if it's a duplicate cart error
        const err = error as { response?: { data?: { message?: string } } };
        const errorMsg = err.response?.data?.message || "";

        if (errorMsg.includes("unique result") || errorMsg.includes("2 results")) {
          console.error("⚠️ DUPLICATE CART ERROR: User has multiple active carts in database");
          // Silent fail - don't show cart items but log the error
          // Admin needs to run SQL script to fix this
        }

        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [user]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  // Fetch category details when book details change
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      const categoryIds = Object.values(bookDetails)
        .map((book) => book.categoryId);

      const uniqueCategoryIds = [...new Set(categoryIds)].filter(
        (id) => !categoryDetails[id]
      );

      for (const categoryId of uniqueCategoryIds) {
        try {
          const category = await categoriesApi.sub.getById(categoryId);
          setCategoryDetails((prev) => ({ ...prev, [categoryId]: category }));
        } catch (error) {
          console.error(`Failed to fetch category ${categoryId}:`, error);
        }
      }
    };

    if (Object.keys(bookDetails).length > 0) {
      fetchCategoryDetails();
    }
  }, [bookDetails, categoryDetails]);

  // Fetch active promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const [promotionsData, categoriesData] = await Promise.all([
          promotionApi.getActive(),
          categoriesApi.sub.getActive(),
        ]);

        const promotionSubCatsCache: Record<number, SubCategory[]> = {};
        for (const promo of promotionsData) {
          try {
            const subCats = await promotionApi.getPromotionSubCategories(promo.id);
            promotionSubCatsCache[promo.id] = subCats;
          } catch {
            promotionSubCatsCache[promo.id] = [];
          }
        }

        const subCatPromos: Record<string, PromotionResponse | null> = {};
        for (const subCat of categoriesData) {
          let foundPromo: PromotionResponse | null = null;

          for (const promo of promotionsData) {
            const subCats = promotionSubCatsCache[promo.id] || [];
            if (subCats.some(sc => sc.id === subCat.id)) {
              const now = new Date();
              const start = new Date(promo.startDate);
              const end = new Date(promo.endDate);
              if (now >= start && now <= end && promo.active) {
                foundPromo = promo;
                break;
              }
            }
          }

          subCatPromos[subCat.id] = foundPromo;
        }

        setSubCategoryPromotions(subCatPromos);
      } catch (error) {
        console.error("Error fetching promotions:", error);
      }
    };

    fetchPromotions();
  }, []);

  const addToCart = async (id: string, type: "book" | "series", quantity = 1) => {
    if (!user) {
      console.error("User must be logged in to add to cart");
      return;
    }

    // Prevent admin and staff from adding to cart
    const userRole = user.role?.toLowerCase();
    if (userRole === "admin" || userRole === "staff") {
      alert("Admin and Staff accounts cannot add items to cart.");
      return;
    }

    try {
      const bookId = Number(id);

      // Check if item already exists in cart
      const existingItem = cartItems.find(
        (item) => item.id === id && item.type === type
      );

      if (existingItem) {
        // Item exists - use addMultipleToCart to increase quantity
        if (quantity === 1) {
          await cartApi.addOneToCart({ bookId });
        } else {
          await cartApi.addMultipleToCart({ bookId, quantity });
        }
      } else {
        // New item - always use addOneToCart first, then update quantity if needed
        await cartApi.addOneToCart({ bookId });

        if (quantity > 1) {
          // Update to desired quantity
          await cartApi.updateItemQuantity({ bookId, quantity });
        }
      }

      // Update local state
      setCartItems((prevItems) => {
        const existing = prevItems.find(
          (item) => item.id === id && item.type === type
        );
        if (existing) {
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
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  };

  const updateQuantity = async (
    id: string,
    type: "book" | "series",
    quantity: number
  ) => {
    if (!user) return;

    try {
      const bookId = Number(id);
      await cartApi.updateItemQuantity({ bookId, quantity });

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id && item.type === type ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error("Failed to update quantity:", error);
      throw error;
    }
  };

  const removeFromCart = async (id: string, type: "book" | "series") => {
    if (!user) return;

    try {
      const bookId = Number(id);
      await cartApi.clearAnItem({ bookId });

      setCartItems((prevItems) =>
        prevItems.filter((item) => !(item.id === id && item.type === type))
      );
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    }
  };

  const clearCart = () => {
    // Note: Backend doesn't have clear all cart API yet
    // You may need to call clearAnItem for each item
    setCartItems([]);
  };

  const toggleSelectItem = (id: string, type: "book" | "series") => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id && item.type === type) {
          const book = bookDetails[item.id];
          const isOutOfStock = (book?.stockQuantity || 0) <= 0;
          // Prevent selecting out of stock items
          if (isOutOfStock && !item.selected) {
            return item; // Don't toggle if trying to select an out of stock item
          }
          return { ...item, selected: !item.selected };
        }
        return item;
      })
    );
  };

  const toggleSelectAll = () => {
    const availableItems = cartItems.filter((item) => {
      const book = bookDetails[item.id];
      return (book?.stockQuantity || 0) > 0;
    });
    const allAvailableSelected = availableItems.every((item) => item.selected);

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        const book = bookDetails[item.id];
        const isOutOfStock = (book?.stockQuantity || 0) <= 0;
        // Don't select out of stock items
        return isOutOfStock
          ? { ...item, selected: false }
          : { ...item, selected: !allAvailableSelected };
      })
    );
  };

  const removeSelectedItems = async () => {
    if (!user) return;

    const selectedIds = cartItems
      .filter((item) => item.selected)
      .map((item) => item.id);

    try {
      // Remove each selected item from backend
      await Promise.all(
        selectedIds.map((id) => cartApi.clearAnItem({ bookId: Number(id) }))
      );

      setCartItems((prevItems) => prevItems.filter((item) => !item.selected));
    } catch (error) {
      console.error("Failed to remove selected items:", error);
      throw error;
    }
  };

  const cartDetails = useMemo(() => {
    // Map cart items with book details
    const itemsWithDetails = cartItems.map((cartItem) => {
      const book = bookDetails[cartItem.id];
      const category = book ? categoryDetails[book.categoryId] : undefined;
      const isOutOfStock = (book?.stockQuantity || 0) <= 0;

      // Transform image URL properly
      const imageUrl = transformImageUrl(book?.image) || "/img/book/placeholder-book.jpg";

      // Check for promotion
      let promotionPercentage: number | undefined;
      let originalPrice: number | undefined;
      let finalPrice = book?.price || 0;

      if (book) {
        const categoryKey = String(book.categoryId);
        const promotion = subCategoryPromotions[categoryKey];

        if (promotion) {
          promotionPercentage = promotion.percentage;
          originalPrice = book.price;
          const discount = book.price * (promotion.percentage / 100);
          finalPrice = book.price - discount;
        }
      }

      return {
        id: cartItem.id,
        type: cartItem.type,
        quantity: cartItem.quantity,
        selected: isOutOfStock ? false : cartItem.selected, // Auto-deselect if out of stock
        title: book?.title || `Product ${cartItem.id}`,
        price: finalPrice,
        image: imageUrl,
        categoryName: category?.name,
        stockQuantity: book?.stockQuantity || 0,
        promotionPercentage,
        originalPrice,
      };
    });

    const selectedItems = itemsWithDetails.filter((item) => item.selected);

    const subtotal = selectedItems.reduce(
      (sum, item) => {
        const itemPrice = item.originalPrice || item.price;
        return sum + itemPrice * item.quantity;
      },
      0
    );

    const promotionDiscount = selectedItems.reduce(
      (sum, item) => {
        if (item.originalPrice && item.promotionPercentage) {
          const discount = (item.originalPrice * item.promotionPercentage / 100) * item.quantity;
          return sum + discount;
        }
        return sum;
      },
      0
    );

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
  }, [cartItems, bookDetails, categoryDetails, subCategoryPromotions]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        showNotification,
        isLoading,
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

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
