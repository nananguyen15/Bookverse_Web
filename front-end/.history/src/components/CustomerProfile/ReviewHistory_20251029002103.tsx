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

export function ReviewHistory() {
  const [reviews, setReviews] = useState<Review[]>([]);

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

  if (reviews.length === 0) {
    return (
      <div className="p-6 text-center bg-white rounded-lg shadow-sm text-beige-600">
        <h2 className="mb-6 text-2xl font-bold text-beige-900">My Reviews</h2>
        <p>You have not written any reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-beige-900">My Reviews</h2>
      <div className="space-y-6">
        {reviews.map((review) => (
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
    </div>
  );
}
