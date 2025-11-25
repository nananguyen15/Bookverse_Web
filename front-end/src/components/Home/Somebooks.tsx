import { useState, useEffect } from "react";
import { BookCard } from "./BookCard";
import type { Book, PromotionResponse, SubCategory } from "../../types";
import { useCart } from "../../contexts/CartContext";
import { booksApi, authorsApi, publishersApi, categoriesApi, promotionApi } from "../../api";
import { mapBooksWithNames } from "../../utils/bookHelpers";
import { getPromotionalPrice } from "../../utils/promotionHelpers";

export function Somebooks() {
  const { addToCart } = useCart();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [subCategoryPromotions, setSubCategoryPromotions] = useState<Record<string, PromotionResponse | null>>({});

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const [booksData, authorsData, publishersData] = await Promise.all([
          booksApi.getActive(),
          authorsApi.getActive(),
          publishersApi.getActive(),
        ]);

        // Map books with author/publisher names and fix image paths
        const booksWithNames = mapBooksWithNames(
          booksData,
          authorsData,
          publishersData
        );

        // Lấy 10 books đầu tiên để hiển thị 2 hàng x 5 quyển
        // TODO: Khi có soldCount, sort theo soldCount DESC
        setBooks(booksWithNames.slice(0, 10));
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Fetch promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const [promotionsData, categoriesData] = await Promise.all([
          promotionApi.getActive(),
          categoriesApi.sub.getActive(),
        ]);

        const promotionSubCatsCache: Record<number, SubCategory[]> = {};
        for (const promo of promotionsData) {
          try {
            const subCats = await promotionApi.getPromotionSubCategories(promo.id);
            promotionSubCatsCache[promo.id] = subCats;
          } catch (error) {
            // Promotion may not have sub-categories (backend returns 400)
            promotionSubCatsCache[promo.id] = [];
          }
        }

        const subCatPromos: Record<string, PromotionResponse | null> = {};
        for (const subCat of categoriesData) {
          let foundPromo: PromotionResponse | null = null;

          for (const promo of promotionsData) {
            const subCats = promotionSubCatsCache[promo.id] || [];
            if (subCats.some(sc => sc.id === subCat.id)) {
              const now = new Date();
              const start = new Date(promo.startDate);
              const end = new Date(promo.endDate);
              if (now >= start && now <= end && promo.active) {
                foundPromo = promo;
                break;
              }
            }
          }

          subCatPromos[subCat.id] = foundPromo;
        }

        setSubCategoryPromotions(subCatPromos);
        console.log("🎉 Promotions loaded for Somebooks:", {
          totalPromotions: promotionsData.length,
          totalCategories: categoriesData.length,
          mappedCategories: Object.keys(subCatPromos).length,
          subCatPromos
        });
      } catch (error) {
        console.error("Error fetching promotions:", error);
      }
    };

    fetchPromotions();
  }, []);

  const handleAddToCart = async (bookId: string | number) => {
    try {
      await addToCart(String(bookId), "book", 1);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-12 px-16 py-6">
        <div className="col-span-12 py-8 text-center">
          <p className="text-brown-600">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 px-16 py-6">
      {/* Title and See All */}
      <div className="flex items-center justify-between col-span-12 my-5">
        <h2 className="text-3xl font-bold font-heading text-beige-900">
          Books
        </h2>
        <a
          href="/allbooks"
          className="text-base font-medium transition-colors text-beige-700 hover:text-beige-900 hover:underline"
        >
          See All →
        </a>
      </div>

      {/* Books Grid - 2 rows x 5 books */}
      <div className="col-span-12 space-y-8">
        {/* First Row - 5 books */}
        <div className="flex flex-row items-start justify-between gap-8 pb-4 overflow-x-auto">
          {books.slice(0, 5).map((book) => {
            const priceInfo = getPromotionalPrice(book, subCategoryPromotions);
            console.log(`📚 Book: ${book.title}, CategoryId: ${book.categoryId}, PromoPrice:`, priceInfo);
            return (
              <BookCard
                key={book.id}
                book={book}
                onAddToCart={handleAddToCart}
                active={book.active}
                stockQuantity={book.stockQuantity}
                promoPrice={priceInfo.promoPrice}
                promoPercentage={priceInfo.percentage}
              />
            );
          })}
        </div>

        {/* Second Row - 5 books */}
        {books.length > 5 && (
          <div className="flex flex-row items-start justify-between gap-8 pb-4 overflow-x-auto">
            {books.slice(5, 10).map((book) => {
              const priceInfo = getPromotionalPrice(book, subCategoryPromotions);
              return (
                <BookCard
                  key={book.id}
                  book={book}
                  onAddToCart={handleAddToCart}
                  active={book.active}
                  stockQuantity={book.stockQuantity}
                  promoPrice={priceInfo.promoPrice}
                  promoPercentage={priceInfo.percentage}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
