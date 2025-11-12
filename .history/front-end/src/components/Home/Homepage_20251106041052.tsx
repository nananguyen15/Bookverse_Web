import { useState, useEffect } from "react";
import { Navbar } from "../layout/Navbar/Navbar";
import HeroSlider from "./HeroSlider";
import { Footer } from "../layout/Footer/Footer";
import { Somebooks } from "./Somebooks";
import { Someseries } from "./SomeSeries";
import { Categories } from "./Categories";
import { booksApi, authorsApi, publishersApi } from "../../api";
import type { Book } from "../../types";

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

        // Map authorId và publisherId thành tên + fix đường dẫn ảnh
        const booksWithNames = books.map((book) => {
          const author = authorsData.find((a) => a.id === book.authorId);
          const publisher = publishersData.find((p) => p.id === book.publisherId);
          
          return {
            ...book,
            authorName: author?.name || `Author ${book.authorId}`,
            publisherName: publisher?.name || `Publisher ${book.publisherId}`,
            // Fix đường dẫn ảnh
            image: book.image.replace('/src/assets', '/assets'),
          };
        });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-brown-600 text-xl">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="grid w-full">
      <Navbar />
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
      <Footer />
    </div>
  );
}
