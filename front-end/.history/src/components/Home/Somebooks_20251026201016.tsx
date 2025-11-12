import { BookCard } from "./BookCard";

export function Somebooks() {
  // Debug: check what we're getting

  // Get top 6 books by sales (assuming higher soldCount = best sellers)
  const topBooks = books
    ? [...books]
        .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
        .slice(0, 6)
    : [];

  console.log("Top books:", topBooks);

  const handleAddToCart = (bookId: string) => {
    // TODO: Implement add to cart logic
    console.log("Add to cart:", bookId);
  };

  // Fallback if no books
  if (!books || books.length === 0) {
    return (
      <div className="grid grid-cols-12 px-16 py-6">
        <div className="col-span-12 text-center">
          <p className="text-beige-700">No books available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 px-16 py-6">
      {/* Title and See All */}
      <div className="flex items-center justify-between col-span-12 my-5">
        <h2 className="text-3xl font-bold font-heading text-beige-900">
          Best Sellers ({topBooks.length} books)
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
        {topBooks.length > 0 ? (
          topBooks.map((book) => (
            <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
          ))
        ) : (
          <div className="text-beige-700">No top books found</div>
        )}
      </div>
    </div>
  );
}
