import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce";
import { IoMdSearch } from "react-icons/io";
import { booksApi } from "../../api";

type Suggestion = {
  id: string;
  label: string;
  type: "book" | "series";
  authorName?: string;
};

export default function SearchSuggest() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const cache = useRef<Map<string, Suggestion[]>>(new Map());
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!debouncedQ || debouncedQ.trim().length < 2) {
      setItems([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const cached = cache.current.get(debouncedQ);
    if (cached) {
      setItems(cached);
      setOpen(true);
      return;
    }

    abortRef.current?.abort(); // cancel previous
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);

    // Fetch from Books API
    const fetchResults = async () => {
      try {
        const books = await booksApi.getAll();
        console.log(`Total books from API: ${books.length}`);

        if (ac.signal.aborted) return;

        // Normalize search query: lowercase and remove dots, spaces, special chars
        const normalizeString = (str: string) =>
          str.toLowerCase().replace(/[.\s-]/g, '');

        const normalizedQuery = normalizeString(debouncedQ);
        console.log(`Normalized query: "${normalizedQuery}"`);

        // Filter books by search query - check title, author name, and author bio
        const filtered = books
          .filter((book) => {
            const normalizedTitle = normalizeString(book.title || '');
            const normalizedAuthorName = normalizeString(book.author?.name || '');
            const normalizedAuthorBio = normalizeString(book.author?.bio || '');

            const titleMatch = normalizedTitle.includes(normalizedQuery);
            const authorNameMatch = normalizedAuthorName.includes(normalizedQuery);
            const authorBioMatch = normalizedAuthorBio.includes(normalizedQuery);

            // Debug first book that matches
            if (titleMatch || authorNameMatch || authorBioMatch) {
              console.log(`Match found: "${book.title}"`, {
                authorObject: book.author,
                authorName: book.author?.name,
                bookId: book.id,
                bookIdType: typeof book.id
              });
            }

            return titleMatch || authorNameMatch || authorBioMatch;
          })
          .slice(0, 10) // limit to 10
          .map((book) => {
            // Ensure id is string - handle both string and object cases
            const bookId = typeof book.id === 'string' ? book.id : String(book.id);

            return {
              id: bookId,
              label: book.title,
              type: "book" as const,
              authorName: book.author?.name || "Unknown Author",
            };
          });

        console.log(`Search for "${debouncedQ}" found ${filtered.length} results`, filtered);

        cache.current.set(debouncedQ, filtered);
        setItems(filtered);
        setOpen(true);
        setLoading(false);
      } catch (error) {
        if (ac.signal.aborted) return;
        console.error("Search error:", error);
        setItems([]);
        setOpen(true);
        setLoading(false);
      }
    };

    fetchResults();

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
    console.log("Selected item:", item);
    setQ("");
    setOpen(false);
    // Navigate to book detail page - use singular "book" to match ProductDetail component
    navigate(`/book/${item.id}`);
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
        aria-expanded={open ? "true" : "false"}
        aria-activedescendant={open ? `sugg-${highlight}` : undefined}
        placeholder="Search books..."
        className="w-64 px-2 py-1 bg-beige-50 transition-all border-0 border-b-2 border-beige-700 outline-none focus:border-beige-900"
      />
      <button
        type="button"
        className="absolute -translate-y-1/2 search-btn right-2 top-1/2"
        aria-label="Search"
        title="Search"
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
          className="absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-lg border-beige-200 max-h-96 overflow-y-auto"
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
              className={`px-4 py-3 cursor-pointer border-b border-beige-100 last:border-b-0 transition-colors ${highlight === idx
                ? "bg-beige-100 text-beige-900"
                : "bg-white hover:bg-beige-50 text-beige-800"
                }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{it.label}</div>
                  {it.authorName && (
                    <div className="text-xs text-beige-500 mt-0.5 truncate">
                      by {it.authorName}
                    </div>
                  )}
                </div>
                <span className="text-xs text-beige-500 capitalize px-2 py-0.5 bg-beige-100 rounded shrink-0">
                  {it.type}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {open && !loading && items.length === 0 && (
        <div className="absolute z-50 w-full px-4 py-3 mt-2 text-center bg-white border rounded-lg shadow-lg text-beige-500 border-beige-200">
          No results
        </div>
      )}
    </div>
  );
}
