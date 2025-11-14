import { useState, useEffect } from "react";
import { authorsApi } from "../../api";
import type { Author, Book } from "../../types";
import { transformImageUrl, FALLBACK_IMAGES } from "../../utils/imageHelpers";
import { FaPlus } from "react-icons/fa";
import {
  TableHeader,
  SortableTableHeader,
  TableCell,
  TableCellText,
  ActionButton,
  ActionButtonGroup,
  StatusBadge,
  FilterBar,
  Pagination,
  Modal,
  ModalActions,
  AuthorForm,
  type AuthorFormData,
  ViewDetailsContainer,
  ViewDetailsGrid,
  ViewDetailsRow,
} from "../Shared/Management";

type StatusFilter = "all" | "active" | "inactive";
type SortField = "id" | "name";

export function AuthorManagement() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBooksModal, setShowBooksModal] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [authorBooks, setAuthorBooks] = useState<Book[]>([]);

  // Form state
  const [formData, setFormData] = useState<AuthorFormData>({
    name: "",
    bio: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Load authors
  useEffect(() => {
    loadAuthors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadAuthors = async () => {
    try {
      setLoading(true);
      let data: Author[];

      if (statusFilter === "active") {
        data = await authorsApi.getActive();
      } else if (statusFilter === "inactive") {
        data = await authorsApi.getInactive();
      } else {
        data = await authorsApi.getAll();
      }

      setAuthors(data);
    } catch (error) {
      console.error("Error loading authors:", error);
      alert("Unable to load author list");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort
  const filteredAuthors = authors
    .filter((author) => {
      const matchSearch =
        author.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    })
    .sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "id":
          aVal = a.id;
          bVal = b.id;
          break;
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortOrder === "asc"
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage);
  const paginatedAuthors = filteredAuthors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sort handler
  const handleSort = (key: string) => {
    const newSortField = key as SortField;
    if (sortField === newSortField) {
      // If clicking the same column, toggle sort order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // If clicking a new column, set it as sort field and reset to ascending
      setSortField(newSortField);
      setSortOrder("asc");
    }
  };

  // Handlers
  const handleCreate = async () => {
    try {
      // Trim and validate name
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        alert("Tên tác giả không được để trống!");
        return;
      }

      // Validate bio - bắt buộc phải có
      const trimmedBio = formData.bio.trim();
      if (!trimmedBio) {
        alert("Mô tả / Biography không được để trống!");
        return;
      }

      // Prepare clean data
      const createData: any = {
        name: trimmedName,
        bio: trimmedBio,
      };

      // Handle image upload
      if (imageFile) {
        createData.imageFile = imageFile;
        console.log("📤 Creating author with image file:", imageFile.name);
      } else if (formData.image && formData.image.trim()) {
        createData.image = formData.image.trim();
        console.log("📤 Creating author with image URL:", formData.image);
      }

      await authorsApi.create(createData);
      alert("Author created successfully!");
      setShowCreateModal(false);
      resetForm();
      loadAuthors();
    } catch (error: any) {
      console.error("Error creating author:", error);
      console.error("Error response:", error.response?.data);
      alert(`Unable to create author: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAuthor) return;

    try {
      console.log("📝 Updating author:", selectedAuthor.id);
      console.log("📋 Form data (raw):", formData);

      // Trim and validate name
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        alert("Tên tác giả không được để trống!");
        return;
      }

      // Validate bio - bắt buộc phải có
      const trimmedBio = formData.bio.trim();
      if (!trimmedBio) {
        alert("Mô tả / Biography không được để trống!");
        return;
      }

      // Prepare update data - MUST include active field
      const updateData: any = {
        name: trimmedName,
        bio: trimmedBio,
        active: selectedAuthor.active, // Keep current active status
      };

      // Handle image update
      if (imageFile) {
        updateData.imageFile = imageFile;
        console.log("📤 Updating author with image file:", imageFile.name);
      } else if (formData.image && formData.image.trim()) {
        updateData.image = formData.image.trim();
        console.log("📤 Updating author with image URL:", formData.image);
      }

      console.log("🔄 Sending update data:", JSON.stringify(updateData, null, 2));
      console.log("🔍 Data keys:", Object.keys(updateData));

      const result = await authorsApi.update(selectedAuthor.id, updateData);
      console.log("✅ Update success:", result);

      alert("Updated successfully!");
      setShowEditModal(false);
      resetForm();
      await loadAuthors();
    } catch (error: any) {
      console.error("❌ Error updating author:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Full error:", error);

      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      alert(`Unable to update author: ${errorMsg}`);
    }
  };

  const handleToggleStatus = async (author: Author) => {
    try {
      if (author.active) {
        await authorsApi.deactivate(author.id);
        alert("Đã ẩn tác giả!");
      } else {
        await authorsApi.activate(author.id);
        alert("Đã kích hoạt lại tác giả!");
      }
      loadAuthors();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Không thể thay đổi trạng thái");
    }
  };

  const handleViewBooks = async (author: Author) => {
    try {
      setSelectedAuthor(author);
      const books = await authorsApi.getBooksByAuthorId(author.id);
      setAuthorBooks(books);
      setShowBooksModal(true);
    } catch (error) {
      console.error("Error loading books:", error);
      alert("Unable to load author's book list");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      bio: "",
      image: "",
    });
    setImageFile(null);
    setSelectedAuthor(null);
  };

  const openEditModal = (author: Author) => {
    setSelectedAuthor(author);
    setFormData({
      name: author.name,
      bio: author.bio || "",
      image: author.image || "",
    });
    setShowEditModal(true);
  };

  const openViewModal = (author: Author) => {
    setSelectedAuthor(author);
    setShowViewModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-b-2 rounded-full animate-spin border-beige-700"></div>
          <p className="mt-4 text-beige-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-beige-900">Quản Lý Tác Giả</h1>
          <p className="mt-1 text-sm text-beige-600">
            Tổng số: {filteredAuthors.length} tác giả
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
        >
          <FaPlus /> Add Author
        </button>
      </div>

      {/* Filters */}
      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by author name..."
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value as StatusFilter);
          setCurrentPage(1);
        }}
        statusOptions={[
          { value: "all", label: "All Statuses" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Hidden" }
        ]}
      />

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-beige-100">
            <tr>
              <SortableTableHeader
                sortable
                sortKey="id"
                currentSortField={sortField}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              >
                ID
              </SortableTableHeader>
              <TableHeader>Image</TableHeader>
              <SortableTableHeader
                sortable
                sortKey="name"
                currentSortField={sortField}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              >
                Author Name
              </SortableTableHeader>
              <TableHeader>Description</TableHeader>
              <TableHeader align="center">Status</TableHeader>
              <TableHeader align="center">Actions</TableHeader>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedAuthors.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No authors found
                </td>
              </tr>
            ) : (
              paginatedAuthors.map((author) => (
                <tr
                  key={author.id}
                  className="transition-colors hover:bg-beige-50"
                >
                  <TableCell>
                    <TableCellText variant="secondary" className="font-mono text-xs">{author.id}</TableCellText>
                  </TableCell>
                  <TableCell>
                    <img
                      src={transformImageUrl(author.image) || FALLBACK_IMAGES.author}
                      alt={author.name}
                      className="object-cover w-12 h-12 border-2 border-gray-200 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGES.author;
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TableCellText className="font-medium">{author.name}</TableCellText>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={author.bio || "No description"}>
                      <TableCellText variant="secondary">
                        {author.bio || "No description"}
                      </TableCellText>
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge active={author.active} />
                  </TableCell>
                  <TableCell align="center">
                    <ActionButtonGroup>
                      <ActionButton
                        icon="view"
                        onClick={() => openViewModal(author)}
                        title="View Details"
                      />
                      <ActionButton
                        icon="book"
                        onClick={() => handleViewBooks(author)}
                        title="View Books"
                      />
                      <ActionButton
                        icon="edit"
                        onClick={() => openEditModal(author)}
                        title="Edit"
                      />
                      <ActionButton
                        icon={author.active ? "deactivate" : "activate"}
                        onClick={() => handleToggleStatus(author)}
                        variant={author.active ? "danger" : "success"}
                        title={author.active ? "Hide" : "Activate"}
                      />
                    </ActionButtonGroup>
                  </TableCell>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredAuthors.length}
        onPageChange={setCurrentPage}
      />

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Add New Author"
        maxWidth="2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <AuthorForm
            formData={formData}
            onUpdate={setFormData}
            onImageUpload={setImageFile}
            isEdit={false}
          />
          <ModalActions
            onCancel={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            confirmText="Create Author"
            cancelText="Cancel"
            confirmType="submit"
          />
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal && !!selectedAuthor}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Author"
        maxWidth="2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdate();
          }}
        >
          <AuthorForm
            formData={formData}
            onUpdate={setFormData}
            onImageUpload={setImageFile}
            isEdit={true}
          />
          <ModalActions
            onCancel={() => {
              setShowEditModal(false);
              resetForm();
            }}
            confirmText="Update Author"
            cancelText="Cancel"
            confirmType="submit"
          />
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal && !!selectedAuthor}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAuthor(null);
        }}
        title="Author Details"
        maxWidth="2xl"
      >
        {selectedAuthor && (
          <ViewDetailsContainer>
            {selectedAuthor.image && (
              <div className="flex justify-center mb-4">
                <img
                  src={transformImageUrl(selectedAuthor.image) || FALLBACK_IMAGES.author}
                  alt={selectedAuthor.name}
                  className="object-cover w-32 h-32 border-2 border-gray-300 rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGES.author;
                  }}
                />
              </div>
            )}
            <ViewDetailsGrid columns={1}>
              <ViewDetailsRow
                label="Name"
                value={<span className="text-xl font-bold">{selectedAuthor.name}</span>}
              />
              <ViewDetailsRow
                label="Status"
                value={
                  selectedAuthor.active ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-gray-600">Hidden</span>
                  )
                }
              />
              {selectedAuthor.bio && (
                <ViewDetailsRow label="Biography" value={selectedAuthor.bio} />
              )}
            </ViewDetailsGrid>
          </ViewDetailsContainer>
        )}
      </Modal>

      {/* Books Modal */}
      {showBooksModal && selectedAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-2xl font-bold text-beige-900">
              Sách của {selectedAuthor.name}
            </h2>
            {authorBooks.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                Chưa có sách nào của tác giả này
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {authorBooks.map((book) => (
                  <div
                    key={book.id}
                    className="p-4 transition-shadow border rounded-lg hover:shadow-md"
                  >
                    <img
                      src={transformImageUrl(book.image) || FALLBACK_IMAGES.book}
                      alt={book.title}
                      className="object-cover w-full h-48 mb-2 rounded"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGES.book;
                      }}
                    />
                    <h3 className="font-medium text-gray-900 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(book.price)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-4 mt-4 border-t">
              <button
                onClick={() => {
                  setShowBooksModal(false);
                  setSelectedAuthor(null);
                  setAuthorBooks([]);
                }}
                className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
