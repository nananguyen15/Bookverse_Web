import { useState } from "react";
import { reviewApi } from "../../api/endpoints";
import type { CreateReviewRequest, UpdateReviewRequest } from "../../types/api/review.types";

type ReviewFormProps = {
  bookId: number;
  bookTitle?: string;
  existingReview?: {
    rating: number;
    comment?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function ReviewForm({
  bookId,
  bookTitle,
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUpdate = !!existingReview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isUpdate) {
        const data: UpdateReviewRequest = {
          bookId,
          comment: comment.trim() || undefined,
        };
        await reviewApi.update(data);
      } else {
        const data: CreateReviewRequest = {
          bookId,
          comment: comment.trim() || undefined,
        };
        await reviewApi.create(data);
      }

      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message ||
          "Có lỗi xảy ra. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-brown-800 mb-4">
        {isUpdate ? "Edit Review" : "Write a Review"}
        {bookTitle && (
          <span className="text-base font-normal text-brown-600 ml-2">
            for "{bookTitle}"
          </span>
        )}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-brown-700 font-medium mb-2">
            Đánh giá <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-3xl focus:outline-none transition-transform hover:scale-110"
              >
                {star <= (hoveredRating || rating) ? (
                  <span className="text-yellow-400">★</span>
                ) : (
                  <span className="text-gray-300">★</span>
                )}
              </button>
            ))}
            {/* <span className="ml-2 text-brown-600 self-center">
              {rating > 0 ? `${rating}/5` : "Chưa chọn"}
            </span> */}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label
            htmlFor="comment"
            className="block text-brown-700 font-medium mb-2"
          >
            Nhận xét (tùy chọn)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
            rows={4}
            className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="flex-1 bg-brown-600 text-white px-6 py-2 rounded-lg hover:bg-brown-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Đang xử lý..." : isUpdate ? "Cập nhật" : "Gửi đánh giá"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 border border-brown-600 text-brown-600 px-6 py-2 rounded-lg hover:bg-beige-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
