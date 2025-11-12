import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { booksApi } from "../api/endpoints/books.api";
import { authorsApi } from "../api/endpoints/authors.api";
import type { Book, Author } from "../types";
import { BookCard } from "../components/Home/BookCard";

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      booksApi.search(query).catch(() => [] as Book[]),
      authorsApi.search(query).catch(() => [] as Author[]),
    ])
      .then(([booksData, authorsData]) => {
        setBooks(booksData);
        setAuthors(authorsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Search error:", err);
        setError("Failed to load search results");
        setLoading(false);
      });
  }, [query]);

  const totalResults = books.length + authors.length;

  if (!query.trim()) {
    return (
      <div className="container px-4 py-12 mx-auto text-center">
        <h1 className="mb-4 text-3xl font-bold text-beige-900">Search</h1>
        <p className="text-beige-600">Enter a search term to find books and authors</p>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-beige-900">
          Search Results
        </h1>
        <p className="text-beige-600">
          Showing results for: <span className="font-semibold text-beige-800">"{query}"</span>
        </p>
        {!loading && (
          <p className="mt-1 text-sm text-beige-500">
            {totalResults} result{totalResults !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-b-2 rounded-full animate-spin border-beige-700"></div>
            <p className="mt-4 text-beige-600">Searching...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 text-red-700 border border-red-200 rounded-lg bg-red-50">
          {error}
        </div>
      )}

      {!loading && !error && totalResults === 0 && (
        <div className="py-20 text-center">
          <div className="mb-4 text-6xl">📚</div>
          <h2 className="mb-2 text-2xl font-bold text-beige-900">
            No results found
          </h2>
          <p className="mb-6 text-beige-600">
            We couldn't find anything matching "{query}"
          </p>
          <p className="mb-4 text-sm text-beige-500">Try:</p>
          <ul className="space-y-1 text-sm text-beige-600">
            <li>• Checking your spelling</li>
            <li>• Using different keywords</li>
            <li>• Searching for author names</li>
          </ul>
        </div>
      )}

      {!loading && !error && totalResults > 0 && (
        <div className="space-y-12">
          {/* Books Section */}
          {books.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-beige-900">
                  Books ({books.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          )}

          {/* Authors Section */}
          {authors.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-beige-900">
                  Authors ({authors.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {authors.map((author) => (
                  <Link
                    key={author.id}
                    to={`/authors/${author.id}`}
                    className="block p-6 transition-shadow bg-white border rounded-lg border-beige-200 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      {author.image ? (
                        <img
                          src={author.image}
                          alt={author.name}
                          className="object-cover w-16 h-16 rounded-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-16 h-16 text-xl font-semibold rounded-full bg-beige-200 text-beige-600">
                          {author.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="mb-1 text-lg font-semibold truncate text-beige-900">
                          {author.name}
                        </h3>
                        {author.biography && (
                          <p className="text-sm text-beige-600 line-clamp-2">
                            {author.biography}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
