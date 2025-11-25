import { useState, useEffect, useCallback } from "react";
import { reviewApi } from "../../api/endpoints";
import type { ReviewResponse } from "../../types/api/review.types";
import { useAuth } from "../../contexts/AuthContext";

type ReviewListProps = {
  bookId: number;
  refreshTrigger?: number; // Increment to force refresh
};

export function ReviewList({ bookId, refreshTrigger = 0 }: ReviewListProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editComment, setEditComment] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reviewApi.getByBookId(bookId);
      setReviews(data);
    } catch (err: unknown) {
      setError("Can not load reviews. Please try again.");
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshTrigger]);

  const handleDelete = async (reviewId: number, isOwnReview: boolean) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    setDeletingId(reviewId);
    try {
      if (isOwnReview) {
        await reviewApi.deleteMyReview(bookId);
      } else {
        // Admin/Staff delete
        await reviewApi.deleteByAdminStaff(bookId, {
          userId: reviews.find(r => r.id === reviewId)?.userId || "",
          reviewId: reviewId
        });
      }
      // Refresh reviews after delete
      await fetchReviews();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(
        error.response?.data?.message || "Không thể xóa đánh giá. Vui lòng thử lại."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (review: ReviewResponse) => {
    setEditingReviewId(review.id);
    setEditComment(review.comment || "");
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditComment("");
  };

  const handleUpdateReview = async () => {
    if (!editComment.trim()) {
      alert("Please write a comment");
      return;
    }

    setUpdating(true);
    try {
      await reviewApi.update({
        bookId: bookId,
        comment: editComment.trim()
      });
      // Refresh reviews after update
      await fetchReviews();
      setEditingReviewId(null);
      setEditComment("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(
        error.response?.data?.message || "Failed to update review. Please try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brown-600"></div>
        <p className="mt-2 text-beige-600">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-beige-600">
          No reviews yet. Be the first to leave a review!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => {
          // Skip reviews without ID
          if (!review.id) return null;

          // Compare username (backend returns userId as UUID string, but userName is the login username)
          const isOwnReview = user?.username === review.userName;
          const canDelete =
            isOwnReview || user?.role === "ADMIN" || user?.role === "STAFF";
          const isEditing = editingReviewId === review.id;

          return (
            <div
              key={review.id}
              className="bg-white p-4 rounded-lg border border-beige-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-brown-800">
                    {review.userName || "User"}
                    {isOwnReview && (
                      <span className="ml-2 text-xs bg-brown-100 text-brown-700 px-2 py-1 rounded">
                        Bạn
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-brown-500">
                    {formatDate(review.createdAt || "")}
                  </p>
                </div>
                <div className="flex gap-2">
                  {isOwnReview && !isEditing && (
                    <button
                      onClick={() => handleEditClick(review)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                  )}
                  {canDelete && !isEditing && (
                    <button
                      onClick={() => handleDelete(review.id!, isOwnReview)}
                      disabled={deletingId === review.id}
                      className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                    >
                      {deletingId === review.id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </div>

              {/* {renderStars(review.rating)} */}

              {isEditing ? (
                // Inline Edit Form
                <div className="mt-3">
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    placeholder="Write your comment here..."
                    rows={4}
                    className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleUpdateReview}
                      disabled={updating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {updating ? "Updating..." : "Update"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={updating}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display Review Comment
                review.comment && (
                  <p className="mt-3 text-brown-700">{review.comment}</p>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
