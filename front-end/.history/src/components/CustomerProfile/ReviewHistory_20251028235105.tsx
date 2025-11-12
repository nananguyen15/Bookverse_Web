import React, { useState } from "react";
import { FaStar, FaRegStar, FaTrashAlt } from "react-icons/fa";

// Mock data - replace with actual API calls
const mockReviews = [
  {
    id: 1,
    productName: "The Whispering Woods",
    productId: "book-123",
    rating: 4,
    comment: "A truly captivating story. I couldn't put it down! The world-building is fantastic.",
    date: "2025-10-15",
  },
  {
    id: 2,
    productName: "Echoes of the Past",
    productId: "book-456",
    rating: 5,
    comment: "Absolutely brilliant. The characters felt so real. Highly recommended.",
    date: "2025-09-28",
  },
  {
    id: 3,
    productName: "City of Glass",
    productId: "series-789",
    rating: 3,
    comment: "It was an okay read. The plot was a bit predictable, but the ending was satisfying.",
    date: "2025-09-10",
  },
];

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
  const [reviews, setReviews] = useState(mockReviews);

  const handleDelete = (reviewId: number) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      const updatedReviews = reviews.filter((r) => r.id !== reviewId);
      setReviews(updatedReviews);
      // Here you would also make an API call to delete it from the server
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center text-gray-500">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">My Reviews</h2>
        <p>You have not written any reviews yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-800">My Reviews</h2>
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{review.productName}</h3>
                <p className="text-sm text-gray-500">Reviewed on: {review.date}</p>
                <div className="flex items-center my-2">
                  <StarRating rating={review.rating} />
                  <span className="ml-2 text-sm font-bold text-gray-700">{review.rating}.0</span>
                </div>
                <p className="mt-1 text-gray-700">{review.comment}</p>
              </div>
              <button onClick={() => handleDelete(review.id)} className="text-gray-400 hover:text-red-600">
                <FaTrashAlt />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
