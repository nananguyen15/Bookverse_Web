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
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = items[highlight];
      if (sel) selectItem(sel);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function selectItem(item: Suggestion) {
    setQ(item.label);
    setOpen(false);
    // Navigate to item page
    window.location.href = `/${item.type}/${item.id}`;
  }

  return (
    <div className="relative w-full max-w-lg">
      <input
        ref={inputRef}
        type="text"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setHighlight(0);
        }}
        aria-label="Search books"
        onKeyDown={onKeyDown}
        aria-autocomplete="list"
        aria-controls="suggest-list"
        aria-expanded={open}
        aria-activedescendant={open ? `sugg-${highlight}` : undefined}
        placeholder="Search books..."
        className="w-64 px-2 py-1 transition-all border-b-2 border-transparent outline-none hover:border-beige-500"
      />
      <button
        className="absolute -translate-y-1/2 search-btn right-2 top-1/2"
        aria-label="Search"
      >
        <IoMdSearch className="mr-3 w-7 h-7 text-beige-700" />
      </button>
      {loading && (
        <div className="absolute text-sm text-gray-500 right-2 top-2">
          Loading...
        </div>
      )}

      {open && items.length > 0 && (
        <ul
          id="suggest-list"
          role="listbox"
          className="absolute z-10 w-full mt-1 bg-white border rounded shadow"
          aria-label="suggest-list"
        >
          {items.map((it, idx) => (
            <li
              key={it.id}
              id={`sugg-${idx}`}
              role="option"
              aria-selected={highlight === idx ? "true" : "false"}
              onMouseDown={(e) => e.preventDefault()} // keep focus on input
              onClick={() => selectItem(it)}
              onMouseEnter={() => setHighlight(idx)}
              className={`px-3 py-2 cursor-pointer ${
                highlight === idx ? "bg-blue-100" : "hover:bg-gray-50"
              }`}
            >
              {it.label} ({it.type})
            </li>
          ))}
        </ul>
      )}
      {open && !loading && items.length === 0 && (
        <div className="absolute z-10 w-full px-3 py-2 mt-1 text-gray-500 bg-white border rounded">
          No results
        </div>
      )}
    </div>
  );
}
