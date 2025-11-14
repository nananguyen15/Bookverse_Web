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
        await reviewApi.deleteByAdminStaff(bookId);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-600 mx-auto"></div>
        <p className="text-brown-600 mt-2">Lo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-beige-50 rounded-lg">
        <p className="text-brown-600">Chưa có đánh giá nào cho sách này.</p>
        <p className="text-brown-500 text-sm mt-2">
          Hãy là người đầu tiên đánh giá!
        </p>
      </div>
    );
  }

  // Calculate average rating
  // const averageRating =
  //   reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  // return (
  //   <div className="space-y-6">
  //     {/* Summary */}
  //     <div className="bg-beige-50 p-4 rounded-lg">
  //       <div className="flex items-center gap-4">
  //         <div className="text-center">
  //           <div className="text-4xl font-bold text-brown-800">
  //             {averageRating.toFixed(1)}
  //           </div>
  //           <div className="flex justify-center mt-1">
  //             {renderStars(Math.round(averageRating))}
  //           </div>
  //         </div>
  //         <div className="border-l border-beige-300 pl-4">
  //           <p className="text-brown-700 font-medium">
  //             {reviews.length} đánh giá
  //           </p>
  //           <p className="text-brown-600 text-sm">
  //             Từ người đọc trên BookVerse
  //           </p>
  //         </div>
  //       </div>
  //     </div>

  return (
    <div className="space-y-6">
      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => {
          // Skip reviews without ID
          if (!review.id) return null;

          // Compare username or userId (backend returns userId as string)
          const isOwnReview = user?.username === review.userId;
          const canDelete =
            isOwnReview || user?.role === "ADMIN" || user?.role === "STAFF";

          return (
            <div
              key={review.id}
              className="bg-white p-4 rounded-lg border border-beige-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-brown-800">
                    {review.userName || "Người dùng"}
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
                {canDelete && (
                  <button
                    onClick={() => handleDelete(review.id!, isOwnReview)}
                    disabled={deletingId === review.id}
                    className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                  >
                    {deletingId === review.id ? "Đang xóa..." : "Xóa"}
                  </button>
                )}
              </div>

              {/* {renderStars(review.rating)} */}

              {review.comment && (
                <p className="mt-3 text-brown-700">{review.comment}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
