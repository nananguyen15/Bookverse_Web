import apiClient from '../config/api';

/**
 * Book Service - Xử lý tất cả API calls liên quan đến books
 */
const bookService = {
  /**
   * Lấy tất cả sách
   */
  getAllBooks: async () => {
    try {
      const response = await apiClient.get('/books');
      return response.result || [];
    } catch (error) {
      console.error('Error fetching all books:', error);
      throw error;
    }
  },

  /**
   * Lấy sách theo ID
   */
  getBookById: async (bookId) => {
    try {
      const response = await apiClient.get(`/books/${bookId}`);
      return response.result || null;
    } catch (error) {
      console.error(`Error fetching book ${bookId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách sách đang active
   */
  getActiveBooks: async () => {
    try {
      const response = await apiClient.get('/books/active');
      return response.result || [];
    } catch (error) {
      console.error('Error fetching active books:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách sách inactive
   */
  getInactiveBooks: async () => {
    try {
      const response = await apiClient.get('/books/inactive');
      return response.result || [];
    } catch (error) {
      console.error('Error fetching inactive books:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách sách random (dùng cho hero slider)
   */
  getRandomActiveBooks: async () => {
    try {
      const response = await apiClient.get('/books/active/random');
      return response.result || [];
    } catch (error) {
      console.error('Error fetching random books:', error);
      throw error;
    }
  },

  /**
   * Tạo sách mới (Admin only)
   */
  createBook: async (bookData) => {
    try {
      const response = await apiClient.post('/books/create', bookData);
      return response.result;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  },

  /**
   * Cập nhật sách (Admin only)
   */
  updateBook: async (bookId, bookData) => {
    try {
      const response = await apiClient.put(`/books/update/${bookId}`, bookData);
      return response.result;
    } catch (error) {
      console.error(`Error updating book ${bookId}:`, error);
      throw error;
    }
  },

  /**
   * Inactive sách (Admin only)
   */
  inactiveBook: async (bookId) => {
    try {
      const response = await apiClient.put(`/books/inactive/${bookId}`);
      return response.result;
    } catch (error) {
      console.error(`Error inactivating book ${bookId}:`, error);
      throw error;
    }
  },

  /**
   * Active sách (Admin only)
   */
  activeBook: async (bookId) => {
    try {
      const response = await apiClient.put(`/books/active/${bookId}`);
      return response.result;
    } catch (error) {
      console.error(`Error activating book ${bookId}:`, error);
      throw error;
    }
  },
};

export default bookService;
