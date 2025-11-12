import type { Book } from "../types";
import type { Author, Publisher } from "../types";

/**
 * Map book data with author and publisher names
 * Also fixes image paths from backend (replaces /src/assets with /assets)
 */
export function mapBookWithNames(
  book: Book,
  authors: Author[],
  publishers: Publisher[]
): Book {
  const author = authors.find((a) => a.id === book.authorId);
  const publisher = publishers.find((p) => p.id === book.publisherId);

  return {
    ...book,
    authorName: author?.name || `Author ${book.authorId}`,
    publisherName: publisher?.name || `Publisher ${book.publisherId}`,
    // Fix image path: backend returns /src/assets/img/... but Vite serves from /assets/img/...
    image: book.image.replace("/src/assets", "/assets"),
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
