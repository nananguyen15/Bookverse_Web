import { useState, useEffect } from "react";
import { BookCard } from "./BookCard";
import bookService from "../../services/bookService";
import type { Book } from "../../types/api";
import { useCart } from "../../contexts/CartContext";

export function Somebooks() {
  const { addToCart } = useCart();
  const [topBooks, setTopBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const activeBooks = await bookService.getActiveBooks();
        // Lấy 5 cuốn đầu tiên
        setTopBooks(activeBooks.slice(0, 5));
      } catch (error) {
        console.error('Error fetching books:', error);
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
      <section className="bg-[#f5f5f0] py-16">
        <div className="container mx-auto px-4">
          <p className="text-center">Loading books...</p>
        </div>
      </section>
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
        {topBooks.map((book) => (
          <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
        ))}
      </div>
    </div>
  );
}
