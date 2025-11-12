import apiClient from "../client";
import type {
  ApiResponse,
  Book,
  BookCreateRequest,
  BookUpdateRequest,
} from "../../types";

const BOOKS_ENDPOINT = "/books";

export const booksApi = {
  // POST /api/books/create - Create new book
  create: async (data: BookCreateRequest): Promise<Book> => {
    const response = await apiClient.post<ApiResponse<Book>>(
      `${BOOKS_ENDPOINT}/create`,
      data
    );
    return response.data.result;
  },

  // GET /api/books - Get all books
  getAll: async (): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(BOOKS_ENDPOINT);
    return response.data.result;
  },

  // GET /api/books/{bookId} - Get book by ID
  getById: async (bookId: number): Promise<Book> => {
    const response = await apiClient.get<Book>(
      `${BOOKS_ENDPOINT}/${bookId}`
    );
    // Backend returns Book directly, not wrapped in ApiResponse
    return response.data;
  },

  // GET /api/books/active - Get active books
  getActive: async (): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/active`
    );
    return response.data.result;
  },

  // GET /api/books/inactive - Get inactive books
  getInactive: async (): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/inactive`
    );
    return response.data.result;
  },

  // GET /api/books/active/search/{title} - Search books by title
  search: async (title: string): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/active/search/${encodeURIComponent(title)}`
    );
    return response.data.result;
  },

  // GET /api/books/active/sort-by-title - Sort books by title
  sortByTitle: async (): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/active/sort-by-title`
    );
    return response.data.result;
  },

  // GET /api/books/active/sort-by-price-desc - Sort books by price (high to low)
  sortByPriceDesc: async (): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/active/sort-by-price-desc`
    );
    return response.data.result;
  },

  // GET /api/books/active/sort-by-price-asc - Sort books by price (low to high)
  sortByPriceAsc: async (): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/active/sort-by-price-asc`
    );
    return response.data.result;
  },

  // GET /api/books/active/sort-by-oldest - Sort books by oldest
  sortByOldest: async (): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/active/sort-by-oldest`
    );
    return response.data.result;
  },

  // GET /api/books/active/sort-by-newest - Sort books by newest
  sortByNewest: async (): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/active/sort-by-newest`
    );
    return response.data.result;
  },

  // PUT /api/books/update/{bookId} - Update book
  update: async (bookId: number, data: BookUpdateRequest): Promise<Book> => {
    const response = await apiClient.put<Book>(
      `${BOOKS_ENDPOINT}/update/${bookId}`,
      data
    );
    // Backend returns Book directly, not wrapped in ApiResponse
    return response.data;
  },

  // PUT /api/books/active/{bookId} - Activate book
  activate: async (bookId: number): Promise<Book> => {
    const response = await apiClient.put<Book>(
      `${BOOKS_ENDPOINT}/active/${bookId}`
    );
    // Backend returns Book directly, not wrapped in ApiResponse
    return response.data;
  },

  // PUT /api/books/inactive/{bookId} - Deactivate book (soft delete)
  deactivate: async (bookId: number): Promise<Book> => {
    const response = await apiClient.put<Book>(
      `${BOOKS_ENDPOINT}/inactive/${bookId}`
    );
    // Backend returns Book directly, not wrapped in ApiResponse
    return response.data;
  },

  // GET /api/books/active/random - Get random active books (for homepage)
  getRandom: async (limit: number = 9): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${BOOKS_ENDPOINT}/active/random`,
      { params: { limit } }
    );
    return response.data.result;
  },
};
