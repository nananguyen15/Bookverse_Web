import { useState, useEffect } from "react";
import { FaStar, FaRegStar, FaTrashAlt } from "react-icons/fa";

interface Review {
  id: number;
  productName: string;
  productId: string;
  rating: number;
  comment: string;
  date: string;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) =>
      i < rating ? (
        <FaStar key={i} className="text-yellow-400" />
      ) : (
        <FaRegStar key={i} className="text-gray-300" />
      )
    )}
  </div>
);

type ReviewFilter = "all" | "5-star" | "4-star" | "3-star" | "2-star" | "1-star";

export function ReviewHistory() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>("all");

  useEffect(() => {
    // Load reviews from localStorage
    const storedReviews = JSON.parse(localStorage.getItem("userReviews") || "[]");
    setReviews(storedReviews);
  }, []);

  const handleDelete = (reviewId: number) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      const updatedReviews = reviews.filter((r) => r.id !== reviewId);
      setReviews(updatedReviews);
      localStorage.setItem("userReviews", JSON.stringify(updatedReviews));
    }
  };

  const getFilteredReviews = () => {
    if (activeFilter === "all") return reviews;
    const rating = parseInt(activeFilter.charAt(0));
    return reviews.filter((r) => r.rating === rating);
  };

  const filteredReviews = getFilteredReviews();

  const getCountByRating = (rating: number) => {
    return reviews.filter((r) => r.rating === rating).length;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="mb-6 text-3xl font-bold text-beige-900">My Reviews</h2>
      
      {/* Filter Tabs */}
      <div className="mb-6 border-b border-beige-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveFilter("all")}
            className={`pb-3 text-base font-medium transition-colors ${
              activeFilter === "all"
                ? "text-beige-900 border-b-2 border-beige-700"
                : "text-beige-600 hover:text-beige-800"
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveFilter("5-star")}
            className={`pb-3 text-base font-medium transition-colors ${
              activeFilter === "5-star"
                ? "text-beige-900 border-b-2 border-beige-700"
                : "text-beige-600 hover:text-beige-800"
            }`}
          >
            5 Star ({getCountByRating(5)})
          </button>
          <button
            onClick={() => setActiveFilter("4-star")}
            className={`pb-3 text-base font-medium transition-colors ${
              activeFilter === "4-star"
                ? "text-beige-900 border-b-2 border-beige-700"
                : "text-beige-600 hover:text-beige-800"
            }`}
          >
            4 Star ({getCountByRating(4)})
          </button>
          <button
            onClick={() => setActiveFilter("3-star")}
            className={`pb-3 text-base font-medium transition-colors ${
              activeFilter === "3-star"
                ? "text-beige-900 border-b-2 border-beige-700"
                : "text-beige-600 hover:text-beige-800"
            }`}
          >
            3 Star ({getCountByRating(3)})
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="py-12 text-center text-beige-600">
          <FaStar className="mx-auto mb-4 text-4xl text-beige-400" />
          <p>No reviews in this category yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <div key={review.id} className="p-4 border rounded-lg border-beige-200 bg-beige-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-beige-900">{review.productName}</h3>
                  <p className="text-sm text-beige-600">Reviewed on: {review.date}</p>
                  <div className="flex items-center my-2">
                    <StarRating rating={review.rating} />
                    <span className="ml-2 text-sm font-bold text-beige-700">{review.rating}.0</span>
                  </div>
                  <p className="mt-1 text-beige-800">{review.comment}</p>
                </div>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="ml-4 text-beige-400 hover:text-red-600"
                  title="Delete review"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
