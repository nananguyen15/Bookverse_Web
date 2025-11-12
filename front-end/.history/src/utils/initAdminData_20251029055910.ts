import { mockBooksDB, mapDBBook } from "../data/books";
import { categories } from "../data/categories";
import { seriesData } from "../data/series";

// Map books data to admin format
export function initializeAdminData() {
  // Initialize categories with flat structure (main + sub)
  const existingCategories = localStorage.getItem("adminCategories");
  
  if (!existingCategories) {
    const flatCategories: any[] = [];
    
    categories.forEach((mainCat) => {
      // Add main category
      flatCategories.push({
        id: String(mainCat.id),
        name: mainCat.name,
        slug: mainCat.slug,
        description: `Main category for ${mainCat.name}`,
        parentId: null, // null = main category
        booksCount: 0,
      });
      
      // Add subcategories
      if (mainCat.subcategories) {
        mainCat.subcategories.forEach((subCat) => {
          flatCategories.push({
            id: String(subCat.id),
            name: subCat.name,
            slug: subCat.slug,
            description: `Subcategory of ${mainCat.name}`,
            parentId: String(mainCat.id), // link to parent
            booksCount: 0,
          });
        });
      }
    });
    
    localStorage.setItem("adminCategories", JSON.stringify(flatCategories));
    console.log("✅ Initialized categories:", flatCategories.length);
  }
  
  // Initialize books
  const existingBooks = localStorage.getItem("adminBooks");
  
  if (!existingBooks) {
    const adminBooks = mockBooksDB.map((dbBook) => {
      const frontendBook = mapDBBook(dbBook);
      
      return {
        id: frontendBook.id,
        title: frontendBook.title,
        author: `Author ${frontendBook.authorId || "Unknown"}`, // TODO: Add real authors
        publisher: `Publisher ${frontendBook.publisherId || "Unknown"}`, // TODO: Add real publishers
        publishedDate: frontendBook.publishedDate,
        categoryId: frontendBook.categoryId || "",
        promotionId: undefined,
        originalPrice: frontendBook.price,
        discountedPrice: undefined,
        description: frontendBook.description,
        coverImage: frontendBook.image || "",
        stockQuantity: frontendBook.stockQuantity,
        status: frontendBook.stockQuantity > 0 ? "In Stock" : "Out of Stock",
      };
    });
    
    localStorage.setItem("adminBooks", JSON.stringify(adminBooks));
    console.log("✅ Initialized books:", adminBooks.length);
  }
  
  // Update books count for categories
  updateCategoryBooksCount();
}

// Update books count for each category
export function updateCategoryBooksCount() {
  const categories = JSON.parse(localStorage.getItem("adminCategories") || "[]");
  const books = JSON.parse(localStorage.getItem("adminBooks") || "[]");
  
  const updatedCategories = categories.map((cat: any) => {
    const count = books.filter((book: any) => book.categoryId === cat.id).length;
    return { ...cat, booksCount: count };
  });
  
  localStorage.setItem("adminCategories", JSON.stringify(updatedCategories));
}
