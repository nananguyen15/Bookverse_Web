import React from "react";
import { Container } from "react-bootstrap";
import { IoCartOutline } from "react-icons/io5";

function PopularSeries() {
  const series = [
    {
      id: 1,
      title: "The Spoke Zaratustra Series",
      author: "Friedrich Nietzsche",
      description: "A philosophical novel series exploring existentialism",
      price: 32.0,
      rating: 5,
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    },
    {
      id: 2,
      title: "Mishima Collection",
      author: "Yukio Mishima",
      description: "Complete works of the acclaimed Japanese author",
      price: 28.0,
      rating: 4,
      image:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    },
    {
      id: 3,
      title: "Camus Trilogy",
      author: "Albert Camus",
      description: "Essential existentialist literature collection",
      price: 18.0,
      rating: 4,
      image:
        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
    },
    {
      id: 4,
      title: "Orwell's Dystopia",
      author: "George Orwell",
      description: "Classic dystopian novels that shaped modern literature",
      price: 36.0,
      rating: 5,
      image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
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
            Popular Series
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

          <div className="row g-4">
            {series.map((item) => (
              <div key={item.id} className="col-lg-6 col-md-12">
                <div
            className="d-flex"
            style={{
              backgroundColor: "white",
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              height: "250px",
            }}
                >
            {/* Series Image */}
                <div style={{ width: "200px", flexShrink: 0 }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>

                {/* Series Info */}
                <div
                  style={{
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    flex: 1,
                  }}
                >
                  <div>
                    <h4
                      style={{
                        fontSize: "1.3rem",
                        fontWeight: "bold",
                        color: "#2c1810",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {item.title}
                    </h4>
                    <p
                      style={{
                        fontSize: "0.95rem",
                        color: "#5c4a3d",
                        marginBottom: "0.75rem",
                      }}
                    >
                      by: {item.author}
                    </p>

                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#6b7280",
                        lineHeight: "1.5",
                      }}
                    >
                      {item.description}
                    </p>
                  </div>

                  {/* Price and Button */}
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "#2c1810",
                      }}
                    >
                      ${item.price.toFixed(2)}
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

export default PopularSeries;
