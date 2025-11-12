import React from "react";
import { Container } from "react-bootstrap";
import { IoCartOutline } from "react-icons/io5";

function BestSeller() {
  const books = [
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
      image:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    },
    {
      id: 3,
      title: "The Rebel",
      author: "Albert Camus",
      price: 18.0,
      rating: 4,
      image:
        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
    },
    {
      id: 4,
      title: "1984",
      author: "George Orwell",
      price: 36.0,
      rating: 4,
      image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
    },
    {
      id: 5,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      price: 25.0,
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400",
    },
    {
      id: 6,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      price: 22.0,
      rating: 5,
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
    },
    {
      id: 7,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      price: 30.0,
      rating: 4,
      image:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    },
    {
      id: 8,
      title: "Moby Dick",
      author: "Herman Melville",
      price: 35.0,
      rating: 3,
      image:
        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
    },
  ];

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
