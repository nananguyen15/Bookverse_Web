import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { categoriesApi } from "../../../api";
import type { SupCategory, SubCategory } from "../../../types";

export function CategoryDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<SupCategory[]>([]);
  const [subCategories, setSubCategories] = useState<
    Record<number, SubCategory[]>
  >({});
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
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
      }
    };

    fetchCategories();
  }, []);

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

  const handleSupCategoryClick = (supCat: SupCategory) => {
    // Get all sub-category IDs for this sup category
    const subCatIds = subCategories[supCat.id]?.map((sub) => sub.id) || [];
    
    console.log('=== NAVBAR CATEGORY CLICK ===');
    console.log('Clicked Sup Category:', supCat);
    console.log('Sub Categories:', subCategories[supCat.id]);
    console.log('Sub Category IDs:', subCatIds);
    
    // WORKAROUND: Only use sub-category IDs to avoid ID conflicts
    // Don't include sup category ID because it may conflict with sub-category IDs
    const categoryIds = subCatIds.join(",");
    
    console.log('Navigating with categories:', categoryIds);
    
    // Navigate to /books with category filter
    navigate(`/books?categories=${categoryIds}`);
    setIsOpen(false);
  };

  const handleSubCategoryClick = (subCat: SubCategory) => {
    // Navigate to /books with only this subCategory
    navigate(`/books?categories=${subCat.id}`);
    setIsOpen(false);
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
        <div className="absolute z-50 w-screen max-w-4xl mt-2 -translate-x-1/2 left-1/2">
          <div className="bg-white border rounded-lg shadow-lg border-beige-200">
            <div className="grid grid-cols-3 gap-8 p-8">
              {categories.map((category) => (
                <div key={category.id}>
                  <h3 className="mb-3 text-lg font-bold text-beige-800 font-heading">
                    <button
                      onClick={() => handleSupCategoryClick(category)}
                      className="hover:underline text-left"
                    >
                      {category.name}
                    </button>
                  </h3>
                  <ul className="space-y-2">
                    {subCategories[category.id]?.map((sub) => (
                      <li key={sub.id}>
                        <button
                          onClick={() => handleSubCategoryClick(sub)}
                          className="text-sm text-beige-600 hover:text-beige-800 hover:underline text-left"
                        >
                          {sub.name}
                        </button>
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
