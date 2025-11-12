// ---------- Backend API Response Types ----------

export type BookResponse = {
  id: number;
  title: string;
  description: string;
  price: number;
  authorId: number;
  publisherId: number;
  categoryId: number;
  stockQuantity: number;
  publishedDate: string; // ISO date string
  image: string;
  active: boolean;
};

export type SeriesResponse = {
  id: number;
  name: string;
  description: string;
  author: string;
  image: string;
  active: boolean;
};

export type SupCategoryResponse = {
  id: number;
  name: string;
  active: boolean;
};

export type SubCategoryResponse = {
  id: number;
  supCategoryId: number;
  name: string;
  description: string;
  active: boolean;
};

export type AuthorResponse = {
  id: number;
  name: string;
  biography: string;
  image: string;
  active: boolean;
};

export type PublisherResponse = {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  active: boolean;
};

// ---------- Frontend Types (mapped from API) ----------

export type Book = {
  id: string;
  title: string;
  description: string;
  price: number;
  authorId?: string;
  publisherId?: string;
  categoryId?: string;
  stockQuantity: number;
  publishedDate: string;
  image?: string;
  active: boolean;
};

export type Series = {
  id: string;
  name: string;
  description: string;
  author: string;
  image?: string;
  active: boolean;
};

export type Category = {
  id: string;
  name: string;
  active: boolean;
  subcategories?: SubCategory[];
};

export type SubCategory = {
  id: string;
  supCategoryId: string;
  name: string;
  description: string;
  active: boolean;
};

export type Author = {
  id: string;
  name: string;
  biography: string;
  image?: string;
  active: boolean;
};

export type Publisher = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  active: boolean;
};

// ---------- Mappers (API Response → Frontend Type) ----------

export function mapBook(apiBook: BookResponse): Book {
  return {
    id: String(apiBook.id),
    title: apiBook.title,
    description: apiBook.description || "",
    price: apiBook.price,
    authorId: apiBook.authorId ? String(apiBook.authorId) : undefined,
    publisherId: apiBook.publisherId ? String(apiBook.publisherId) : undefined,
    categoryId: apiBook.categoryId ? String(apiBook.categoryId) : undefined,
    stockQuantity: apiBook.stockQuantity,
    publishedDate: apiBook.publishedDate,
    image: apiBook.image || undefined,
    active: apiBook.active,
  };
}

export function mapSeries(apiSeries: SeriesResponse): Series {
  return {
    id: String(apiSeries.id),
    name: apiSeries.name,
    description: apiSeries.description || "",
    author: apiSeries.author || "",
    image: apiSeries.image || undefined,
    active: apiSeries.active,
  };
}

export function mapCategory(apiCategory: SupCategoryResponse): Category {
  return {
    id: String(apiCategory.id),
    name: apiCategory.name,
    active: apiCategory.active,
  };
}

export function mapSubCategory(apiSubCategory: SubCategoryResponse): SubCategory {
  return {
    id: String(apiSubCategory.id),
    supCategoryId: String(apiSubCategory.supCategoryId),
    name: apiSubCategory.name,
    description: apiSubCategory.description || "",
    active: apiSubCategory.active,
  };
}

export function mapAuthor(apiAuthor: AuthorResponse): Author {
  return {
    id: String(apiAuthor.id),
    name: apiAuthor.name,
    biography: apiAuthor.biography || "",
    image: apiAuthor.image || undefined,
    active: apiAuthor.active,
  };
}

export function mapPublisher(apiPublisher: PublisherResponse): Publisher {
  return {
    id: String(apiPublisher.id),
    name: apiPublisher.name,
    address: apiPublisher.address || "",
    phone: apiPublisher.phone || "",
    email: apiPublisher.email || "",
    active: apiPublisher.active,
  };
}

// ---------- Helper Types ----------

export type BookGroup = Book[];

export type APIResponse<T> = {
  code: number;
  message?: string;
  result: T;
};
