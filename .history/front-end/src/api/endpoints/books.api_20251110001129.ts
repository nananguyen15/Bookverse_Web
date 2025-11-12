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

  // SEARCH active books by title
  search: async (title: string): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/active/search/${encodeURIComponent(title)}`
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
  create: async (data: BookCreateRequest): Promise<Book> => {
    const response = await apiClient.post<ApiResponse<Book>>(
      BOOKS_ENDPOINT,
      data
    );
    return response.data.result;
  },

  // PUT update book
  update: async (id: number, data: BookUpdateRequest): Promise<Book> => {
    const response = await apiClient.put<ApiResponse<Book>>(
      `${BOOKS_ENDPOINT}/${id}`,
      data
    );
    return response.data.result;
  },

  // PUT activate book
  activate: async (id: number): Promise<Book> => {
    const response = await apiClient.put<ApiResponse<Book>>(
      `${BOOKS_ENDPOINT}/${id}/activate`
    );
    return response.data.result;
  },

  // PUT deactivate book
  deactivate: async (id: number): Promise<Book> => {
    const response = await apiClient.put<ApiResponse<Book>>(
      `${BOOKS_ENDPOINT}/${id}/deactivate`
    );
    return response.data.result;
  },
};
