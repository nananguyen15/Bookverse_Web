import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { booksApi, authorsApi, publishersApi, cartApi } from "../api";
import type { Book } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { mapBookWithNames } from "../utils/bookHelpers";
import { ReviewForm } from "../components/Review/ReviewForm";
import { ReviewList } from "../components/Review/ReviewList";
import { Footer } from "../components/layout/Footer/Footer";
import { Navbar } from "../components/layout/Navbar/Navbar";

export function ProductDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!type || !id) {
        console.log("Missing type or id:", { type, id });
        return;
      }

      console.log("Starting fetch for:", { type, id }); // Debug log

      // Reset state when URL changes
      setProduct(null);
      setLoading(true);
      setQuantity(1);

      try {
        // Only support books for now (series needs backend API)
        if (type === "book") {
          console.log("Fetching book with ID:", id); // Debug log

          const [book, authorsData, publishersData] = await Promise.all([
            booksApi.getById(parseInt(id)),
            authorsApi.getActive(),
            publishersApi.getActive(),
          ]);

          console.log("✓ Fetched book:", book); // Debug log
          console.log("✓ Authors count:", authorsData.length);
          console.log("✓ Publishers count:", publishersData.length);

          // Map book with author/publisher names and fix image path
          const bookWithNames = mapBookWithNames(
            book,
            authorsData,
            publishersData
          );

          console.log("✓ Book with names:", bookWithNames); // Debug log

          if (!bookWithNames) {
            throw new Error("Failed to map book data");
          }

          setProduct(bookWithNames);
          console.log("✓ Product state updated!"); // Debug log
        } else {
          // Series not supported yet
          console.log("Series not supported, redirecting...");
          navigate("/");
          return;
        }
      } catch (error) {
        console.error("❌ Failed to fetch product:", error);
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
        alert(
          `Failed to load product: ${error instanceof Error ? error.message : "Unknown error"
          }`
        );
        // Don't navigate away on error, let user see the error
      } finally {
        console.log("Setting loading to false"); // Debug log
        setLoading(false);
      }
    };

    fetchProduct();
  }, [type, id, navigate, isAuthenticated]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    if (!product) return;

    // Check if product is inactive
    if (!product.active) {
      alert("This product is currently unavailable.");
      return;
    }

    // Check if product is out of stock
    if (product.stockQuantity <= 0) {
      alert("This product is out of stock.");
      return;
    }

    try {
      if (quantity > 1) {
        // Use addMultipleToCart for quantity > 1
        await cartApi.addMultipleToCart({
          bookId: product.id,
          quantity: quantity,
        });
      } else {
        // Use addOneToCart for quantity = 1
        await cartApi.addOneToCart({ bookId: product.id });
      }

      // Also update CartContext for immediate UI update
      addToCart(product.id.toString(), type as "book" | "series", quantity);
      alert(`Added ${quantity} item(s) to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Could not add to cart. Please try again.");
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }

    if (!product) return;

    // Check if product is inactive
    if (!product.active) {
      alert("This product is currently unavailable.");
      return;
    }

    // Check if product is out of stock
    if (product.stockQuantity <= 0) {
      alert("This product is out of stock.");
      return;
    }

    // Add to cart first, then go to checkout
    try {
      if (quantity > 1) {
        await cartApi.addMultipleToCart({
          bookId: product.id,
          quantity: quantity,
        });
      } else {
        await cartApi.addOneToCart({ bookId: product.id });
      }

      // Update context
      addToCart(product.id.toString(), type as "book" | "series", quantity);

      // Navigate to cart/order
      navigate("/cart");
    } catch (error) {
      console.error("Error in buy now:", error);
      alert("Could not process request. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-beige-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 rounded-full border-beige-300 border-t-beige-700 animate-spin"></div>
          <p className="mt-4 text-lg text-beige-700">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center flex-1 bg-beige-50">
          <div className="text-center">
            <p className="text-xl text-beige-700">Product not found</p>
            <a href="/" className="mt-4 text-beige-600 hover:underline">
              Go back to home
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 px-16 py-12 bg-beige-50">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-beige-600">
          <a href="/" className="hover:underline">
            Home
          </a>{" "}
          /
          <a href={`/${type}s`} className="hover:underline">
            {" "}
            {type === "book" ? "Books" : "Series"}
          </a>{" "}
          /<span className="text-beige-900"> {product.title}</span>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left: Image & Actions */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md mb-6 overflow-hidden rounded-lg shadow-lg">
              <img
                src={product.image || "/placeholder-book.jpg"}
                alt={product.title}
                className="object-cover w-full h-auto"
              />
            </div>
            <div className="w-full max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="quantity-input" className="text-sm font-medium text-beige-800">
                  Quantity:
                </label>
                <input
                  id="quantity-input"
                  type="number"
                  min="1"
                  max={product.stockQuantity}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(
                        1,
                        Math.min(
                          product.stockQuantity,
                          parseInt(e.target.value) || 1
                        )
                      )
                    )
                  }
                  className="w-20 px-3 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
                  aria-label="Product quantity"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className="py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={!product.active || product.stockQuantity === 0}
                >
                  {!product.active
                    ? "Unavailable"
                    : product.stockQuantity > 0
                      ? "Add to Cart"
                      : "Out of Stock"}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="py-3 font-semibold transition-colors border-2 rounded-lg text-beige-700 border-beige-700 hover:bg-beige-700 hover:text-white disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed"
                  disabled={!product.active || product.stockQuantity === 0}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div>
            <h1 className="mb-4 text-4xl font-bold text-beige-900">
              {product.title}
            </h1>

            <div className="mb-6 text-3xl font-bold text-beige-900">
              ${product.price.toFixed(2)}
            </div>

            <div className="space-y-3 text-beige-700">
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Author:</span>
                <span className="col-span-2">
                  {product.authorName || `Author #${product.authorId}`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Publisher:</span>
                <span className="col-span-2">
                  {product.publisherName || `Publisher #${product.publisherId}`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Category:</span>
                <span className="col-span-2">
                  {product.categoryName || `Category #${product.categoryId}`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Published:</span>
                <span className="col-span-2">{product.publishedDate}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Stock:</span>
                <span className="col-span-2">
                  {product.stockQuantity > 0 ? (
                    <span className="text-green-600">
                      {product.stockQuantity} in stock
                    </span>
                  ) : (
                    <span className="text-red-600">Out of stock</span>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Product ID:</span>
                <span className="col-span-2">#{product.id}</span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-beige-200">
              <h3 className="mb-3 text-xl font-semibold text-beige-900">
                Description
              </h3>
              <p className="leading-relaxed text-beige-700">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="pt-12 mt-12 border-t border-beige-200">
          <h2 className="mb-6 text-3xl font-bold text-beige-900">
            Customer Reviews
          </h2>

          {/* Review Form for CUSTOMER users */}
          {isAuthenticated && user?.role === "CUSTOMER" && (
            <div className="mb-8">
              {showReviewForm ? (
                <ReviewForm
                  bookId={product.id}
                  bookTitle={product.title}
                  onSuccess={() => {
                    alert("Thank you for your review!");
                    setShowReviewForm(false);
                    setRefreshReviews((prev) => prev + 1);
                  }}
                  onCancel={() => setShowReviewForm(false)}
                />
              ) : (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-brown-600 hover:bg-brown-700"
                >
                  ✍️ Write a Review
                </button>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <p className="mb-8 text-beige-600">
              <a href="/signin" className="font-semibold hover:underline text-brown-600">
                Sign in
              </a>{" "}
              to write a review.
            </p>
          )}

          {/* Reviews List */}
          <ReviewList bookId={product.id} refreshTrigger={refreshReviews} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

