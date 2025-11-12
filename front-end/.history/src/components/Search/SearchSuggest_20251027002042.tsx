import React, { useEffect, useRef, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { heroBookGroups } from "../../data/books";
import { seriesData } from "../../data/series";
import { IoMdSearch } from "react-icons/io";

type Suggestion = { id: string; label: string; type: "book" | "series" };

export default function SearchSuggest() {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const cache = useRef<Map<string, Suggestion[]>>(new Map());
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Combine data for suggestions
  const allData = [
    ...heroBookGroups.flat().map((book) => ({
      id: book.id.toString(),
      label: book.title,
      type: "book" as const,
    })),
    ...seriesData.map((series) => ({
      id: series.id.toString(),
      label: series.title,
      type: "series" as const,
    })),
  ];

  useEffect(() => {
    if (!debouncedQ) {
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

    // Simulate API call with local data
    setTimeout(() => {
      if (ac.signal.aborted) return;
      const filtered = allData
        .filter((item) =>
          item.label.toLowerCase().includes(debouncedQ.toLowerCase())
        )
        .slice(0, 10); // limit to 10
      cache.current.set(debouncedQ, filtered);
      setItems(filtered);
      setOpen(true);
      setLoading(false);
    }, 200); // simulate delay

    return () => ac.abort();
  }, [debouncedQ, allData]);

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
        aria-label="" 
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
