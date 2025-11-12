import { BookCard } from "./BookCard";
// import module safely to handle named or default exports
import * as bookData from "../../data/books";

export function Somebooks() {
  // Helper: try several possible property names for "sold count / popularity"
  const getPopularity = (book: any): number =>
    book?.soldCount ??
    book?.sold ??
    book?.sales ??
    book?.copiesSold ??
    book?.popularity ??
    0;

  // Resolve heroBookGroups from module (support named or default export), ensure array
  const resolvedGroups =
    (bookData as any).heroBookGroups ??
    (bookData as any).default ??
    [];
  const allBooks = Array.isArray(resolvedGroups) ? (resolvedGroups as any).flat() : [];

  const topBooks = [...allBooks]
    .sort((a, b) => getPopularity(b) - getPopularity(a))
    .slice(0, 6);

  const handleAddToCart = (bookId: string) => {
    // TODO: Implement add to cart logic
    console.log("Add to cart:", bookId);
  };

  return (
    <div className="grid grid-cols-12 px-16 py-6">
      {/* Title and See All */}
      <div className="flex items-center justify-between col-span-12 my-5">
        <h2 className="text-3xl font-bold font-heading text-beige-900">
          Best Sellers
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
