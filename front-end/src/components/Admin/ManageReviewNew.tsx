import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { reviewApi } from "../../api";
import type { ReviewResponse } from "../../types";
import {
  ManagementLayout,
  ManagementPageLayout,
  NewSortableHeader,
  SimpleTableHeader,
  NewPagination,
  SearchBar,
  TableCell,
  TableCellText,
  ActionButton,
  ActionButtonGroup,
  Modal,
  ModalActions,
  ViewDetailsContainer,
  ViewDetailsGrid,
  ViewDetailsRow,
} from "../Shared/Management";

type SortField = "id" | "bookId" | "date" | "customer" | "product";

export function ManageReviewNew() {
  const location = useLocation();
  const isStaffRoute = location.pathname.startsWith("/staff");

  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField | null>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewResponse | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  // Load reviews
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      // Use getAllFlat to get flattened array of reviews
      const reviewsData = await reviewApi.getAllFlat();

      console.log("Reviews data:", reviewsData);
      console.log("Number of reviews:", reviewsData.length);

      setReviews(reviewsData);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      alert("Failed to load reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort
  const filteredReviews = reviews
    .filter((review) => {
      const term = searchTerm.toLowerCase();
      return (
        review.id?.toString().includes(term) ||
        review.bookId?.toString().includes(term) ||
        (review.bookTitle || "").toLowerCase().includes(term) ||
        (review.userName || "").toLowerCase().includes(term) ||
        (review.comment || "").toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "id":
          aVal = a.id || 0;
          bVal = b.id || 0;
          break;
        case "bookId":
          aVal = a.bookId || 0;
          bVal = b.bookId || 0;
          break;
        case "date":
          aVal = new Date(a.createdAt || "").getTime();
          bVal = new Date(b.createdAt || "").getTime();
          break;
        case "customer":
          aVal = (a.userName || "").toLowerCase();
          bVal = (b.userName || "").toLowerCase();
          break;
        case "product":
          aVal = (a.bookTitle || "").toLowerCase();
          bVal = (b.bookTitle || "").toLowerCase();
          break;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      } else {
        return sortOrder === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sort handler
  const handleSort = (key: SortField) => {
    if (sortField === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(key);
      setSortOrder("asc");
    }
  };

  // Handlers
  const openViewModal = (review: ReviewResponse) => {
    setSelectedReview(review);
    setShowViewModal(true);
  };

  const openDeleteModal = (review: ReviewResponse) => {
    setSelectedReview(review);
    setShowDeleteModal(true);
  };

  const handleDeleteReview = async () => {
    if (!selectedReview) {
      alert("No review selected");
      return;
    }

    if (!selectedReview.userId || !selectedReview.bookId || !selectedReview.id) {
      alert("Invalid review data");
      return;
    }

    if (!deleteReason.trim()) {
      alert("Please provide a deletion reason");
      return;
    }

    try {
      // Send request with body containing userId, reviewId, and message (reason)
      await reviewApi.deleteByAdminStaff(selectedReview.bookId, {
        userId: selectedReview.userId,
        reviewId: selectedReview.id,
        message: deleteReason.trim(),
      });

      // Reload reviews
      await loadReviews();

      setShowDeleteModal(false);
      setSelectedReview(null);
      setDeleteReason("");
      alert("Review deleted successfully!");
    } catch (error) {
      console.error("Failed to delete review:", error);
      alert("Failed to delete review. Please try again.");
    }
  };

  if (loading) {
    const loadingContent = (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-b-2 rounded-full animate-spin border-beige-700"></div>
          <p className="mt-4 text-beige-600">Loading...</p>
        </div>
      </div>
    );

    return isStaffRoute ? loadingContent : <ManagementLayout>{loadingContent}</ManagementLayout>;
  }

  const content = (
    <>
      <ManagementPageLayout
        title="Review Management"
        totalCount={filteredReviews.length}
        entityName="reviews"
        searchBar={
          <SearchBar
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            placeholder="Search by review ID, book, customer, comment..."
          />
        }
        table={
          <table className="w-full">
            <thead className="bg-beige-100 border-b border-beige-200">
              <tr>
                <SimpleTableHeader label="#" />
                <NewSortableHeader
                  label="Review ID"
                  sortKey="id"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <NewSortableHeader
                  label="Book"
                  sortKey="product"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <NewSortableHeader
                  label="Customer"
                  sortKey="customer"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SimpleTableHeader label="Comment" />
                <NewSortableHeader
                  label="Date"
                  sortKey="date"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SimpleTableHeader label="Actions" align="center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {paginatedReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-beige-500">
                    No reviews found
                  </td>
                </tr>
              ) : (
                paginatedReviews.map((review, index) => (
                  <tr key={review.id} className="hover:bg-beige-50 transition-colors">
                    <TableCell>
                      <TableCellText className="font-semibold text-beige-700">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText className="font-medium">#{review.id}</TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText>{review.bookTitle || "Unknown"}</TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText>{review.userName || "Unknown"}</TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText variant="secondary" className="max-w-md truncate">
                        {review.comment || "No comment"}
                      </TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText variant="secondary">
                        {new Date(review.createdAt || "").toLocaleDateString()}
                      </TableCellText>
                    </TableCell>
                    <TableCell align="center">
                      <ActionButtonGroup>
                        <ActionButton
                          onClick={() => openViewModal(review)}
                          icon="view"
                          title="View Details"
                        />
                        <ActionButton
                          onClick={() => openDeleteModal(review)}
                          icon="delete"
                          title="Delete"
                          variant="danger"
                        />
                      </ActionButtonGroup>
                    </TableCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        }
        pagination={
          <NewPagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredReviews.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            }}
          />
        }
      />

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedReview(null);
        }}
        title={`Review #${selectedReview?.id || ""}`}
        maxWidth="2xl"
      >
        {selectedReview && (
          <>
            <ViewDetailsContainer>
              <ViewDetailsGrid>
                <ViewDetailsRow label="Review ID" value={`#${selectedReview.id}`} />
                <ViewDetailsRow label="Book ID" value={`#${selectedReview.bookId}`} />
              </ViewDetailsGrid>

              <ViewDetailsGrid>
                <ViewDetailsRow label="Book Title" value={selectedReview.bookTitle || "Unknown"} />
                <ViewDetailsRow label="Customer" value={selectedReview.userName || "Unknown"} />
              </ViewDetailsGrid>

              <ViewDetailsGrid>
                <ViewDetailsRow
                  label="Date"
                  value={new Date(selectedReview.createdAt || "").toLocaleString()}
                />
              </ViewDetailsGrid>

              {selectedReview.comment && (
                <div className="col-span-2 mt-4">
                  <h4 className="text-sm font-semibold text-beige-700 mb-2">Comment</h4>
                  <p className="text-gray-700 text-sm leading-relaxed bg-beige-50 p-4 rounded-lg">
                    {selectedReview.comment}
                  </p>
                </div>
              )}
            </ViewDetailsContainer>

            <div className="flex justify-end pt-4 mt-4 border-t">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedReview(null);
                }}
                className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedReview(null);
          setDeleteReason("");
        }}
        title={`Delete Review #${selectedReview?.id || ""}`}
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDeleteReview();
          }}
        >
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This action cannot be undone. The customer will be notified about the deletion.
              </p>
            </div>

            {selectedReview && (
              <div className="p-4 bg-beige-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Book:</strong> {selectedReview.bookTitle}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Customer:</strong> {selectedReview.userName}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Comment:</strong> {selectedReview.comment}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deletion Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                rows={3}
                placeholder="Explain why this review is being deleted..."
                required
              />
            </div>
          </div>

          <ModalActions
            onCancel={() => {
              setShowDeleteModal(false);
              setSelectedReview(null);
              setDeleteReason("");
            }}
            confirmText="Delete Review"
            cancelText="Cancel"
            confirmType="submit"
            confirmVariant="danger"
          />
        </form>
      </Modal>
    </>
  );

  return isStaffRoute ? content : <ManagementLayout>{content}</ManagementLayout>;
}
