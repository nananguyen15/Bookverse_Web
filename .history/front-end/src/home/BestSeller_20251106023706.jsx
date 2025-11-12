import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { IoCartOutline } from "react-icons/io5";
import bookService from "../services/bookService";

function BestSeller() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch active books từ API
  useEffect(() => {
    const fetchActiveBooks = async () => {
      try {
        setLoading(true);
        const activeBooks = await bookService.getActiveBooks();
        // Lấy 5 cuốn đầu tiên hoặc tất cả nếu có ít hơn 5
        setBooks(activeBooks.slice(0, 5));
      } catch (error) {
        console.error('Error fetching active books:', error);
        // Fallback to mock data if API fails
        setBooks([
          {
            id: 1,
            title: "The Spoke Zaratustra",
            author: "Friedrich Nietzsche",
            price: 32.0,
            rating: 4,
            image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
          },
          {
            id: 2,
            title: "Confession of a Mask",
            author: "Yukio Mishima",
            price: 28.0,
            rating: 4,
            image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveBooks();
  }, []);

  if (loading) {
    return (
      <div style={{ backgroundColor: "#f5f5f0", padding: "60px 0", minHeight: "50vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p>Loading books...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#f5f5f0",
        padding: "60px 0",
      }}
    >
      <Container
        fluid
        style={{
          paddingLeft: "100px",
          paddingRight: "100px",
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2
            style={{
              fontFamily: "LovelyHome, serif",
              fontSize: "2.5rem",
              color: "#2c1810",
              fontWeight: "bold",
            }}
          >
            Bestsellers
          </h2>
          <a
            href="#"
            style={{
              color: "#2c1810",
              textDecoration: "none",
              fontSize: "1rem",
              fontWeight: "500",
            }}
          >
            See all
          </a>
        </div>

        {/* Books Grid */}
        <div className="row g-4">
          {books.map((book) => (
            <div key={book.id} className="col-lg-3 col-md-6">
              <div
                style={{
                  backgroundColor: "white",
                  overflow: "hidden",
                  width: "240px", // set fixed width for squarer look
                  margin: "0 auto", // center the card
                }}
              >
                {/* Book Image */}
                <div style={{ height: "240px", overflow: "hidden" }}>
                  <img
                    src={book.image}
                    alt={book.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>

                {/* Book Info */}
                <div
                  style={{
                    padding: "0", // removed padding for left-align
                    backgroundColor: "#f5f5f0", // match page background
                  }}
                >
                  <h5
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: "#2c1810",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {book.title}
                  </h5>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      color: "#5c4a3d",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {book.author}
                  </p>

                  {/* Price and Add Button */}
                  <div className="d-flex justify-content-between align-items-center">
                    <span
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "#2c1810",
                      }}
                    >
                      ${book.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

export default BestSeller;
