import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Book } from "../../data/books";

// ---------- Types ----------
export type BookGroup = Book[];

export type HeroSliderProps = {
  booksData: BookGroup[];
  autoIntervalMs?: number; // default 5000
  onGetStartedHref?: string; // default '/browse'
};

// ---------- Component ----------
export default function HeroSlider({
  booksData,
  autoIntervalMs = 5000,
  onGetStartedHref = "/browse",
}: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [opacities, setOpacities] = useState<number[]>(() =>
    Array.from({ length: booksData.length }, (_, i) => (i === 0 ? 1 : 0))
  );
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Scroll handler → calculate cross-fade
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemH = container.scrollHeight / booksData.length;

    const progress = scrollTop / itemH;
    const index = Math.floor(progress);
    const fraction = progress - index;

    const next = booksData.map((_, i) => {
      if (i === index) return 1 - fraction;
      if (i === index + 1) return fraction;
      return 0;
    });

    setOpacities(next);
    setCurrentSlide(Math.min(index, booksData.length - 1));
  };

  // Programmatic scroll
  const scrollToSlide = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const itemH = el.scrollHeight / booksData.length;
    el.scrollTo({ top: itemH * index, behavior: "smooth" });
    setCurrentSlide(index);
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

  return (
    <div className="w-full bg-linear-to-t from-beige-100 to-beige-50 ">
      <div className="px-10 py-14 mx-9">
        <div className="grid items-center grid-cols-1 gap-8 lg:grid-cols-12 ">
          {/* Left */}
          <div className="lg:col-span-5">
            <h1 className="font-heading text-[clamp(2.5rem,5vw,4rem)] text-beige-900 font-bold mb-6">
              Find Your Next Book
            </h1>
            <p className="font-body text-[1.1rem] leading-relaxed text-beige-700 mb-8">
              Our most popular and trending <strong>BookVerse</strong> picks.
              Not sure what to read next? Start from your mood.
            </p>
            {/* Button as anchor tag (no Router needed) */}
            <a
              href={onGetStartedHref}
              className="inline-flex items-center justify-center px-6 py-3 font-medium tracking-wide transition-all duration-300 bg-beige-700 text-beige-100 hover:bg-beige-800 active:translate-y-px"
            >
              Get Started
            </a>
          </div>

          {/* Right (Slideshow) */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4">
              {/* Scrollable Container */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="hide-scrollbar h-[390px] flex flex-col gap-8 overflow-y-scroll scroll-smooth max-w-[680px] flex-shrink-0"
              >
                {booksData.map((bookGroup, groupIndex) => (
                  <motion.div
                    key={groupIndex}
                    className="flex justify-center gap-4 min-h-[380px]"
                    // Framer Motion cross-fade (driven by calculated opacity)
                    animate={{ opacity: opacities[groupIndex] }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                  >
                    {bookGroup.map((book, index) => {
                      const isCenter = index === 1;
                      return (
                        <div
                          key={book.id}
                          className={`text-center flex ${
                            isCenter ? "flex-col-reverse" : "flex-col"
                          }`}
                        >
                          {/* Cover with arch shape */}
                          <div className="relative w-[180px] h-[300px] mx-auto mb-4">
                            <div
                              className="w-full h-full overflow-hidden"
                              style={{
                                borderRadius: isCenter
                                  ? "0 0 100px 100px"
                                  : "100px 100px 0 0",
                              }}
                            >
                              <img
                                src={book.image ?? ""}
                                alt={book.title}
                                className="object-cover w-full h-full"
                                loading="lazy"
                              />
                            </div>
                          </div>

                          {/* Info */}
                          <div
                            className={`max-w-[200px] ${
                              isCenter ? "mx-auto mb-4" : "mx-auto"
                            }`}
                          >
                            <h5 className="text-[1.1rem] font-bold text-beige-900 mb-1">
                              {book.title}
                            </h5>
                            <p className="text-[0.95rem] text-beige-700 m-0">
                              {book.description.slice(0, 60)}...
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
