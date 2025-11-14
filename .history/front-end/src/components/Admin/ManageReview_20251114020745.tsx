import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaTrash, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import { reviewApi } from "../../api";
import type { ReviewResponse } from "../../types";

type SortField = "id" | "bookId" | "date" | "customer" | "product";
type SortOrder = "asc" | "desc";

interface Review {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  productType: "book" | "series";
  comment: string;
  date: string;
  deleteReason?: string;
}

export function ManageReview() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  // Load reviews from API
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const reviewsData = await reviewApi.getAll();

      // Transform API response to component interface
      const transformedReviews: Review[] = reviewsData.map((review: ReviewResponse) => ({
        id: review.id.toString(),
        customerId: review.userId,
        customerName: review.userName || "Unknown Customer",
        productId: review.bookId.toString(),
        productName: review.bookTitle || "Unknown Book",
        productType: "book" as const,
        comment: review.comment || "",
        date: review.createdAt,
        deleteReason: "",
      }));

      setReviews(transformedReviews);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      alert("Failed to load reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  // Filtered and sorted reviews
  const filteredReviews = useMemo(() => {
    let filtered = reviews;

    // Search filter - enhanced to include reviewID, bookID, bookTitle, comment, date
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.id.toLowerCase().includes(term) || // reviewID
          r.productId.toLowerCase().includes(term) || // bookID
          r.productName.toLowerCase().includes(term) || // bookTitle
          r.customerName.toLowerCase().includes(term) ||
          r.comment.toLowerCase().includes(term) ||
          new Date(r.date).toLocaleDateString("vi-VN").includes(term) // date
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortBy) {
        case "id":
          aVal = a.id.toLowerCase();
          bVal = b.id.toLowerCase();
          break;
        case "bookId":
          aVal = a.productId.toLowerCase();
          bVal = b.productId.toLowerCase();
          break;
        case "date":
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
        case "customer":
          aVal = a.customerName.toLowerCase();
          bVal = b.customerName.toLowerCase();
          break;
        case "product":
          aVal = a.productName.toLowerCase();
          bVal = b.productName.toLowerCase();
          break;
        default:
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [reviews, searchTerm, sortBy, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field)
      return <FaSort className="inline ml-1 text-beige-400" />;
    return sortOrder === "asc" ? (
      <FaSortUp className="inline ml-1 text-beige-600" />
    ) : (
      <FaSortDown className="inline ml-1 text-beige-600" />
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const handleDeleteReview = async () => {
    if (!selectedReview || !deleteReason.trim()) {
      alert("Please provide a reason for deleting this review");
      return;
    }

    try {
      // Delete via API
      await reviewApi.deleteByAdminStaff(parseInt(selectedReview.productId));
      
      // Update local state
      const updatedReviews = reviews.filter((r) => r.id !== selectedReview.id);
      setReviews(updatedReviews);

      // Create notification for customer (keep localStorage until backend has notification API)
      createNotification(
        `Review Deleted`,
        `Your review for "${selectedReview.productName}" has been deleted. Reason: ${deleteReason}`,
        "review_delete"
      );

      setShowDeleteModal(false);
      setSelectedReview(null);
      setDeleteReason("");
      alert("Review deleted successfully!");
    } catch (error) {
      console.error("Failed to delete review:", error);
      alert("Failed to delete review. Please try again.");
    }
  };

  const createNotification = (
    title: string,
    description: string,
    type: string
  ) => {
    const notifications = JSON.parse(
      localStorage.getItem("adminNotifications") || "[]"
    );
    notifications.unshift({
      id: Date.now().toString(),
      title,
      description,
      createdAt: new Date().toISOString(),
      type,
    });
    localStorage.setItem("adminNotifications", JSON.stringify(notifications));
  };

  const openDeleteModal = (review: Review) => {
    setSelectedReview(review);
    setDeleteReason("");
    setShowDeleteModal(true);
  };

  return (
    <div className="p-6 bg-beige-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-beige-900 font-heading">
          Review Management
        </h1>
        <p className="text-beige-600 mt-1">
          Manage and moderate customer reviews
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-beige-600">Loading reviews...</p>
        </div>
      ) : (
        <>
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">"
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-beige-400" />
          <input
            type="text"
            placeholder="Search by review ID, book ID, book title, customer, comment, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
          />
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-beige-600">
          Showing {filteredReviews.length} of {reviews.length} reviews
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-100 border-b border-beige-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  #
                </th>
                <th
                  onClick={() => handleSort("id")}
                  className="px-4 py-3 text-left text-sm font-semibold text-beige-900 cursor-pointer hover:bg-beige-200"
                >
                  Review ID {getSortIcon("id")}
                </th>
                <th
                  onClick={() => handleSort("bookId")}
                  className="px-4 py-3 text-left text-sm font-semibold text-beige-900 cursor-pointer hover:bg-beige-200"
                >
                  Book ID {getSortIcon("bookId")}
                </th>
                <th
                  onClick={() => handleSort("customer")}
                  className="px-4 py-3 text-left text-sm font-semibold text-beige-900 cursor-pointer hover:bg-beige-200"
                >
                  Customer {getSortIcon("customer")}
                </th>
                <th
                  onClick={() => handleSort("product")}
                  className="px-4 py-3 text-left text-sm font-semibold text-beige-900 cursor-pointer hover:bg-beige-200"
                >
                  Product {getSortIcon("product")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Comment
                </th>
                <th
                  onClick={() => handleSort("date")}
                  className="px-4 py-3 text-left text-sm font-semibold text-beige-900 cursor-pointer hover:bg-beige-200"
                >
                  Date {getSortIcon("date")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {paginatedReviews.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-beige-500"
                  >
                    {searchTerm ? "No reviews found matching your search" : "No reviews found"}
                  </td>
                </tr>
              ) : (
                paginatedReviews.map((review, index) => (
                  <tr key={review.id} className="hover:bg-beige-50">
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900 font-mono">
                      {review.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      <Link
                        to={`/${review.productType}/${review.productId}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-mono"
                      >
                        #{review.productId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      <Link
                        to={`/admin/customers?search=${review.customerName}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {review.customerName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      <Link
                        to={`/${review.productType}/${review.productId}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {review.productName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900 max-w-md">
                      <p className="line-clamp-2">{review.comment}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900 whitespace-nowrap">
                      {new Date(review.date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDeleteModal(review)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Delete Review (Hard Delete - Permanent)"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-beige-50 px-4 py-3 border-t border-beige-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-beige-600">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-beige-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-beige-500"
              aria-label="Items per page"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-beige-600">
              entries (Total: {filteredReviews.length})
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-beige-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-beige-100"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-beige-600">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-beige-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-beige-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Review Modal */}
      {showDeleteModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-beige-200 bg-red-50">
              <h2 className="text-2xl font-bold text-red-900 flex items-center gap-2">
                <FaTrash /> Permanently Delete Review
              </h2>
              <p className="text-red-700 text-sm mt-1">
                ⚠️ This is a HARD DELETE. The review will be permanently removed and cannot be recovered.
              </p>
            </div>
            <div className="p-6">
              <p className="text-beige-700 mb-4 font-medium">
                Are you sure you want to permanently delete this review?
              </p>

              {/* Review Details */}
              <div className="bg-beige-50 p-4 rounded-lg mb-4 border-l-4 border-red-500">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Review ID:</span>{" "}
                    <span className="font-mono">{selectedReview.id}</span>
                  </div>
                  <div>
                    <span className="font-medium">Book ID:</span>{" "}
                    <span className="font-mono">#{selectedReview.productId}</span>
                  </div>
                  <div>
                    <span className="font-medium">Customer:</span>{" "}
                    {selectedReview.customerName}
                  </div>
                  <div>
                    <span className="font-medium">Product:</span>{" "}
                    {selectedReview.productName}
                  </div>
                  <div>
                    <span className="font-medium">Comment:</span>
                    <p className="mt-1 text-beige-700 italic bg-white p-2 rounded">
                      "{selectedReview.comment}"
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(selectedReview.date).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  Deletion Reason * <span className="text-red-600">(Required)</span>
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Please provide a reason for deleting this review (e.g., spam, inappropriate content, violation of terms, etc.)..."
                  required
                />
              </div>
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> The customer will be notified about this deletion via notification system.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end bg-gray-50">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedReview(null);
                  setDeleteReason("");
                }}
                className="px-6 py-2 border border-beige-300 rounded-lg hover:bg-beige-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReview}
                disabled={!deleteReason.trim()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaTrash /> Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
