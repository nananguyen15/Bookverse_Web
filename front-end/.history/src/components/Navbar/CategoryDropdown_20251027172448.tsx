import { useState, useRef } from "react";
import { categories } from "../../data/categories";

export function CategoryDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    // Nếu có hẹn giờ đóng menu, hãy hủy nó đi
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // Hẹn giờ đóng menu sau 200ms
    timerRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Giữ nguyên UI của link "Category" */}
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="inline-block text-gray-800 transition-colors group hover:text-beige-900 font-heading"
      >
        <span className="relative z-10">Category</span>
        <span className="block max-w-0 group-hover:max-w-full transition-all duration-200 h-0.5 bg-beige-300 mt-1" />
      </a>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-screen max-w-4xl z-50">
          <div className="bg-white border shadow-lg border-beige-200 rounded-lg">
            <div className="grid grid-cols-3 gap-8 p-8">
              {categories.map((category) => (
                <div key={category.id}>
                  <h3 className="mb-3 text-lg font-bold text-beige-800 font-heading">
                    <a
                      href={`/category/${category.slug}`}
                      className="hover:underline"
                    >
                      {category.name}
                    </a>
                  </h3>
                  <ul className="space-y-2">
                    {category.subcategories?.map((sub) => (
                      <li key={sub.id}>
                        <a
                          href={`/category/${category.slug}/${sub.slug}`}
                          className="text-sm text-beige-600 hover:text-beige-800 hover:underline"
                        >
                          {sub.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
