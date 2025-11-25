import { BaseCard } from "./BaseCard";
import type { Book } from "../../types";

type BookCardProps = {
  book: Book;
  onAddToCart?: (bookId: string) => void;
  active?: boolean;
  stockQuantity?: number;
  promoPrice?: number | null;
  promoPercentage?: number | null;
};

// Convert title to URL-friendly slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove consecutive hyphens
    .trim();
}

export function BookCard({ book, onAddToCart, active, stockQuantity, promoPrice, promoPercentage }: BookCardProps) {
  if (!book) {
    return null;
  }

  return (
    <BaseCard
      id={book.id}
      title={book.title}
      author={book.authorName || String(book.authorId)}
      price={book.price}
      image={book.image ?? "/placeholder-book.jpg"}
      layout="vertical"
      onAddToCart={onAddToCart ? (id) => onAddToCart(String(id)) : undefined}
      detailUrl={`/book/${book.id}/${slugify(book.title)}`}
      active={active ?? book.active}
      stockQuantity={stockQuantity ?? book.stockQuantity}
      promoPrice={promoPrice}
      promoPercentage={promoPercentage}
    />
  );
}
