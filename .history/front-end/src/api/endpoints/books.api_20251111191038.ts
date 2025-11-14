import apiClient from "../client";
import type {
  ApiResponse,
  Book,
  BookCreateRequest,
  BookUpdateRequest,
} from "../../types";

const BOOKS_ENDPOINT = "/books";

export const booksApi = {
  // GET all books
  getAll: async (): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(BOOKS_ENDPOINT);
    return response.data.result;
  },

  // GET active books
  getActive: async (): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/active`
    );
    return response.data.result;
  },

  // GET inactive books
  getInactive: async (): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/inactive`
    );
    return response.data.result;
  },

  // GET random active books
  getRandom: async (limit: number = 9): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/active/random`,
      { params: { limit } }
    );
    return response.data.result;
  },

  // GET books sorted by title
  sortByTitle: async (): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/active/sort-by-title`
    );
    return response.data.result;
  },

  // GET books sorted by price (descending)
  sortByPriceDesc: async (): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/active/sort-by-price-desc`
    );
    return response.data.result;
  },

  // GET books sorted by price (ascending)
  sortByPriceAsc: async (): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/active/sort-by-price-asc`
    );
    return response.data.result;
  },

  // GET books sorted by oldest
  sortByOldest: async (): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/active/sort-by-oldest`
    );
    return response.data.result;
  },

  // GET books sorted by newest
  sortByNewest: async (): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/active/sort-by-newest`
    );
    return response.data.result;
  },

  // GET books by search title
  search: async (title: string): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/active/search/${encodeURIComponent(title)}`
    );
    return response.data.result;
  },

  // GET book by ID
  getById: async (id: number): Promise<Book> => {
    const response = await apiClient.get<ApiResponse<Book> | Book>(
      `${BOOKS_ENDPOINT}/${id}`
    );
    // Backend returns flat object for single item, not wrapped in ApiResponse
    return "result" in response.data ? response.data.result : response.data;
  },

  // POST create new book
  create: async (data: any): Promise<Book> => {
    const formData = new FormData();
    
    // Add all text fields
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.price !== undefined) formData.append('price', String(data.price));
    if (data.authorId) formData.append('authorId', String(data.authorId));
    if (data.publisherId) formData.append('publisherId', String(data.publisherId));
    if (data.categoryId) formData.append('categoryId', String(data.categoryId));
    if (data.stockQuantity !== undefined) formData.append('stockQuantity', String(data.stockQuantity));
    if (data.publishedDate) formData.append('publishedDate', data.publishedDate);
    if (data.active !== undefined) formData.append('active', String(data.active));
    
    // Handle image upload
    if (data.imageFile) {
      formData.append('image', data.imageFile);
      console.log('📤 Uploading book image file:', data.imageFile.name);
    } else if (data.image) {
      formData.append('imageUrl', data.image);
      console.log('📤 Setting book image URL:', data.image);
    }

    const response = await apiClient.post<ApiResponse<Book>>(
      `${BOOKS_ENDPOINT}/create`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.result;
  },

  // PUT update book
  update: async (id: number, data: any): Promise<Book> => {
    const formData = new FormData();
    
    // Add only provided fields
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.price !== undefined) formData.append('price', String(data.price));
    if (data.authorId) formData.append('authorId', String(data.authorId));
    if (data.publisherId) formData.append('publisherId', String(data.publisherId));
    if (data.categoryId) formData.append('categoryId', String(data.categoryId));
    if (data.stockQuantity !== undefined) formData.append('stockQuantity', String(data.stockQuantity));
    if (data.publishedDate) formData.append('publishedDate', data.publishedDate);
    
    // Handle image update
    if (data.imageFile) {
      formData.append('image', data.imageFile);
      console.log('📤 Updating book image file:', data.imageFile.name);
    } else if (data.image) {
      formData.append('imageUrl', data.image);
      console.log('📤 Updating book image URL:', data.image);
    }

    const response = await apiClient.put<ApiResponse<Book>>(
      `${BOOKS_ENDPOINT}/update/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.result;
  },

  // PUT activate book
  activate: async (id: number): Promise<Book> => {
    const response = await apiClient.put<ApiResponse<Book>>(
      `${BOOKS_ENDPOINT}/active/${id}`
    );
    return response.data.result;
  },

  // PUT deactivate book
  deactivate: async (id: number): Promise<Book> => {
    const response = await apiClient.put<ApiResponse<Book>>(
      `${BOOKS_ENDPOINT}/inactive/${id}`
    );
    return response.data.result;
  },
};
