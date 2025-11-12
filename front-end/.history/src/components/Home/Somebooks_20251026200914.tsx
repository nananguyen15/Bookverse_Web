import { BookCard } from "./BookCard";
import { heroBookGroups } from "../../data/books";

export function Somebooks() {
  // Flatten heroBookGroups to get all books
  const allBooks = heroBookGroups.flat();
  
  console.log("heroBookGroups:", heroBookGroups);
  console.log("All books flattened:", allBooks);
  console.log("Books length:", allBooks?.length);

  // Get top 6 books
  const topBooks = allBooks.slice(0, 6);

  console.log("Top books:", topBooks);

  const handleAddToCart = (bookId: string) => {
    console.log("Add to cart:", bookId);
  };

  // Fallback if no books
  if (!allBooks || allBooks.length === 0) {
    return (
      <div className="px-16 py-6" style={{ backgroundColor: "#ffcccc", minHeight: "200px" }}>
        <div className="text-center">
          <p style={{ fontSize: "20px", color: "#cc0000" }}>No books available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-16 py-6" style={{ backgroundColor: "#f9f9f9", minHeight: "300px" }}>
      {/* Title and See All */}
      <div className="flex items-center justify-between mb-6">
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
      <div className="flex flex-row gap-5 pb-4 overflow-x-auto">
        {topBooks.map((book) => (
          <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
        ))}
      </div>
    </div>
  );
}
