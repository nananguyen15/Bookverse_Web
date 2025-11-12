import { useState } from "react";
import { categories } from "../../data/categories";

export function CategoryDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="px-4 py-2 font-medium transition-colors text-beige-900 hover:text-beige-700">
        Category
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 w-screen max-w-4xl mt-2 bg-white border shadow-xl top-full border-beige-200 rounded-lg">
          <div className="grid grid-cols-3 gap-6 p-6">
            {categories.map((category) => (
              <div key={category.id} className="space-y-2">
                <a
                  href={`/category/${category.slug}`}
                  className="block text-lg font-bold text-beige-900 hover:text-beige-700 font-heading"
                >
                  {category.name}
                </a>
                <ul className="space-y-1">
                  {category.subcategories?.map((sub) => (
                    <li key={sub.id}>
                      <a
                        href={`/category/${category.slug}/${sub.slug}`}
                        className="block text-sm text-beige-600 hover:text-beige-800 hover:underline"
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
      )}
    </div>
  );
}
