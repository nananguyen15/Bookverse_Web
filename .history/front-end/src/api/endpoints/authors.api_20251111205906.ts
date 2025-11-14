import apiClient from "../client";
import type { ApiResponse, Author, Book } from "../../types";

const AUTHORS_ENDPOINT = "/authors";

export const authorsApi = {
  // GET all authors
  getAll: async (): Promise<Author[]> => {
    const response = await apiClient.get<ApiResponse<Author[]>>(
      AUTHORS_ENDPOINT
    );
    return response.data.result;
  },

  // GET active authors
  getActive: async (): Promise<Author[]> => {
    const response = await apiClient.get<ApiResponse<Author[]>>(
      `${AUTHORS_ENDPOINT}/active`
    );
    return response.data.result;
  },

  // GET inactive authors
  getInactive: async (): Promise<Author[]> => {
    const response = await apiClient.get<ApiResponse<Author[]>>(
      `${AUTHORS_ENDPOINT}/inactive`
    );
    return response.data.result;
  },

  // GET author by ID
  getById: async (id: number): Promise<Author> => {
    const response = await apiClient.get<ApiResponse<Author> | Author>(
      `${AUTHORS_ENDPOINT}/${id}`
    );
    // Backend returns flat object for single item, not wrapped in ApiResponse
    return "result" in response.data ? response.data.result : response.data;
  },

  // GET books by author ID
  getBooksByAuthorId: async (authorId: number): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `${AUTHORS_ENDPOINT}/${authorId}/books`
    );
    return response.data.result;
  },

  // GET search authors by keyword
  search: async (keyword: string): Promise<Author[]> => {
    const response = await apiClient.get<ApiResponse<Author[]>>(
      `${AUTHORS_ENDPOINT}/search/${encodeURIComponent(keyword)}`
    );
    return response.data.result;
  },

  // POST create author
  create: async (data: any): Promise<Author> => {
    const formData = new FormData();
    
    // Add all text fields
    if (data.name) formData.append('name', data.name);
    if (data.bio) formData.append('bio', data.bio);
    if (data.birthDate) formData.append('birthDate', data.birthDate);
    if (data.nationality) formData.append('nationality', data.nationality);
    if (data.active !== undefined) formData.append('active', String(data.active));
    
    // Handle image upload
    if (data.imageFile) {
      formData.append('image', data.imageFile);
      console.log('📤 Uploading author image file:', data.imageFile.name);
    } else if (data.image) {
      formData.append('imageUrl', data.image);
      console.log('📤 Setting author image URL:', data.image);
    }

    const response = await apiClient.post<ApiResponse<Author>>(
      `${AUTHORS_ENDPOINT}/create`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.result;
  },

  // PUT update author
  update: async (id: number, data: any): Promise<Author> => {
    const formData = new FormData();
    
    // Add only provided fields
    if (data.name) formData.append('name', data.name);
    if (data.bio) formData.append('bio', data.bio);
    if (data.birthDate) formData.append('birthDate', data.birthDate);
    if (data.nationality) formData.append('nationality', data.nationality);
    
    // Handle image update
    if (data.imageFile) {
      formData.append('image', data.imageFile);
      console.log('📤 Updating author image file:', data.imageFile.name);
    } else if (data.image) {
      formData.append('imageUrl', data.image);
      console.log('📤 Updating author image URL:', data.image);
    }

    const response = await apiClient.put<ApiResponse<Author>>(
      `${AUTHORS_ENDPOINT}/update/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.result;
  },

  // PUT activate author
  activate: async (id: number): Promise<Author> => {
    const response = await apiClient.put<ApiResponse<Author>>(
      `${AUTHORS_ENDPOINT}/active/${id}`
    );
    return response.data.result;
  },

  // PUT deactivate author
  deactivate: async (id: number): Promise<Author> => {
    const response = await apiClient.put<ApiResponse<Author>>(
      `${AUTHORS_ENDPOINT}/inactive/${id}`
    );
    return response.data.result;
  },
};
