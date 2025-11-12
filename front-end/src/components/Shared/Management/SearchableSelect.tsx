import { useState, useRef, useEffect } from "react";

interface Option {
  value: number;
  label: string;
}

interface SearchableSelectProps {
  value: number;
  onChange: (value: number) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  required = false,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || "";

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
          setSearchTerm("");
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        break;
    }
  };

  const handleOptionClick = (optionValue: number) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setHighlightedIndex(0);
          }}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent ${disabled ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map((option, index) => (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-3 py-2 cursor-pointer transition-colors ${index === highlightedIndex
                  ? "bg-beige-100 text-beige-900"
                  : "hover:bg-gray-50"
                } ${option.value === value ? "font-semibold bg-beige-50" : ""}`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && filteredOptions.length === 0 && searchTerm && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-3 py-2 text-gray-500 text-center">
            No results found for "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
}
