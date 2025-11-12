import React, { useState, useRef, useEffect } from "react"; // added useEffect
import { Container } from "react-bootstrap";

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0); // added back for dot indicators and nextSlide
  const [opacities, setOpacities] = useState([1, 0, 0]); // opacity for each slide
  const scrollContainerRef = useRef(null);

  const booksData = [
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

  const handleScroll = (e) => {
    const container = e.target;
    const scrollTop = container.scrollTop;
    const itemHeight = container.scrollHeight / booksData.length;
    const progress = scrollTop / itemHeight;
    const index = Math.floor(progress);
    const fraction = progress - index;
    const newOpacities = booksData.map((_, i) => {
      if (i === index) return 1 - fraction;
      if (i === index + 1) return fraction;
      return 0;
    });
    setOpacities(newOpacities);
    setCurrentSlide(index); // added to update currentSlide for indicators
  };

  const scrollToSlide = (index) => {
    if (scrollContainerRef.current) {
      const itemHeight =
        scrollContainerRef.current.scrollHeight / booksData.length;
      scrollContainerRef.current.scrollTo({
        top: itemHeight * index,
        behavior: "smooth",
      });
      setCurrentSlide(index); // added to update currentSlide
    }
  };

  const nextSlide = () => {
    const nextIndex = (currentSlide + 1) % booksData.length; // fixed to use currentSlide
    scrollToSlide(nextIndex);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // auto slide every 5 seconds
    return () => clearInterval(interval); // cleanup on unmount
  }, [currentSlide]); // depend on currentSlide to reset if changed

  return (
    <div
      style={{
        backgroundColor: "#ede5dd",
        minHeight: "auto",
        width: "100%",
        margin: 0,
        padding: 0,
      }}
    >
      <Container
        fluid
        style={{
          paddingTop: "100px",
          paddingBottom: "20px",
          paddingLeft: "100px",
          paddingRight: "100px",
          margin: 0,
        }} // inset left/right 100px
      >
        <div
          className="row align-items-center"
          style={{ minHeight: "50vh", margin: 0 }} // reduced overall row height
        >
          {/* Left Content */}
          <div
            className="col-lg-5 col-md-12 mb-4 mb-lg-0"
            style={{ paddingLeft: "0px" }} // rely on Container padding
          >
            <h1
              style={{
                fontFamily: "LovelyHome",
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                color: "#2c1810",
                fontWeight: "bold",
                marginBottom: "1.5rem",
              }}
            >
              Find Your Next Book
            </h1>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#5c4a3d",
                marginBottom: "2rem",
                lineHeight: "1.6",
              }}
            >
              Our most popular and trending <strong>BookVerse</strong> perfect.
              Not sure what to read now next reading mood Perfectly.
            </p>
            <button
              className="btn"
              style={{
                backgroundColor: "#8B6L4C",
                color: "white",
                border: "none",
                padding: "12px 40px",
                fontSize: "1rem",
                borderRadius: "0", // removed border-radius
                fontWeight: "500",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#6d5438";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#8B6B4C";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Get Started
            </button>
          </div>

          {/* Right Books Slideshow */}
          <div
            className="col-lg-7 col-md-12 position-relative"
            style={{ paddingRight: "0px" }} // rely on Container padding
          >
            <div className="d-flex align-items-center" style={{ gap: 0 }}>
              {" "}
              {/* removed gap between images and scroll buttons */}
              {/* Scrollable Container */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2rem",
                  overflowY: "scroll",
                  // removed scrollSnapType for smooth fade
                  scrollBehavior: "smooth",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  height: "380px", // increased so book info (title/author) is visible while keeping cover height
                  flex: 1,
                }}
                className="hide-scrollbar"
              >
                {booksData.map((bookGroup, groupIndex) => (
                  <div
                    key={groupIndex}
                    className="d-flex justify-content-center gap-4"
                    style={{
                      // removed scrollSnapAlign
                      minHeight: "380px", // match container so title/author are not cut off
                      opacity: opacities[groupIndex], // fade based on scroll
                      transition: "opacity 0.3s ease", // smooth fade transition
                    }}
                  >
                    {bookGroup.map((book, index) => {
                      const isCenter = index === 1;
                      return (
                        <div
                          key={book.id}
                          className="text-center"
                          style={{
                            display: "flex",
                            flexDirection: isCenter
                              ? "column-reverse"
                              : "column", // reverse order for center book
                          }}
                        >
                          {/* Book Cover with Arch Shape */}
                          <div
                            style={{
                              position: "relative",
                              width: "180px",
                              height: "300px",
                              margin: "0 auto 1rem",
                            }}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: isCenter
                                  ? "0 0 100px 100px"
                                  : "100px 100px 0 0",
                                overflow: "hidden",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                // no rotation here - just flip borderRadius
                              }}
                            >
                              <img
                                src={book.image}
                                alt={book.title}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  // no rotation - image stays upright
                                }}
                              />
                            </div>
                          </div>

                          {/* Book Info */}
                          <div
                            style={{
                              maxWidth: "200px",
                              margin: isCenter ? "0 auto 1rem" : "0 auto", // add bottom margin when on top
                            }}
                          >
                            <h5
                              style={{
                                fontSize: "1.1rem",
                                fontWeight: "bold",
                                color: "#2c1810",
                                marginBottom: "0.25rem",
                              }}
                            >
                              {book.title}
                            </h5>
                            <p
                              style={{
                                fontSize: "0.95rem",
                                color: "#5c4a3d",
                                margin: 0,
                              }}
                            >
                              {book.author}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              {/* Vertical Dot Indicators */}
              <div
                className="d-flex flex-column gap-3 align-items-center"
                style={{
                  paddingRight: "0px",
                }} /* bring indicators closer to images */
              >
                {booksData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToSlide(index)}
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      border:
                        currentSlide === index // fixed to use currentSlide
                          ? "2px solid #8B6B4C"
                          : "2px solid rgba(139, 107, 76, 0.3)",
                      backgroundColor:
                        currentSlide === index ? "#8B6B4C" : "transparent", // fixed to use currentSlide
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      padding: 0,
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <style>{`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default Hero;
