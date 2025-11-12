import { BsCart2 } from "react-icons/bs";
import type { Book } from "../../data/books";

type BookCardProps = {
  book: Book;
  onAddToCart?: (bookId: string) => void;
};

export function BookCard({ book, onAddToCart }: BookCardProps) {
  if (!book) {
    return null;
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(book.id);
  };

  const soldCount = (book as any).soldCount || 0;

  return (
    <a
      href={`/books/${book.id}`}
      className="block w-48 shrink-0 group sm:w-56 md:w-64"
    >
      {/* Book Cover */}
      <div className="relative w-full h-64 mb-3 bg-gray-200 rounded-lg gap36 sm:h-72 md:h-80">
        <img
          src={book.image ?? "/placeholder-book.jpg"}
          alt={book.title}
          className="object-cover w-full h-full"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-book.jpg";
          }}
        />
      </div>

      {/* Book Info */}
      <div className="space-y-1">
        <h3 className="text-base font-bold text-beige-900 line-clamp-2 font-heading">
          {book.title}
        </h3>
        <p className="text-sm text-beige-600 line-clamp-1">{book.authorId}</p>

        {/* Sold Count */}
        {soldCount > 0 && (
          <p className="text-xs text-beige-500">Sold: {soldCount}</p>
        )}

        {/* Price and Cart Icon */}
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-beige-800">
            ${book.price.toFixed(2)}
          </p>
          <button
            onClick={handleAddToCart}
            className="p-2 text-white transition-colors rounded-full bg-beige-700 hover:bg-beige-800"
            aria-label="Add to cart"
          >
            <BsCart2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </a>
  );
}
