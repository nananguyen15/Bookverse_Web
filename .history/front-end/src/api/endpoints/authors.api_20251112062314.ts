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
    // If there's an image file, we need to upload it separately or use FormData
    // For now, let's try sending as JSON first to see if that works
    if (data.imageFile) {
      // Option 1: Try FormData approach
      const formData = new FormData();
      if (data.name) formData.append("name", data.name);
      if (data.bio) formData.append("bio", data.bio);
      if (data.birthDate) formData.append("birthDate", data.birthDate);
      if (data.nationality) formData.append("nationality", data.nationality);
      if (data.active !== undefined) formData.append("active", String(data.active));
      formData.append("image", data.imageFile);
      
      console.log("📤 Uploading author with image file via FormData");
      
      const response = await apiClient.post<ApiResponse<Author>>(
        `${AUTHORS_ENDPOINT}/create`,
        formData,
        {
          headers: {
            // Remove Content-Type to let browser set it with boundary
          },
        }
      );
      return response.data.result;
    } else {
      // Option 2: Send as JSON without file
      const jsonData: any = {
        name: data.name,
        bio: data.bio,
      };
      if (data.birthDate) jsonData.birthDate = data.birthDate;
      if (data.nationality) jsonData.nationality = data.nationality;
      if (data.active !== undefined) jsonData.active = data.active;
      if (data.image) jsonData.image = data.image;

      console.log("📤 Creating author via JSON:", jsonData);
      
      const response = await apiClient.post<ApiResponse<Author>>(
        `${AUTHORS_ENDPOINT}/create`,
        jsonData
      );
      return response.data.result;
    }
  },

  // PUT update author
  update: async (id: number, data: any): Promise<Author> => {
    const formData = new FormData();

    // Add only provided fields
    if (data.name) formData.append("name", data.name);
    if (data.bio) formData.append("bio", data.bio);
    if (data.birthDate) formData.append("birthDate", data.birthDate);
    if (data.nationality) formData.append("nationality", data.nationality);

    // Handle image update
    if (data.imageFile) {
      formData.append("image", data.imageFile);
      console.log("📤 Updating author image file:", data.imageFile.name);
    } else if (data.image) {
      formData.append("imageUrl", data.image);
      console.log("📤 Updating author image URL:", data.image);
    }

    const response = await apiClient.put<ApiResponse<Author>>(
      `${AUTHORS_ENDPOINT}/update/${id}`,
      formData
      // Don't set Content-Type header - let browser set it automatically with boundary
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
