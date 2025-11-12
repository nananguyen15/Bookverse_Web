import type { Book } from "../../data/books";

type BookCardProps = {
  book: Book;
  onAddToCart?: (bookId: string) => void;
};

export function BookCard({ book, onAddToCart }: BookCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(book.id);
  };

  return (
    <a
      href={`/books/${book.id}`}
      className="group block w-48 sm:w-56 md:w-64 flex-shrink-0 transition-transform hover:scale-105"
    >
      {/* Book Cover */}
      <div className="relative w-full h-64 sm:h-72 md:h-80 mb-3 overflow-hidden rounded-lg bg-gray-200">
        <img
          src={book.image ?? "/placeholder-book.jpg"}
          alt={book.title}
          className="object-cover w-full h-full"
          loading="lazy"
        />

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 p-2 bg-beige-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-beige-800"
          aria-label="Add to cart"
        >
          {/* Shopping Cart SVG Icon */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </button>
      </div>

      {/* Book Info */}
      <div className="space-y-1">
        <h3 className="text-base font-bold text-beige-900 line-clamp-2 font-heading">
          {book.title}
        </h3>
        <p className="text-sm text-beige-600 line-clamp-1">{book.author}</p>
        <p className="text-lg font-semibold text-beige-800">
          ${book.price.toFixed(2)}
        </p>
      </div>
    </a>
  );
}
