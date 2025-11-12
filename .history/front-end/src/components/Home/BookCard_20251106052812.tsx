import { BaseCard } from "./BaseCard";
import type { Book } from "../../types";

type BookCardProps = {
  book: Book;
  onAddToCart?: (bookId: string) => void;
};

export function BookCard({ book, onAddToCart }: BookCardProps) {
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
      detailUrl={`/book/${book.id}`}
    />
  );
}
