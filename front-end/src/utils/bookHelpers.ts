import type { Book } from "../types";
import type { Author, Publisher, SubCategory } from "../types";

/**
 * Format date to dd/mm/yyyy format
 */
export function formatDateToDDMMYYYY(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Map book data with author, publisher, and category names
 * Also fixes image paths from backend
 */
export function mapBookWithNames(
  book: Book | null | undefined,
  authors: Author[],
  publishers: Publisher[],
  categories?: SubCategory[]
): Book | null {
  if (!book) {
    console.error("mapBookWithNames: book is null or undefined");
    return null;
  }

  const author = authors.find((a) => a.id === book.authorId);
  const publisher = publishers.find((p) => p.id === book.publisherId);
  const category = categories?.find((c) => c.id === book.categoryId);

  return {
    ...book,
    authorName: author?.name || "Unknown",
    publisherName: publisher?.name || "Unknown",
    categoryName: category?.name || "Unknown",
    // Backend now stores /img/... directly, but keep backward compatibility
    image: book.image?.startsWith("/img/")
      ? book.image
      : book.image?.replace("/src/assets/img/", "/img/") ||
        "/img/book/placeholder.jpg",
  };
}

/**
 * Map multiple books with author, publisher, and category names
 */
export function mapBooksWithNames(
  books: Book[],
  authors: Author[],
  publishers: Publisher[],
  categories?: SubCategory[]
): Book[] {
  return books
    .map((book) => mapBookWithNames(book, authors, publishers, categories))
    .filter((book): book is Book => book !== null);
}
