// Book Types
export interface Book {
  id: number;
  title: string;
  description: string;
  price: number;
  authorId: number;
  authorName?: string;
  publisherId: number;
  publisherName?: string;
  categoryId: number;
  categoryName?: string;
  stockQuantity: number;
  publishedDate: string;
  image: string;
  active: boolean;
  soldCount?: number;
}

export interface BookCreateRequest {
  title: string;
  description: string;
  price: number;
  authorId: number;
  publisherId: number;
  categoryId: number;
  stockQuantity: number;
  publishedDate: string;
  image: string;
}

export type BookUpdateRequest = Partial<BookCreateRequest>;
