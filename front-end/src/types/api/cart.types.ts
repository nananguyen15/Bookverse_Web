// Cart API Types - Backend Response/Request models

export type CartItemResponse = {
  id: number;
  bookId: number;
  bookTitle: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type CartResponse = {
  userId: string;
  cartItems: CartItemResponse[];
  active: boolean;
};

export type AddToCartRequest = {
  bookId: number;
};

export type CartItemUpdateRequest = {
  bookId: number;
  quantity: number;
};
