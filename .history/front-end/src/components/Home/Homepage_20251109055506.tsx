import { useState, useEffect } from "react";
import { Navbar } from "../layout/Navbar/Navbar";
import HeroSlider from "./HeroSlider";
import { Footer } from "../layout/Footer/Footer";
import { Somebooks } from "./Somebooks";
import { Someseries } from "./SomeSeries";
import { Categories } from "./Categories";
import { booksApi, authorsApi, publishersApi } from "../../api";
import type { Book } from "../../types";
import { mapBooksWithNames } from "../../utils/bookHelpers";

export function Homepage() {
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

        console.log("📊 Hero Slider Debug:", {
          booksCount: books.length,
          booksWithNamesCount: booksWithNames.length,
          bookIds: books.map((b) => b.id),
        });

        // Chia thành 3 groups (mỗi group 3 books)
        const groups: Book[][] = [];
        for (let i = 0; i < booksWithNames.length; i += 3) {
          groups.push(booksWithNames.slice(i, i + 3));
        }

        console.log("📊 Groups structure:", {
          groupsCount: groups.length,
          booksPerGroup: groups.map((g) => g.length),
          totalBooks: groups.reduce((sum, g) => sum + g.length, 0),
        });

        setHeroBookGroups(groups);
      } catch (error) {
        console.error("Error fetching hero books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroBooks();
  }, []);

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
        <Someseries />
        <Categories />
      </main>
      <Footer />
    </div>
  );
}
