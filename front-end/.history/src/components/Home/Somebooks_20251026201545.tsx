import { BookCard } from "./BookCard";
import { heroBookGroups } from "../../data/books";
import type { Book } from "../../data/books";

export function Somebooks() {
  // Flatten heroBookGroups to get all books
  const allBooks: Book[] = heroBookGroups.flat();

  // Sort by soldCount if exists, otherwise by ID (books that appear first in data)
  const topBooks = [...allBooks]
    .sort((a, b) => {
      const aSold = (a as any).soldCount || 0;
      const bSold = (b as any).soldCount || 0;

      // If both have soldCount, sort by that
      if (aSold !== bSold) {
        return bSold - aSold;
      }

      // Otherwise maintain original order (first in data = first displayed)
      return 0;
    })
    .slice(0, 6);

  const handleAddToCart = (bookId: string) => {
    console.log("Add to cart:", bookId);
    // TODO: Implement add to cart logic
  };

  return (
    <div className="grid grid-cols-12 px-16 py-6">
      {/* Title and See All */}
      <div className="flex items-center justify-between col-span-12 my-5">
        <h2 className="text-3xl font-bold font-heading text-beige-900">
          Books
        </h2>
        <a
          href="/books"
          className="text-base font-medium transition-colors text-beige-700 hover:text-beige-900 hover:underline"
        >
          See All →
        </a>
      </div>

      {/* Books Grid */}
      <div className="flex flex-row items-start justify-start col-span-12 gap-5 pb-4 overflow-x-auto">
        {topBooks.map((book) => (
          <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
        ))}
      </div>
    </div>
  );
}
