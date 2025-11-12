import { BsCart2  } from "react-icons/bs";
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
      className="flex-shrink-0 block w-48 transition-transform group sm:w-56 md:w-64 hover:scale-105"
    >
      {/* Book Cover */}
      <div className="relative w-full h-64 mb-3 overflow-hidden bg-gray-200 rounded-lg sm:h-72 md:h-80">
        <img
          src={book.image ?? "/placeholder-book.jpg"}
          alt={book.title}
          className="object-cover w-full h-full"
          loading="lazy"
        />

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="absolute p-2 text-white transition-opacity rounded-full opacity-0 bottom-3 right-3 bg-beige-700 group-hover:opacity-100 hover:bg-beige-800"
          aria-label="Add to cart"
        >
          <ShoppingCart className="w-5 h-5" />
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
