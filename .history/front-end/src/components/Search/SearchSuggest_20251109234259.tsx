import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce";
import { IoMdSearch } from "react-icons/io";
import { booksApi } from "../../api/endpoints/books.api";
import { authorsApi } from "../../api/endpoints/authors.api";
import type { Book, Author } from "../../types";

type Suggestion = {
  id: string | number;
  label: string;
  type: "book" | "author";
  subtitle?: string; // Author name for books, or bio for authors
};

export default function SearchSuggest() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1); // -1 means no selection (allow enter to search)
  const cache = useRef<Map<string, { items: Suggestion[]; total: number }>>(
    new Map()
  );
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Fetch suggestions from API
  useEffect(() => {
    if (!debouncedQ || debouncedQ.trim().length < 2) {
      setItems([]);
      setTotalResults(0);
      setOpen(false);
      setLoading(false);
      return;
    }

    const trimmedQ = debouncedQ.trim();
    const cached = cache.current.get(trimmedQ);
    if (cached) {
      setItems(cached.items);
      setTotalResults(cached.total);
      setOpen(true);
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);

    // Fetch both books and authors in parallel
    Promise.all([
      booksApi.search(trimmedQ).catch(() => [] as Book[]),
      authorsApi.search(trimmedQ).catch(() => [] as Author[]),
    ])
      .then(([books, authors]) => {
        if (ac.signal.aborted) return;

        // Convert to suggestions
        const bookSuggestions: Suggestion[] = books.slice(0, 7).map((book) => ({
          id: book.id,
          label: book.title,
          type: "book" as const,
          subtitle: book.authorName || undefined,
        }));

        const authorSuggestions: Suggestion[] = authors
          .slice(0, 3)
          .map((author) => ({
            id: author.id,
            label: author.name,
            type: "author" as const,
            subtitle: author.biography
              ? author.biography.substring(0, 60) + "..."
              : undefined,
          }));

        // Combine: books first, then authors
        const allSuggestions = [...bookSuggestions, ...authorSuggestions];
        const totalCount = books.length + authors.length;

        cache.current.set(trimmedQ, {
          items: allSuggestions,
          total: totalCount,
        });

        setItems(allSuggestions);
        setTotalResults(totalCount);
        setOpen(true);
        setLoading(false);
      })
      .catch((err) => {
        if (!ac.signal.aborted) {
          console.error("Search error:", err);
          setLoading(false);
        }
      });

    return () => ac.abort();
  }, [debouncedQ]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open && items.length > 0) {
        setOpen(true);
      }
      setHighlight((h) => Math.min(h + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1)); // -1 = no selection
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight >= 0 && items[highlight]) {
        // Select highlighted item
        selectItem(items[highlight]);
      } else if (q.trim()) {
        // No item selected, navigate to search results page
        navigateToSearchResults(q.trim());
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlight(-1);
    }
  }

  function selectItem(item: Suggestion) {
    setQ(item.label);
    setOpen(false);
    setHighlight(-1);
    
    // Navigate based on type
    if (item.type === "book") {
      navigate(`/books/${item.id}`);
    } else if (item.type === "author") {
      navigate(`/authors/${item.id}`);
    }
  }

  function navigateToSearchResults(query: string) {
    setOpen(false);
    setHighlight(-1);
    // Navigate to search results page with query parameter
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  function handleSearchButtonClick() {
    if (q.trim()) {
      navigateToSearchResults(q.trim());
    }
  }

  return (
    <div className="relative w-full max-w-lg">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setHighlight(-1);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (items.length > 0) setOpen(true);
          }}
          placeholder="Search books and authors..."
          className="w-full px-4 py-2 pr-10 transition-all border-b-2 border-transparent outline-none hover:border-beige-500 focus:border-beige-600"
        />
        <button
          onClick={handleSearchButtonClick}
          className="absolute -translate-y-1/2 right-2 top-1/2 hover:opacity-70"
          aria-label="Search"
          type="button"
        >
          <IoMdSearch className="w-6 h-6 text-beige-700" />
        </button>
      </div>

      {loading && (
        <div className="absolute z-10 w-full px-4 py-3 mt-1 text-sm text-center bg-white border rounded shadow">
          <span className="text-beige-600">Searching...</span>
        </div>
      )}

      {open && !loading && items.length > 0 && (
        <div className="absolute z-10 w-full mt-1 overflow-hidden bg-white border rounded shadow-lg">
          <ul className="max-h-96 overflow-y-auto">
            {items.map((it, idx) => (
              <li
                key={`${it.type}-${it.id}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectItem(it)}
                onMouseEnter={() => setHighlight(idx)}
                className={`px-4 py-3 cursor-pointer transition-colors border-b border-beige-100 last:border-b-0 ${
                  highlight === idx
                    ? "bg-beige-100"
                    : "hover:bg-beige-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-beige-900 truncate">
                      {it.label}
                    </div>
                    {it.subtitle && (
                      <div className="text-sm text-beige-600 truncate">
                        {it.subtitle}
                      </div>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      it.type === "book"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {it.type === "book" ? "Book" : "Author"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          
          {/* Footer with total results and hint */}
          <div className="px-4 py-3 bg-beige-50 border-t border-beige-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-beige-700">
                {totalResults} result{totalResults !== 1 ? "s" : ""} found
              </span>
              <span className="text-beige-600">
                Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-white border border-beige-300 rounded">Enter</kbd> to see all
              </span>
            </div>
          </div>
        </div>
      )}

      {open && !loading && items.length === 0 && q.trim().length >= 2 && (
        <div className="absolute z-10 w-full px-4 py-6 mt-1 text-center bg-white border rounded shadow">
          <div className="text-beige-600">
            <p className="mb-1 font-medium">No results found</p>
            <p className="text-sm">Try searching with different keywords</p>
          </div>
        </div>
      )}
    </div>
  );
}
