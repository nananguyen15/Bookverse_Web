import { BookCard } from "./BookCard";
import { heroBookGroups } from "../../data/books";
import type { Book } from "../../data/books";

export function Somebooks() {
  // Flatten heroBookGroups to get all books
  const allBooks: Book[] = heroBookGroups.flat();

  // Sort by soldCount if exists, otherwise by ID
  const topBooks = [...allBooks]
    .sort((a, b) => {
      const aSold = (a as Book & { soldCount?: number }).soldCount ?? 0;
      const bSold = (b as Book & { soldCount?: number }).soldCount ?? 0;

      if (aSold !== bSold) {
        return bSold - aSold;
      }

      return 0;
    })
    .slice(0, 5); // Changed from 6 to 5

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
