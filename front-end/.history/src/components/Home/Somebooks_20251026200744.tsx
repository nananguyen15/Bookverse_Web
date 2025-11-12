import { BookCard } from "./BookCard";
import { heroBookGroups } from "../../data/books";
import type { Book } from "../../data/books";

export function Somebooks() {
  try {
    // Flatten heroBookGroups thành mảng Book[]
    const allBooks: Book[] = heroBookGroups.flat();

    console.log("All books:", allBooks);
    console.log("Books length:", allBooks?.length);

    // Get top 6 books - vì không có soldCount, lấy 6 cuốn đầu
    const topBooks = allBooks.slice(0, 6);

    console.log("Top books:", topBooks);

    const handleAddToCart = (bookId: string) => {
      console.log("Add to cart:", bookId);
    };

    // Fallback if no books
    if (!allBooks || allBooks.length === 0) {
      return (
        <div className="px-16 py-6 bg-yellow-50">
          <div className="text-center">
            <p className="text-lg text-beige-700">No books available</p>
          </div>
        </div>
      );
    }

    return (
      <div className="px-16 py-6 bg-white">
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
  } catch (error) {
    console.error("Somebooks error:", error);
    return (
      <div className="px-16 py-6 bg-red-50">
        <div className="text-center">
          <p className="text-lg text-red-700">Error loading books</p>
          <p className="text-sm text-red-600">{String(error)}</p>
        </div>
      </div>
    );
  }
}

export function SomebooksSimple() {
  return (
    <div style={{ padding: "40px", backgroundColor: "#f0f0f0", minHeight: "200px" }}>
      <h2 style={{ fontSize: "32px", color: "#000", marginBottom: "20px" }}>
        TEST - Best Sellers Section
      </h2>
      <p style={{ fontSize: "18px", color: "#333" }}>
        If you can see this text, the component is rendering!
      </p>
      <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#fff", border: "2px solid red" }}>
        <p>Red border box - testing visibility</p>
      </div>
    </div>
  );
}
