import { useState, useEffect } from "react";
import { Navbar } from "../Navbar/Navbar";
import HeroSlider from "./HeroSlider";
import bookService from "../../services/bookService";
import type { Book } from "../../types/api";
import { Footer } from "../Footer/Footer";
import { Somebooks } from "./Somebooks";
import { Someseries } from "./SomeSeries";
import { Categories } from "./Categories";

export function Homepage() {
  const [heroBooks, setHeroBooks] = useState<Book[][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroBooks = async () => {
      try {
        setLoading(true);
        const randomBooks = await bookService.getRandomActiveBooks();
        
        // Chia books thành groups (mỗi group 3 books)
        const bookGroups: Book[][] = [];
        for (let i = 0; i < randomBooks.length && bookGroups.length < 3; i += 3) {
          const group = randomBooks.slice(i, i + 3);
          if (group.length === 3) {
            bookGroups.push(group);
          }
        }
        
        setHeroBooks(bookGroups);
      } catch (error) {
        console.error('Error fetching hero books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroBooks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="grid w-full">
      <Navbar />
      {heroBooks.length > 0 && (
        <HeroSlider
          booksData={heroBooks}
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
