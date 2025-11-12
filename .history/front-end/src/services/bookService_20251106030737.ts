import apiClient from '../config/api';
import { BookResponse, mapBook, Book, APIResponse } from '../types/api';

/**
 * Book Service - Xử lý tất cả API calls liên quan đến books
 */
const bookService = {
  /**
   * Lấy tất cả sách
   */
  getAllBooks: async (): Promise<Book[]> => {
    try {
      const response: APIResponse<BookResponse[]> = await apiClient.get('/books');
      return (response.result || []).map(mapBook);
    } catch (error) {
      console.error('Error fetching all books:', error);
      return [];
    }
  },

  /**
   * Lấy sách theo ID
   */
  getBookById: async (bookId: string | number): Promise<Book | null> => {
    try {
      const response: BookResponse = await apiClient.get(`/books/${bookId}`);
      return mapBook(response);
    } catch (error) {
      console.error(`Error fetching book ${bookId}:`, error);
      return null;
    }
  },

  /**
   * Lấy danh sách sách đang active
   */
  getActiveBooks: async (): Promise<Book[]> => {
    try {
      const response: APIResponse<BookResponse[]> = await apiClient.get('/books/active');
      return (response.result || []).map(mapBook);
    } catch (error) {
      console.error('Error fetching active books:', error);
      return [];
    }
  },

  /**
   * Lấy danh sách sách random (dùng cho hero slider)
   */
  getRandomActiveBooks: async (): Promise<Book[]> => {
    try {
      const response: APIResponse<BookResponse[]> = await apiClient.get('/books/active/random');
      return (response.result || []).map(mapBook);
    } catch (error) {
      console.error('Error fetching random books:', error);
      return [];
    }
  },

  /**
   * Tìm kiếm sách theo tiêu đề
   */
  searchBooks: async (keyword: string): Promise<Book[]> => {
    try {
      const allBooks = await bookService.getAllBooks();
      return allBooks.filter(book => 
        book.title.toLowerCase().includes(keyword.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching books:', error);
      return [];
    }
  },
};

export default bookService;
