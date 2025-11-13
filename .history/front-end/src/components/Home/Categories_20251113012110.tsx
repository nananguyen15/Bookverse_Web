import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { categoriesApi } from "../../api";
import type { SupCategory, SubCategory } from "../../types";

export function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<SupCategory[]>([]);
  const [subCategories, setSubCategories] = useState<
    Record<number, SubCategory[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const supCats = await categoriesApi.sup.getActive();
        setCategories(supCats);

        const subCatsMap: Record<number, SubCategory[]> = {};
        await Promise.all(
          supCats.map(async (supCat) => {
            const subs = await categoriesApi.sup.getSubCategories(supCat.id);
            subCatsMap[supCat.id] = subs.filter((sub) => sub.active);
          })
        );

        setSubCategories(subCatsMap);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (supCat: SupCategory) => {
    // Get all sub-category IDs for this sup category
    const subCatIds = subCategories[supCat.id]?.map((sub) => sub.id) || [];
    
    // Create URL params with supCatId and all subCatIds
    const categoryIds = [supCat.id, ...subCatIds].join(",");
    
    // Navigate to /books with category filter
    navigate(`/books?categories=${categoryIds}`);
  };

  if (loading) {
    return (
      <div className="px-16 py-8 bg-beige-50">
        <p className="text-center text-brown-600">Đang tải danh mục...</p>
      </div>
    );
  }

  return (
    <div className="px-16 py-8 bg-beige-50" id="browse-categories">
      <h2 className="mb-6 text-3xl font-bold text-beige-900 font-heading">
        Browse by Category
      </h2>

      <div className="flex justify-between gap-6 pb-4 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className="flex-shrink-0 w-64 group"
          >
            <div className="relative flex flex-col items-center justify-center h-full p-6 overflow-hidden text-center bg-beige-300 rounded-2xl min-h-40">
              {/* Animated background overlay */}
              <div
                className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24, #f0932b)",
                  backgroundSize: "400% 400%",
                  animation: "colorShift 5s ease-in-out infinite",
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-xl font-bold transition-colors duration-300 font-heading text-beige-900 group-hover:text-white">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm transition-colors duration-300 opacity-80 text-beige-700 group-hover:text-white">
                  {subCategories[category.id]?.length || 0} subcategories
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Add keyframes CSS */}
      <style>{`
        @keyframes colorShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
