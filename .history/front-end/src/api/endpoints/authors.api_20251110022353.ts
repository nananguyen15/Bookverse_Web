import apiClient from "../client";
import type { ApiResponse, Author, AuthorCreateRequest, AuthorUpdateRequest, Book } from "../../types";

const AUTHORS_ENDPOINT = "/authors";

export const authorsApi = {
  // POST /api/authors/create - Create new author
  create: async (data: AuthorCreateRequest): Promise<Author> => {
    const response = await apiClient.post<APIResponse<Author>>(
      `${AUTHORS_ENDPOINT}/create`,
      data
    );
    return response.data.result;
  },

  // GET /api/authors - Get all authors
  getAll: async (): Promise<Author[]> => {
    const response = await apiClient.get<ApiResponse<Author[]>>(
      AUTHORS_ENDPOINT
    );
    return response.data.result;
  },

  // GET /api/authors/{authorId} - Get author by ID
  getById: async (authorId: number): Promise<Author> => {
    const response = await apiClient.get<Author>(
      `${AUTHORS_ENDPOINT}/${authorId}`
    );
    // Backend returns Author directly, not wrapped in ApiResponse
    return response.data;
  },

  // GET /api/authors/active - Get active authors
  getActive: async (): Promise<Author[]> => {
    const response = await apiClient.get<ApiResponse<Author[]>>(
      `${AUTHORS_ENDPOINT}/active`
    );
    return response.data.result;
  },

  // GET /api/authors/inactive - Get inactive authors
  getInactive: async (): Promise<Author[]> => {
    const response = await apiClient.get<ApiResponse<Author[]>>(
      `${AUTHORS_ENDPOINT}/inactive`
    );
    return response.data.result;
  },

  // GET /api/authors/search/{keyword} - Search authors by name
  search: async (keyword: string): Promise<Author[]> => {
    const response = await apiClient.get<ApiResponse<Author[]>>(
      `${AUTHORS_ENDPOINT}/search/${encodeURIComponent(keyword)}`
    );
    return response.data.result;
  },

  // GET /api/authors/{authorId}/books - Get books by author ID
  getBooksByAuthorId: async (authorId: number): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${AUTHORS_ENDPOINT}/${authorId}/books`
    );
    return response.data.result;
  },

  // PUT /api/authors/update/{authorId} - Update author
  update: async (authorId: number, data: AuthorUpdateRequest): Promise<Author> => {
    const response = await apiClient.put<Author>(
      `${AUTHORS_ENDPOINT}/update/${authorId}`,
      data
    );
    // Backend returns Author directly, not wrapped in ApiResponse
    return response.data;
  },

  // PUT /api/authors/inactive/{authorId} - Deactivate author (soft delete)
  // Note: This endpoint may not be implemented in BE yet
  deactivate: async (authorId: number): Promise<Author> => {
    const response = await apiClient.put<Author>(
      `${AUTHORS_ENDPOINT}/inactive/${authorId}`
    );
    // Backend returns Author directly, not wrapped in ApiResponse
    return response.data;
  },

  // PUT /api/authors/active/{authorId} - Activate author
  // Note: This endpoint may not be implemented in BE yet
  activate: async (authorId: number): Promise<Author> => {
    const response = await apiClient.put<Author>(
      `${AUTHORS_ENDPOINT}/active/${authorId}`
    );
    // Backend returns Author directly, not wrapped in ApiResponse
    return response.data;
  },
};
