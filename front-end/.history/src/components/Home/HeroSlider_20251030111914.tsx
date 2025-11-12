import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Book } from "../../data/books";
import { Link } from "react-router-dom";

// ---------- Types ----------
export type BookGroup = Book[];

export type HeroSliderProps = {
  booksData: BookGroup[];
  autoIntervalMs?: number;
  onGetStartedHref?: string;
};

// ---------- Component ----------
export default function HeroSlider({
  booksData,
  autoIntervalMs = 5000,
  onGetStartedHref = "/browse",
}: HeroSliderProps) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [opacities, setOpacities] = useState<number[]>(() =>
    Array.from({ length: booksData.length }, (_, i) => (i === 0 ? 1 : 0))
  );
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Skip if this is a programmatic scroll
    if (isProgrammaticScrollRef.current) {
      return;
    }

    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;

    // Calculate based on visible area instead of total scroll height
    const totalScrollable = scrollHeight - containerHeight;

    if (totalScrollable <= 0) {
      setOpacities(booksData.map((_, i) => (i === 0 ? 1 : 0)));
      setCurrentSlide(0);
      return;
    }

    const progress = (scrollTop / totalScrollable) * (booksData.length - 1);
    const index = Math.floor(progress);
    const fraction = progress - index;

    // Clamp index to valid range
    const currentIndex = Math.max(0, Math.min(index, booksData.length - 1));
    const nextIndex = Math.min(currentIndex + 1, booksData.length - 1);

    const next = booksData.map((_, i) => {
      if (i === currentIndex && currentIndex === nextIndex) {
        // Last slide
        return 1;
      }
      if (i === currentIndex) {
        return 1 - fraction;
      }
      if (i === nextIndex) {
        return fraction;
      }
      return 0;
    });

    setOpacities(next);
    setCurrentSlide(currentIndex);
  };

  // Programmatic scroll
  const scrollToSlide = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const containerHeight = el.clientHeight;
    const scrollHeight = el.scrollHeight;
    const totalScrollable = scrollHeight - containerHeight;

    // Clamp index to valid range
    const targetIndex = Math.max(0, Math.min(index, booksData.length - 1));

    // Update state immediately for instant visual feedback
    setCurrentSlide(targetIndex);
    setOpacities(booksData.map((_, i) => (i === targetIndex ? 1 : 0)));

    // Mark as programmatic scroll
    isProgrammaticScrollRef.current = true;

    // Calculate exact scroll position for this slide
    const targetScroll =
      booksData.length > 1
        ? (totalScrollable / (booksData.length - 1)) * targetIndex
        : 0;

    el.scrollTo({ top: targetScroll, behavior: "smooth" });

    // Reset flag after scroll animation completes (smooth scroll takes ~300-500ms)
    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 600);
  };

  // Auto slide
  useEffect(() => {
    const id = window.setInterval(() => {
      const nextIndex = (currentSlide + 1) % booksData.length;
      scrollToSlide(nextIndex);
    }, autoIntervalMs);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, autoIntervalMs, booksData.length]);

  // Helper function for future use if needed
  // const handleAddToCart = (bookId: number, e: React.MouseEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   if (!isAuthenticated) {
  //     navigate("/signin");
  //     return;
  //   }
  //   addToCart(String(bookId), "book", 1);
  // };

  return (
    <div className="w-full bg-gradient-to-b from-beige-50 to-beige-100">
      <div className="px-16 py-6 lg:py-14">
        <div className="grid items-center grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left */}
          <div className="lg:col-span-5">
            <h1 className="font-heading text-[clamp(2.5rem,5vw,4rem)] text-beige-900 font-bold mb-6">
              Find Your Next Book
            </h1>
            <p className="font-body text-[1.1rem] leading-relaxed text-beige-700 mb-8">
              Our most popular and trending <strong>BookVerse</strong> picks.
              Not sure what to read next? Start from your mood.
            </p>
            <a
              href={onGetStartedHref}
              className="inline-flex items-center justify-center px-6 py-3 font-medium tracking-wide transition-all duration-300 bg-beige-700 text-beige-100 hover:bg-beige-800 active:translate-y-px"
            >
              Get Started
            </a>
          </div>

          {/* Right (Slideshow) */}
          <div className="flex justify-end lg:col-span-7">
            <div className="flex items-center gap-2 w-fit">
              {/* Scrollable Container */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="hide-scrollbar h-[480px] flex flex-col gap-8 overflow-y-scroll scroll-smooth max-w-[680px] shrink-0"
              >
                {booksData.map((bookGroup, groupIndex) => (
                  <motion.div
                    key={groupIndex}
                    className="flex justify-center gap-4 min-h-[470px]"
                    animate={{ opacity: opacities[groupIndex] }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                  >
                    {bookGroup.map((book, index) => {
                      const isCenter = index === 1;
                      const titleSlug = book.title
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^\w-]/g, "");
                      const bookLink = `/book/${book.id}/${titleSlug}`;

                      return (
                        <div
                          key={book.id}
                          className={`text-center flex ${
                            isCenter ? "flex-col-reverse" : "flex-col"
                          }`}
                        >
                          <Link to={bookLink}>
                            <div
                              className={`relative w-[180px] h-[300px] mx-auto mb-3`}
                            >
                              <div
                                className={`w-full h-full overflow-hidden ${
                                  isCenter
                                    ? "rounded-b-[100px]"
                                    : "rounded-t-[100px]"
                                }`}
                              >
                                <img
                                  src={book.image ?? ""}
                                  alt={book.title}
                                  className="object-cover w-full h-full"
                                  loading="lazy"
                                />
                              </div>
                            </div>
                          </Link>

                          <div
                            className={`max-w-[200px] min-h-[100px] flex flex-col ${
                              isCenter
                                ? "mx-auto mb-3 justify-end"
                                : "mx-auto justify-start"
                            }`}
                          >
                            <Link to={bookLink}>
                              <h5 className="text-[1.1rem] font-bold text-beige-900 mb-1 line-clamp-2 hover:text-beige-700 font-heading">
                                {book.title}
                              </h5>
                            </Link>
                            <p className="text-[0.95rem] text-beige-700 m-0 line-clamp-3">
                              {book.description.slice(0, 80)}...
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                ))}
              </div>

              {/* Dot Indicators */}
              <div className="flex flex-col items-center gap-3">
                {booksData.map((_, index) => {
                  const active = currentSlide === index;
                  return (
                    <button
                      key={index}
                      onClick={() => scrollToSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                      className={`h-3 w-3 rounded-full border transition-all ${
                        active
                          ? "bg-beige-700 border-beige-700"
                          : "bg-transparent border-beige-700/30"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
