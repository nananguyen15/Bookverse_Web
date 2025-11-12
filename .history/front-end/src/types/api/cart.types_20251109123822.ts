// Cart API Types

export interface CartItemResponse {
  id: number;
  bookId: number;
  bookTitle: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  userId: string;
  cartItems: CartItemResponse[];
  active: boolean;
}

export interface AddToCartRequest {
  bookId: number;
}

export interface CartItemUpdateRequest {
  bookId: number;
  quantity: number;
}
