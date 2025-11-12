import { BookCard } from "./BookCard";
import { books } from "../../data/books";

export function Somebooks() {
  // Get top 6 books by sales (assuming higher soldCount = best sellers)
  const topBooks = [...books]
    .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    .slice(0, 6);

  const handleAddToCart = (bookId: string) => {
    // TODO: Implement add to cart logic
    console.log("Add to cart:", bookId);
  };

  return (
    <div className="grid grid-cols-12 px-16 py-6">
      {/* Title and See All */}
      <div className="col-span-12 flex items-center justify-between my-5">
        <h2 className="text-3xl font-bold font-heading text-beige-900">
          Best Sellers
        </h2>
        <a
          href="/books"
          className="text-base font-medium text-beige-700 hover:text-beige-900 transition-colors hover:underline"
        >
          See All →
        </a>
      </div>

      {/* Books Grid */}
      <div className="flex flex-row items-start justify-start col-span-12 gap-5 overflow-x-auto pb-4">
        {topBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
}
