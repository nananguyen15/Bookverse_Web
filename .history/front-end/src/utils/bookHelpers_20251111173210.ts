import type { Book } from "../types";
import type { Author, Publisher } from "../types";

/**
 * Map book data with author and publisher names
 * Also fixes image paths from backend
 */
export function mapBookWithNames(
  book: Book | null | undefined,
  authors: Author[],
  publishers: Publisher[]
): Book | null {
  if (!book) {
    console.error("mapBookWithNames: book is null or undefined");
    return null;
  }

  const author = authors.find((a) => a.id === book.authorId);
  const publisher = publishers.find((p) => p.id === book.publisherId);

  return {
    ...book,
    authorName: author?.name || `Author ${book.authorId}`,
    publisherName: publisher?.name || `Publisher ${book.publisherId}`,
    // Backend now stores /img/... directly, but keep backward compatibility
    image:
      book.image?.startsWith("/img/") 
        ? book.image 
        : book.image?.replace("/src/assets/img/", "/img/") || "/img/book/placeholder.jpg",
  };
}

/**
 * Map multiple books with author and publisher names
 */
export function mapBooksWithNames(
  books: Book[],
  authors: Author[],
  publishers: Publisher[]
): Book[] {
  return books.map((book) => mapBookWithNames(book, authors, publishers));
}
