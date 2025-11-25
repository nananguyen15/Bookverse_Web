import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { booksApi, authorsApi, publishersApi, promotionApi, orderApi, reviewApi } from "../api";
import { categoriesApi } from "../api/endpoints/categories.api";
import type { Book, PromotionResponse, SubCategory, ReviewResponse } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { mapBookWithNames } from "../utils/bookHelpers";
import { getPromotionalPrice } from "../utils/promotionHelpers";
import { ReviewForm } from "../components/Review/ReviewForm";
import { ReviewList } from "../components/Review/ReviewList";
import { Footer } from "../components/layout/Footer/Footer";
import { Navbar } from "../components/layout/Navbar/Navbar";
import { IoInformationCircle } from "react-icons/io5";

export function ProductDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart, cartItems } = useCart();
  const [product, setProduct] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [subCategoryPromotions, setSubCategoryPromotions] = useState<Record<string, PromotionResponse | null>>({});
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState<ReviewResponse | null>(null);

  // Check if user can review this book
  useEffect(() => {
    const checkReviewStatus = async () => {
      if (!isAuthenticated || !id || !user) {
        setCanReview(false);
        return;
      }

      try {
        // Check eligibility (must have delivered order) and that they haven't reviewed yet
        const orders = await orderApi.getMyOrders();
        const deliveredOrders = orders.filter(order => order.status === "DELIVERED");
        const hasOrderedBook = deliveredOrders.some(order =>
          order.orderItems.some(item => item.bookId === parseInt(id))
        );

        if (!hasOrderedBook) {
          setCanReview(false);
          return;
        }

        // Check if user has already reviewed this book
        const hasReviewed = await reviewApi.isReviewed(parseInt(id));
        // Can review ONLY if ordered and NOT reviewed yet
        setCanReview(!hasReviewed);
      } catch (error) {
        console.error("Failed to check review status:", error);
        setCanReview(false);
      }
    };

    checkReviewStatus();
  }, [isAuthenticated, id, user, refreshReviews]);

  // Check URL hash and open review form if #review is present (only if user can review)
  useEffect(() => {
    console.log('Hash check effect:', {
      hash: window.location.hash,
      canReview,
      isAuthenticated,
      userRole: user?.role
    });

    // Only process the hash once canReview has been determined (not initial false state)
    if (window.location.hash === '#review') {
      if (canReview) {
        console.log('Opening review form');
        setShowReviewForm(true);
        // Scroll to review section after a short delay
        setTimeout(() => {
          const reviewSection = document.getElementById('review-section');
          if (reviewSection) {
            reviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      } else {
        console.log('Cannot review - user not eligible');
      }
    }
  }, [canReview, isAuthenticated, user?.role]);

  // Fetch active promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const [promotionsData, categoriesData] = await Promise.all([
          promotionApi.getActive(),
          categoriesApi.sub.getActive(),
        ]);

        const promotionSubCatsCache: Record<number, SubCategory[]> = {};
        for (const promo of promotionsData) {
          try {
            const subCats = await promotionApi.getPromotionSubCategories(promo.id);
            promotionSubCatsCache[promo.id] = subCats;
          } catch (error) {
            console.error(`Error fetching sub-categories for promotion ${promo.id}:`, error);
            promotionSubCatsCache[promo.id] = [];
          }
        }

        const subCatPromos: Record<string, PromotionResponse | null> = {};
        for (const subCat of categoriesData) {
          let foundPromo: PromotionResponse | null = null;

          for (const promo of promotionsData) {
            const subCats = promotionSubCatsCache[promo.id] || [];
            if (subCats.some(sc => sc.id === subCat.id)) {
              const now = new Date();
              const start = new Date(promo.startDate);
              const end = new Date(promo.endDate);
              if (now >= start && now <= end && promo.active) {
                foundPromo = promo;
                break;
              }
            }
          }

          subCatPromos[subCat.id] = foundPromo;
        }

        setSubCategoryPromotions(subCatPromos);
      } catch (error) {
        console.error("Error fetching promotions:", error);
      }
    };

    fetchPromotions();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!type || !id) {
        console.log("Missing type or id:", { type, id });
        return;
      }

      console.log("Starting fetch for:", { type, id });

      // Reset state when URL changes
      setProduct(null);
      setLoading(true);
      setQuantity(1);

      try {
        // Only support books for now (series needs backend API)
        if (type === "book") {
          console.log("Fetching book with ID:", id);

          const [book, authorsData, publishersData, categoriesData] = await Promise.all([
            booksApi.getById(parseInt(id)),
            authorsApi.getActive(),
            publishersApi.getActive(),
            categoriesApi.sub.getActive(),
          ]);

          console.log("✓ Fetched book:", book);
          console.log("✓ Authors count:", authorsData.length);
          console.log("✓ Publishers count:", publishersData.length);
          console.log("✓ Categories count:", categoriesData.length);

          // Map book with author/publisher/category names and fix image path
          const bookWithNames = mapBookWithNames(
            book,
            authorsData,
            publishersData,
            categoriesData
          );

          console.log("✓ Book with names:", bookWithNames);

          if (!bookWithNames) {
            throw new Error("Failed to map book data");
          }

          setProduct(bookWithNames);
          console.log("✓ Product state updated!");
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
      } finally {
        console.log("Setting loading to false");
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

    if (!product.active) {
      alert("This product is currently unavailable.");
      return;
    }

    if (product.stockQuantity <= 0) {
      alert("This product is out of stock.");
      return;
    }

    const itemInCart = cartItems.find(
      (item) => item.id === product.id.toString() && item.type === type
    );
    const quantityInCart = itemInCart?.quantity || 0;
    const totalQuantity = quantityInCart + quantity;

    if (totalQuantity > product.stockQuantity) {
      alert(
        `Cannot add ${quantity} item(s). You already have ${quantityInCart} in cart. Stock available: ${product.stockQuantity}`
      );
      return;
    }

    try {
      console.log("🛒 Adding to cart:", { bookId: product.id, quantity });
      await addToCart(product.id.toString(), type as "book" | "series", quantity);
      console.log("✅ Successfully added to cart");
      alert(`Added ${quantity} item(s) to cart!`);
      setQuantity(1);
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      const err = error as { response?: { data?: { message?: string; code?: number } }; message?: string };
      const errorMsg = err.response?.data?.message || err.message || "Could not add to cart";
      console.error("Error details:", err.response?.data);

      if (errorMsg.includes("unique result") || errorMsg.includes("2 results") || errorMsg.includes("Internal Server Error")) {
        alert("⚠️ Database Error: Your account has duplicate shopping carts.\n\nThis is a backend data issue that requires admin intervention.\n\nPlease contact support to fix your cart data.\n\nTechnical: User has multiple active carts in database.");
      } else {
        alert(errorMsg + ". Please try again.");
      }
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }

    const userRole = user?.role?.toLowerCase();
    if (userRole === "admin" || userRole === "staff") {
      alert("Admin and Staff accounts cannot place orders.");
      return;
    }

    if (!product) return;

    if (!product.active) {
      alert("This product is currently unavailable.");
      return;
    }

    if (product.stockQuantity <= 0) {
      alert("This product is out of stock.");
      return;
    }

    try {
      await addToCart(product.id.toString(), type as "book" | "series", quantity);
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
          </div>

          {/* Right: Product Info */}
          <div>
            <h1 className="mb-6 text-4xl font-bold text-beige-900">
              {product.title}
            </h1>

            <div className="space-y-3 text-beige-700">
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Price:</span>
                <div className="col-span-2">
                  {(() => {
                    const priceInfo = getPromotionalPrice(product, subCategoryPromotions);
                    if (priceInfo.promoPrice !== null && priceInfo.promoPrice !== undefined) {
                      return (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-green-600">
                              ${priceInfo.promoPrice.toFixed(2)}
                            </span>
                            {priceInfo.percentage && (
                              <span className="px-2 py-1 text-sm font-medium text-white bg-red-500 rounded">
                                -{priceInfo.percentage}%
                              </span>
                            )}
                          </div>
                          <span className="text-base text-gray-500 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <span className="text-lg font-bold text-beige-900">
                        ${product.price.toFixed(2)}
                      </span>
                    );
                  })()}
                </div>
              </div>
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

              {/* Quantity and Action Buttons - Only for customers */}
              {user?.role?.toLowerCase() !== "admin" && user?.role?.toLowerCase() !== "staff" && (() => {
                const itemInCart = cartItems.find(
                  (item) => item.id === product.id.toString() && item.type === type
                );
                const quantityInCart = itemInCart?.quantity || 0;
                const maxAvailable = Math.max(1, product.stockQuantity - quantityInCart);

                return (
                  <div className="pt-4 mt-4 space-y-3 border-t border-beige-200">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-semibold">Quantity:</span>
                      <div className="col-span-2">
                        <input
                          id="quantity-input"
                          type="number"
                          min="1"
                          max={maxAvailable}
                          value={quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;

                            // Show warning if user tries to exceed available quantity
                            if (value > maxAvailable && quantityInCart > 0) {
                              setShowWarning(true);
                              // Auto-hide after 3 seconds
                              setTimeout(() => setShowWarning(false), 5000);
                            } else {
                              setShowWarning(false);
                            }

                            setQuantity(Math.max(1, Math.min(maxAvailable, value)));
                          }}
                          className="w-20 px-3 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
                          aria-label="Product quantity"
                        />
                        {showWarning && quantityInCart > 0 && (
                          <p className="flex items-center gap-1 mt-1 text-sm text-amber-600">
                            <IoInformationCircle className="shrink-0" size={16} />
                            <span>You have {quantityInCart} in cart. Only {maxAvailable} more available.</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
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
                );
              })()}
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
        <div id="review-section" className="pt-12 mt-12 border-t border-beige-200">
          <h2 className="mb-6 text-3xl font-bold text-beige-900">
            Customer Reviews
          </h2>

          {/* Review Form for CUSTOMER users who have purchased this book */}
          {isAuthenticated && user?.role?.toUpperCase() === "CUSTOMER" && canReview && (
            <div className="mb-8">
              {showReviewForm ? (
                <ReviewForm
                  bookId={product.id}
                  bookTitle={product.title}
                  existingReview={existingReview ? { comment: existingReview.comment } : undefined}
                  onSuccess={() => {
                    alert(existingReview ? "Review updated successfully!" : "Thank you for your review!");
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
                  {existingReview ? "✍️ Edit Your Review" : "✍️ Write a Review"}
                </button>
              )}
            </div>
          )}

          {/* Message for customers who haven't purchased this book */}
          {isAuthenticated && user?.role?.toUpperCase() === "CUSTOMER" && !canReview && (
            <p className="mb-8 text-beige-600">
              You can only review books you have purchased and received.
            </p>
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
