import React, { useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";

type Book = { id: number; title: string; author: string; image: string };

export default function Hero(): JSX.Element {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [opacities, setOpacities] = useState<number[]>([1, 0, 0]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const booksData: Book[][] = [
    [
      {
        id: 1,
        title: "The Stranger",
        author: "Albert Camus",
        image:
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
      },
      {
        id: 2,
        title: "Der Process",
        author: "Franz Kafka",
        image:
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
      },
      {
        id: 3,
        title: "Dante",
        author: "Clive James",
        image:
          "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
      },
    ],
    [
      {
        id: 4,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        image:
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
      },
      {
        id: 5,
        title: "1984",
        author: "George Orwell",
        image:
          "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400",
      },
      {
        id: 6,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        image:
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
      },
    ],
    [
      {
        id: 7,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        image:
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
      },
      {
        id: 8,
        title: "Moby Dick",
        author: "Herman Melville",
        image:
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
      },
      {
        id: 9,
        title: "War and Peace",
        author: "Leo Tolstoy",
        image:
          "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
      },
    ],
  ];

  const handleScroll = (e: Event) => {
    const container = e.target as HTMLDivElement;
    if (!container) return;
    const scrollTop = container.scrollTop;
    const itemHeight = container.scrollHeight / booksData.length;
    const progress = scrollTop / itemHeight;
    const index = Math.floor(progress);
    const fraction = progress - index;
    const newOpacities = booksData.map((_, i) => {
      if (i === index) return Math.max(0, 1 - fraction);
      if (i === index + 1) return Math.min(1, fraction);
      return 0;
    });
    setOpacities(newOpacities);
    setCurrentSlide(Math.max(0, Math.min(booksData.length - 1, index)));
  };

  const scrollToSlide = (index: number) => {
    if (scrollContainerRef.current) {
      const itemHeight = scrollContainerRef.current.scrollHeight / booksData.length;
      scrollContainerRef.current.scrollTo({ top: itemHeight * index, behavior: "smooth" });
      setCurrentSlide(index);
    }
  };

  const nextSlide = () => {
    const nextIndex = (currentSlide + 1) % booksData.length;
    scrollToSlide(nextIndex);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.addEventListener("scroll", handleScroll);
    const interval = setInterval(nextSlide, 5000);
    return () => {
      if (el) el.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, [currentSlide]);

  return (
    <div className="w-full bg-[#ede5dd] py-24">
      <Container fluid className="px-24">
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-8">
          {/* Left content */}
          <div className="lg:w-5/12 w-full">
            <h1
              className="font-bold text-[#2c1810]"
              style={{ fontFamily: "Rosemartin, serif", fontSize: "clamp(2.5rem,5vw,4rem)" }}
            >
              Find Your Next Book
            </h1>
            <p className="text-[#5c4a3d] text-lg mt-4 leading-7">
              Our most popular and trending <strong>BookVerse</strong> perfect. Not
              sure what to read now next reading mood Perfectly.
            </p>
            <button
              type="button"
              className="mt-6 inline-block bg-[#8B6B4C] text-white px-6 py-3 text-base font-medium hover:bg-[#6d5438] transition-transform transform hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>

          {/* Right: scrollable book groups */}
          <div className="lg:w-7/12 w-full">
            <div className="flex items-center gap-4">
              <div
                ref={scrollContainerRef}
                className="flex flex-col gap-8 overflow-y-scroll hide-scrollbar h-[390px] w-full"
              >
                {booksData.map((group, gi) => (
                  <div
                    key={gi}
                    className="flex justify-center gap-6 items-center"
                    style={{ minHeight: 380, opacity: opacities[gi], transition: "opacity 300ms" }}
                  >
                    {group.map((book, bi) => {
                      const isCenter = bi === 1;
                      return (
                        <div key={book.id} className="text-center flex flex-col items-center" style={{ gap: 8 }}>
                          <div style={{ width: 180, height: 300 }} className="overflow-hidden rounded-[100px_100px_0_0]">
                            <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="mt-3 max-w-[200px]">
                            <h5 className="font-semibold text-lg text-[#2c1810]">{book.title}</h5>
                            <p className="text-sm text-[#5c4a3d]">{book.author}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Vertical dots */}
              <div className="flex flex-col gap-3 items-center">
                {booksData.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className="w-3 h-3 rounded-full p-0"
                    style={{
                      border: currentSlide === i ? "2px solid #8B6B4C" : "2px solid rgba(139,107,76,0.3)",
                      backgroundColor: currentSlide === i ? "#8B6B4C" : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>

            <style>{`\n              .hide-scrollbar::-webkit-scrollbar { display: none; }\n              .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }\n            `}</style>
          </div>
        </div>
      </Container>
    </div>
  );
}
