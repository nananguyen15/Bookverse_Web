import { BookCard } from "./BookCard";

export function Somebooks() {
  // Mock data for testing
  const mockBooks = [
    {
      id: "1",
      title: "Sample Book 1",
      author: "Author 1",
      price: 19.99,
      image: "/placeholder-book.jpg",
    },
    {
      id: "2",
      title: "Sample Book 2",
      author: "Author 2",
      price: 24.99,
      image: "/placeholder-book.jpg",
    },
    {
      id: "3",
      title: "Sample Book 3",
      author: "Author 3",
      price: 15.99,
      image: "/placeholder-book.jpg",
    },
  ];

  const handleAddToCart = (bookId: string) => {
    console.log("Add to cart:", bookId);
  };

  return (
    <div className="px-16 py-6 bg-white">
      {/* Title and See All */}
      <div className="flex items-center justify-between mb-6">
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
      <div className="flex flex-row gap-5 overflow-x-auto pb-4">
        {mockBooks.map((book) => (
          <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
        ))}
      </div>
    </div>
  );
}
