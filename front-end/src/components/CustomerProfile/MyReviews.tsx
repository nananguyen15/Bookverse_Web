import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaComment, FaEdit, FaTrashAlt, FaStar } from "react-icons/fa";
import { reviewApi, orderApi } from "../../api";
import type { ReviewResponse } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

interface ReviewableBook {
  bookId: number;
  bookTitle: string;
  orderId: number;
  orderDate: string;
  hasReview: boolean;
}

export function MyReviews() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [reviewableBooks, setReviewableBooks] = useState<ReviewableBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load user's orders and reviews in parallel
        const [allReviews, orders] = await Promise.all([
          reviewApi.getAllFlat(),
          orderApi.getMyOrders(),
        ]);

        // Filter user's reviews
        const userReviews = allReviews.filter((r) => r.userId === user?.username);

        // Find delivered orders and extract books
        const deliveredOrders = orders.filter((order) => order.status === "DELIVERED");
        const reviewedBookIds = new Set(userReviews.map((r) => r.bookId));

        const booksMap = new Map<number, ReviewableBook>();

        deliveredOrders.forEach((order) => {
          order.orderItems.forEach((item) => {
            if (!booksMap.has(item.bookId)) {
              booksMap.set(item.bookId, {
                bookId: item.bookId,
                bookTitle: item.bookTitle,
                orderId: order.id,
                orderDate: order.createdAt,
                hasReview: reviewedBookIds.has(item.bookId),
              });
            }
          });
        });

        setReviewableBooks(Array.from(booksMap.values()));

        // Populate bookTitle in reviews from booksMap
        const enrichedReviews = userReviews.map(review => ({
          ...review,
          bookTitle: booksMap.get(review.bookId)?.bookTitle
        }));
        setReviews(enrichedReviews);
      } catch (error) {
        console.error("Failed to load data:", error);
        alert("Failed to load reviews. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const reloadData = async () => {
    try {
      // Load user's orders and reviews in parallel
      const [allReviews, orders] = await Promise.all([
        reviewApi.getAllFlat(),
        orderApi.getMyOrders(),
      ]);

      // Filter user's reviews
      const userReviews = allReviews.filter((r) => r.userId === user?.username);

      // Find delivered orders and extract books
      const deliveredOrders = orders.filter((order) => order.status === "DELIVERED");
      const reviewedBookIds = new Set(userReviews.map((r) => r.bookId));

      const booksMap = new Map<number, ReviewableBook>();

      deliveredOrders.forEach((order) => {
        order.orderItems.forEach((item) => {
          if (!booksMap.has(item.bookId)) {
            booksMap.set(item.bookId, {
              bookId: item.bookId,
              bookTitle: item.bookTitle,
              orderId: order.id,
              orderDate: order.createdAt,
              hasReview: reviewedBookIds.has(item.bookId),
            });
          }
        });
      });

      setReviewableBooks(Array.from(booksMap.values()));

      // Populate bookTitle in reviews from booksMap
      const enrichedReviews = userReviews.map(review => ({
        ...review,
        bookTitle: booksMap.get(review.bookId)?.bookTitle
      }));
      setReviews(enrichedReviews);
    } catch (error) {
      console.error("Failed to reload data:", error);
    }
  };

  const handleWriteReview = (book: ReviewableBook) => {
    // Generate slug from book title
    const slug = book.bookTitle
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Navigate to book detail page with #review hash
    navigate(`/book/${book.bookId}/${slug}#review`);
  };

  const handleEditReview = (review: ReviewResponse) => {
    const book = reviewableBooks.find((b) => b.bookId === review.bookId);
    if (book) {
      // Generate slug from book title
      const slug = book.bookTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      // Navigate to book detail page with #review hash
      navigate(`/book/${book.bookId}/${slug}#review`);
    }
  };

  const handleDeleteReview = async (bookId: number) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await reviewApi.deleteMyReview(bookId);
      await reloadData(); // Reload data
      alert("Review deleted successfully!");
    } catch (error) {
      console.error("Failed to delete review:", error);
      alert("Failed to delete review. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="mb-6 text-3xl font-bold text-beige-900">My Reviews</h2>
        <p className="text-center text-beige-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="mb-6 text-3xl font-bold text-beige-900">My Reviews</h2>

      {/* Books Available for Review */}
      {reviewableBooks.some((b) => !b.hasReview) && (
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold text-beige-900">
            Books You Can Review
          </h3>
          <div className="space-y-3">
            {reviewableBooks
              .filter((book) => !book.hasReview)
              .map((book) => (
                <div
                  key={book.bookId}
                  className="flex items-center justify-between p-4 transition-colors border rounded-lg border-beige-200 bg-beige-50 hover:bg-beige-100"
                >
                  <div>
                    <h4 className="font-semibold text-beige-900">{book.bookTitle}</h4>
                    <p className="text-sm text-beige-600">
                      Delivered on {new Date(book.orderDate).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleWriteReview(book)}
                    className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-yellow-500 rounded-lg hover:bg-yellow-600"
                  >
                    <FaStar /> Write Review
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Existing Reviews */}
      <div>
        <h3 className="mb-4 text-xl font-semibold text-beige-900">
          My Published Reviews
        </h3>
        {reviews.length === 0 ? (
          <div className="py-12 text-center text-beige-600">
            <FaComment className="mx-auto mb-4 text-4xl text-beige-400" />
            <p>No reviews yet.</p>
            <p className="mt-2 text-sm">
              Write your first review for a book you've purchased!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 transition-shadow bg-white border rounded-lg border-beige-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-beige-900">
                      {review.bookTitle || "Unknown Book"}
                    </h4>
                    <p className="text-sm text-beige-600">
                      Reviewed on {new Date(review.createdAt || "").toLocaleDateString("vi-VN")}
                    </p>
                    {review.comment && (
                      <p className="mt-3 text-beige-800">{review.comment}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="p-2 transition-colors rounded text-beige-600 hover:text-beige-900 hover:bg-beige-100"
                      title="Edit review"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.bookId!)}
                      className="p-2 transition-colors rounded text-beige-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete review"
                    >
                      <FaTrashAlt size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
