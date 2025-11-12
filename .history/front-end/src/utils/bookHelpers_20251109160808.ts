import type { Book, Author, Publisher, Category } from "../types";

/**
 * Map book data with author, publisher, and category names
 * Also fixes image paths from backend
 */
export function mapBookWithNames(
  book: Book | null | undefined,
  authors: Author[],
  publishers: Publisher[],
  categories?: Category[]
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
    authorName: author?.name || `Author ${book.authorId}`,
    publisherName: publisher?.name || `Publisher ${book.publisherId}`,
    categoryName: category?.name || undefined,
    // Fix image path: backend returns /src/assets/img/... but Vite public folder is at /img/...
    // public/img/book/hp1.webp -> accessed as /img/book/hp1.webp
    image:
      book.image?.replace("/src/assets/img/", "/img/") ||
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
  categories?: Category[]
): Book[] {
  return books.map((book) =>
    mapBookWithNames(book, authors, publishers, categories)
  );
}
