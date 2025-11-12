import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaTrash, FaComment } from "react-icons/fa";
import { Link } from "react-router-dom";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "customer" | "product">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  // Load reviews from localStorage
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = () => {
    const reviewsData = JSON.parse(localStorage.getItem("reviews") || "[]");

    // Normalize reviews
    const normalizedReviews = reviewsData.map((review: Review) => ({
      id:
        review.id ||
        Date.now().toString() + Math.random().toString(36).substr(2, 9),
      customerId: review.customerId || "",
      customerName: review.customerName || "Unknown Customer",
      productId: review.productId || "",
      productName: review.productName || "Unknown Product",
      productType: review.productType || "book",
      comment: review.comment || "",
      date: review.date || new Date().toISOString(),
      deleteReason: review.deleteReason || "",
    }));

    setReviews(normalizedReviews);
  };

  const saveReviews = (updatedReviews: Review[]) => {
    localStorage.setItem("reviews", JSON.stringify(updatedReviews));
    setReviews(updatedReviews);
  };

  // Filtered and sorted reviews
  const filteredReviews = useMemo(() => {
    let filtered = reviews;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.customerName.toLowerCase().includes(term) ||
          r.productName.toLowerCase().includes(term) ||
          r.comment.toLowerCase().includes(term)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      if (sortBy === "date") {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      } else if (sortBy === "customer") {
        aVal = a.customerName.toLowerCase();
        bVal = b.customerName.toLowerCase();
      } else {
        aVal = a.productName.toLowerCase();
        bVal = b.productName.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [reviews, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const handleDeleteReview = () => {
    if (!selectedReview || !deleteReason.trim()) {
      alert("Please provide a reason for deleting this review");
      return;
    }

    // Remove review from array
    const updatedReviews = reviews.filter((r) => r.id !== selectedReview.id);
    saveReviews(updatedReviews);

    // Create notification for customer
    createNotification(
      `Review Deleted`,
      `Your review for "${selectedReview.productName}" has been deleted. Reason: ${deleteReason}`,
      "review_delete"
    );

    setShowDeleteModal(false);
    setSelectedReview(null);
    setDeleteReason("");
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
          Manage and monitor all customer reviews
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-beige-400" />
              <input
                type="text"
                placeholder="Search by customer name, product, or review text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
              />
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="mt-4 flex gap-4 items-center">
          <span className="text-sm text-beige-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1 border border-beige-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-beige-500"
            aria-label="Sort by"
          >
            <option value="date">Date</option>
            <option value="customer">Customer</option>
            <option value="product">Product</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-3 py-1 border border-beige-300 rounded-lg text-sm hover:bg-beige-50"
          >
            {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
          </button>
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Review
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-beige-900">
                  Date
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
                    colSpan={7}
                    className="px-4 py-8 text-center text-beige-500"
                  >
                    No reviews found
                  </td>
                </tr>
              ) : (
                paginatedReviews.map((review, index) => (
                  <tr key={review.id} className="hover:bg-beige-50">
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {(currentPage - 1) * itemsPerPage + index + 1}
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
                    <td className="px-4 py-3">
                      <StarRating rating={review.rating} />
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900 max-w-md">
                      <p className="line-clamp-2">{review.comment}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-beige-900">
                      {new Date(review.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDeleteModal(review)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Review"
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
            <div className="p-6 border-b border-beige-200">
              <h2 className="text-2xl font-bold text-beige-900">
                Delete Review
              </h2>
            </div>
            <div className="p-6">
              <p className="text-beige-700 mb-4">
                Are you sure you want to delete this review?
              </p>

              {/* Review Details */}
              <div className="bg-beige-50 p-4 rounded-lg mb-4">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Customer:</span>{" "}
                    {selectedReview.customerName}
                  </div>
                  <div>
                    <span className="font-medium">Product:</span>{" "}
                    {selectedReview.productName}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Rating:</span>{" "}
                    <StarRating rating={selectedReview.rating} />
                  </div>
                  <div>
                    <span className="font-medium">Review:</span>
                    <p className="mt-1 text-beige-700 italic">
                      "{selectedReview.comment}"
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(selectedReview.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  Deletion Reason *
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  rows={3}
                  placeholder="Please provide a reason for deleting this review (e.g., spam, inappropriate content, etc.)..."
                  required
                />
              </div>
              <p className="text-sm text-beige-600 mt-2">
                Note: The customer will be notified about this deletion.
              </p>
            </div>
            <div className="p-6 border-t border-beige-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedReview(null);
                  setDeleteReason("");
                }}
                className="px-4 py-2 border border-beige-300 rounded-lg hover:bg-beige-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReview}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
