import { useState, useEffect } from "react";
import { FaComment, FaTrashAlt } from "react-icons/fa";

interface Review {
  id: number;
  productName: string;
  productId: string;
  comment: string;
  date: string;
}

export function ReviewHistory() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    // Load reviews from localStorage
    const storedReviews = JSON.parse(
      localStorage.getItem("userReviews") || "[]"
    );
    setReviews(storedReviews);
  }, []);

  const handleDelete = (reviewId: number) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      const updatedReviews = reviews.filter((r) => r.id !== reviewId);
      setReviews(updatedReviews);
      localStorage.setItem("userReviews", JSON.stringify(updatedReviews));
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="mb-6 text-3xl font-bold text-beige-900">My Reviews</h2>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="py-12 text-center text-beige-600">
          <FaComment className="mx-auto mb-4 text-4xl text-beige-400" />
          <p>No reviews yet.</p>
          <p className="mt-2 text-sm">
            Your reviews will appear here after you write them.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 border rounded-lg border-beige-200 bg-beige-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-beige-900">
                    {review.productName}
                  </h3>
                  <p className="text-sm text-beige-600">
                    Reviewed on: {review.date}
                  </p>
                  <p className="mt-3 text-beige-800">{review.comment}</p>
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
