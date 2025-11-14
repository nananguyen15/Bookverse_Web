import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeroSlider from "./HeroSlider";
import { Somebooks } from "./Somebooks";
import { Categories } from "./Categories";
import { booksApi, authorsApi, publishersApi } from "../../api";
import type { Book } from "../../types";
import { mapBooksWithNames } from "../../utils/bookHelpers";

export function Homepage() {
  const location = useLocation();
  const [heroBookGroups, setHeroBookGroups] = useState<Book[][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroBooks = async () => {
      try {
        setLoading(true);
        // Fetch 9 random active books + authors + publishers
        const [books, authorsData, publishersData] = await Promise.all([
          booksApi.getRandom(9),
          authorsApi.getActive(),
          publishersApi.getActive(),
        ]);

        // Map books with author/publisher names and fix image paths
        const booksWithNames = mapBooksWithNames(
          books,
          authorsData,
          publishersData
        );

        // Chia thành 3 groups (mỗi group 3 books)
        const groups: Book[][] = [];
        for (let i = 0; i < booksWithNames.length; i += 3) {
          groups.push(booksWithNames.slice(i, i + 3));
        }

        setHeroBookGroups(groups);
      } catch (error) {
        console.error("Error fetching hero books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroBooks();
  }, []);

  // Scroll to categories section if hash is present
  useEffect(() => {
    if (location.hash === "#browse-categories") {
      setTimeout(() => {
        const categoriesSection = document.getElementById("browse-categories");
        if (categoriesSection) {
          categoriesSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100); // Small delay to ensure DOM is ready
    }
  }, [location]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex items-center justify-center flex-1">
          <p className="text-xl text-brown-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {heroBookGroups.length > 0 && (
          <HeroSlider
            booksData={heroBookGroups}
            autoIntervalMs={5000}
            onGetStartedHref="/browse"
          />
        )}
        <Somebooks />
        <Categories />
      </main>
      <Footer />
    </div>
  );
}
