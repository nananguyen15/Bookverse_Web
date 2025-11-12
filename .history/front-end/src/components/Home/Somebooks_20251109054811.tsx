import { useState, useEffect } from "react";
import { BookCard } from "./BookCard";
import type { Book } from "../../types";
import { useCart } from "../../contexts/CartContext";
import { booksApi, authorsApi, publishersApi } from "../../api";
import { mapBooksWithNames } from "../../utils/bookHelpers";

interface SomebooksProps {
  title?: string;
}

export function Somebooks({ title = "Books" }: SomebooksProps) {
  const { addToCart } = useCart();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const [booksData, authorsData, publishersData] = await Promise.all([
          booksApi.getActive(),
          authorsApi.getActive(),
          publishersApi.getActive(),
        ]);

        // Map books with author/publisher names and fix image paths
        const booksWithNames = mapBooksWithNames(
          booksData,
          authorsData,
          publishersData
        );

        // Lấy 5 books đầu tiên
        // TODO: Khi có soldCount, sort theo soldCount DESC
        setBooks(booksWithNames.slice(0, 5));
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleAddToCart = (bookId: string | number) => {
    addToCart(String(bookId), "book", 1);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-12 px-16 py-6">
        <div className="col-span-12 text-center py-8">
          <p className="text-brown-600">Đang tải sách...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 px-16 py-6">
      {/* Title and See All */}
      <div className="flex items-center justify-between col-span-12 my-5">
        <h2 className="text-3xl font-bold font-heading text-beige-900">
          Books
        </h2>
        <a
          href="/allbooks"
          className="text-base font-medium transition-colors text-beige-700 hover:text-beige-900 hover:underline"
        >
          See All →
        </a>
      </div>

      {/* Books Grid */}
      <div className="flex flex-row items-start justify-between col-span-12 gap-8 pb-4 overflow-x-auto">
        {books.map((book) => (
          <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
        ))}
      </div>
    </div>
  );
}
