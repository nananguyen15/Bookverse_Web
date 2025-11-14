import { client } from '../client';

/**
 * Upload API
 * Handles file uploads to backend
 */

export interface UploadResponse {
  path: string; // DB path like "/src/assets/img/avatar/123-photo.jpg"
}

/**
 * Upload an image file to the server
 * @param file - The image file to upload
 * @param folder - Folder name: 'book' | 'author' | 'publisher' | 'avatar' | 'series'
 * @returns DB path to save in database
 */
export const uploadImage = async (
  file: File,
  folder: 'book' | 'author' | 'publisher' | 'avatar' | 'series'
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await client.post<string>('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data; // Returns DB path like "/src/assets/img/avatar/123-photo.jpg"
};

export const uploadApi = {
  uploadImage,
};
