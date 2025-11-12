import { categories } from "../../data/categories";

export function Categories() {
  return (
    <div className="px-16 py-8 bg-beige-50">
      <h2 className="mb-6 text-3xl font-bold text-beige-900 font-heading">
        Browse by Category
      </h2>

      <div className="flex justify-between gap-6 pb-4 overflow-x-auto">
        {categories.map((category) => (
          <a key={category.id} href={`/category/${category.slug}`}>
            <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-beige-300 rounded-2xl w-">
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
