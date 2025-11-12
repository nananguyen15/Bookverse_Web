import { BaseCard } from "./BaseCard";
import type { Book } from "../../data/books";

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
      author={book.authorId}
      price={book.price}
      image={book.image ?? "/placeholder-book.jpg"}
      layout="vertical"
      onAddToCart={onAddToCart}
      detailUrl={`/books/${book.id}`}
    />
  );
}
