import { categories } from "../../data/categories";

export function Categories() {
  return (
    <div className="px-16 py-8 bg-beige-50">
      <h2 className="mb-6 text-3xl font-bold text-beige-900 font-heading">
        Browse by Category
      </h2>

      <div
        ref={scrollContainerRef}
        className="flex gap-6 pb-4 overflow-x-auto"
      >
        {categories.map((category, index) => (
          <a
            key={category.id}
            href={`/category/${category.slug}`}
            className={`flex-shrink-0 w-64 h-40 rounded-lg transition-all duration-300 ${
              index === activeIndex
                ? "bg-gradient-to-br from-beige-700 to-beige-900 text-white shadow-2xl scale-110 -translate-y-2"
                : "bg-gradient-to-br from-beige-200 to-beige-300 text-beige-900 hover:shadow-lg"
            }`}
          >
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <h3 className="text-xl font-bold font-heading">
                {category.name}
              </h3>
              <p className="mt-2 text-sm opacity-80">
                {category.subcategories?.length || 0} subcategories
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
