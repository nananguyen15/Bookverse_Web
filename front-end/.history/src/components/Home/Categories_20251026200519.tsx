export function Categories() {
  const categories = [
    "Fiction", "Non-Fiction", "Mystery", "Romance", "Sci-Fi", "Fantasy"
  ];

  return (
    <div className="px-16 py-6">
      <h2 className="text-3xl font-bold font-heading text-beige-900 mb-6">
        Browse by Category
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <a
            key={category}
            href={`/category/${category.toLowerCase()}`}
            className="p-4 text-center bg-beige-100 hover:bg-beige-200 rounded-lg transition-colors"
          >
            <span className="font-medium text-beige-800">{category}</span>
          </a>
        ))}
      </div>
    </div>
  );
}