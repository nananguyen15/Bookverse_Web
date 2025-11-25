import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { authorsApi } from "../../api";
import type { Author, Book } from "../../types";
import { transformImageUrl, FALLBACK_IMAGES } from "../../utils/imageHelpers";
import {
  ManagementLayout,
  ManagementPageLayout,
  NewSortableHeader,
  SimpleTableHeader,
  NewPagination,
  SearchBar,
  FilterDropdown,
  TableCell,
  TableCellText,
  ActionButton,
  ActionButtonGroup,
  StatusBadge,
  Modal,
  ModalActions,
  ViewDetailsContainer,
  ViewDetailsGrid,
  ViewDetailsRow,
  AuthorForm,
  type AuthorFormData,
} from "../Shared/Management";

type StatusFilter = "all" | "active" | "inactive";
type SortField = "no" | "id" | "name";

interface AuthorManagementNewProps {
  noLayout?: boolean; // When true, renders without ManagementLayout wrapper (for use in StaffLayout)
}

export function AuthorManagementNew({ noLayout = false }: AuthorManagementNewProps = {}) {
  const location = useLocation();
  const isStaffRoute = location.pathname.startsWith("/staff") || noLayout;
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField | null>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    .filter((author) =>
      author.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((author, index) => ({ ...author, originalIndex: index }))
    .sort((a, b) => {
      if (!sortField) return 0;

      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "no":
          aVal = a.originalIndex;
          bVal = b.originalIndex;
          break;
        case "id":
          aVal = a.id;
          bVal = b.id;
          break;
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
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
  const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage);
  const paginatedAuthors = filteredAuthors.slice(
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

  // CRUD handlers
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

  const openBooksModal = async (author: Author) => {
    setSelectedAuthor(author);
    try {
      const books = await authorsApi.getBooks(author.id);
      setAuthorBooks(books);
      setShowBooksModal(true);
    } catch (error) {
      console.error("Error loading author books:", error);
      alert("Failed to load author's books");
    }
  };

  const handleCreate = async () => {
    try {
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        alert("Author name is required!");
        return;
      }

      // Validate image upload
      if (imageFile) {
        // Check if it's an image file
        if (!imageFile.type.startsWith('image/')) {
          alert("Please upload an image file (jpg, png, gif, webp, etc.)");
          return;
        }
        // Check file size (5MB = 5 * 1024 * 1024 bytes)
        if (imageFile.size > 5 * 1024 * 1024) {
          alert("Image file size must be less than 5MB");
          return;
        }
      } else if (formData.image && formData.image.trim()) {
        // Validate URL format
        const imageUrl = formData.image.trim();
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('/')) {
          alert("Image URL must start with http://, https://, or /");
          return;
        }
      }

      const createData: Record<string, string | File> = {
        name: trimmedName,
      };

      if (formData.bio && formData.bio.trim()) {
        createData.bio = formData.bio.trim();
      }

      if (imageFile) {
        createData.imageFile = imageFile;
      } else if (formData.image && formData.image.trim()) {
        createData.image = formData.image.trim();
      }

      await authorsApi.create(createData);
      alert("Author created successfully!");
      setShowCreateModal(false);
      resetForm();
      loadAuthors();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error("Error creating author:", err);
      alert(`Failed to create author: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAuthor) return;

    try {
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        alert("Author name is required!");
        return;
      }

      // Validate image upload
      if (imageFile) {
        // Check if it's an image file
        if (!imageFile.type.startsWith('image/')) {
          alert("Please upload an image file (jpg, png, gif, webp, etc.)");
          return;
        }
        // Check file size (5MB = 5 * 1024 * 1024 bytes)
        if (imageFile.size > 5 * 1024 * 1024) {
          alert("Image file size must be less than 5MB");
          return;
        }
      } else if (formData.image && formData.image.trim()) {
        // Validate URL format
        const imageUrl = formData.image.trim();
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('/')) {
          alert("Image URL must start with http://, https://, or /");
          return;
        }
      }

      const updateData: Record<string, string | File> = {
        name: trimmedName,
      };

      if (formData.bio && formData.bio.trim()) {
        updateData.bio = formData.bio.trim();
      }

      if (imageFile) {
        updateData.imageFile = imageFile;
      } else if (formData.image && formData.image.trim()) {
        updateData.image = formData.image.trim();
      }

      await authorsApi.update(selectedAuthor.id, updateData);
      alert("Author updated successfully!");
      setShowEditModal(false);
      resetForm();
      loadAuthors();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error("Error updating author:", err);
      alert(`Failed to update author: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleToggleStatus = async (author: Author) => {
    const action = author.active ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this author?`)) return;

    try {
      if (author.active) {
        await authorsApi.deactivate(author.id);
      } else {
        await authorsApi.activate(author.id);
      }
      loadAuthors();
    } catch (error) {
      console.error(`Error ${action} author:`, error);
      alert(`Failed to ${action} author`);
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
        title="Author Management"
        totalCount={filteredAuthors.length}
        entityName="authors"
        onAddClick={() => setShowCreateModal(true)}
        addButtonLabel="Add Author"
        searchBar={
          <SearchBar
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            placeholder="Search by author name..."
          />
        }
        filterBar={
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value as StatusFilter);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        }
        table={
          <table className="w-full">
            <thead className="bg-beige-100 border-b border-beige-200">
              <tr>
                <NewSortableHeader
                  label="No"
                  sortKey="no"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SimpleTableHeader label="Photo" />
                <NewSortableHeader
                  label="Name"
                  sortKey="name"
                  currentSort={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SimpleTableHeader label="Bio" />
                <SimpleTableHeader label="Books" align="center" />
                <SimpleTableHeader label="Status" align="center" />
                <SimpleTableHeader label="Actions" align="center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {paginatedAuthors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-beige-500">
                    No authors found
                  </td>
                </tr>
              ) : (
                paginatedAuthors.map((author) => (
                  <tr key={author.id} className="hover:bg-beige-50 transition-colors">
                    <TableCell>
                      <TableCellText className="font-semibold text-beige-700">
                        {author.originalIndex + 1}
                      </TableCellText>
                    </TableCell>
                    <TableCell>
                      <img
                        src={transformImageUrl(author.image) || FALLBACK_IMAGES.author}
                        alt={author.name}
                        className="object-cover w-12 h-12 border border-beige-200 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGES.author;
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TableCellText className="font-medium">{author.name}</TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText variant="secondary" className="max-w-md truncate">
                        {author.bio || "No bio available"}
                      </TableCellText>
                    </TableCell>
                    <TableCell align="center">
                      <ActionButton
                        onClick={() => openBooksModal(author)}
                        icon="viewBooks"
                        title="View Books"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <StatusBadge active={author.active} />
                    </TableCell>
                    <TableCell align="center">
                      <ActionButtonGroup>
                        <ActionButton
                          onClick={() => openViewModal(author)}
                          icon="view"
                          title="View Details"
                        />
                        <ActionButton
                          onClick={() => openEditModal(author)}
                          icon="edit"
                          title="Edit"
                        />
                        <ActionButton
                          onClick={() => handleToggleStatus(author)}
                          icon={author.active ? "deactivate" : "activate"}
                          title={author.active ? "Deactivate" : "Activate"}
                          variant={author.active ? "danger" : "success"}
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
            totalItems={filteredAuthors.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            }}
          />
        }
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
        isOpen={showEditModal}
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
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAuthor(null);
        }}
        title="Author Details"
        maxWidth="2xl"
      >
        {selectedAuthor && (
          <>
            <ViewDetailsContainer>
              <div className="col-span-2 flex justify-center mb-4">
                <img
                  src={transformImageUrl(selectedAuthor.image) || FALLBACK_IMAGES.author}
                  alt={selectedAuthor.name}
                  className="object-cover w-32 h-32 border-4 border-beige-200 rounded-full shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGES.author;
                  }}
                />
              </div>

              <ViewDetailsGrid>
                <ViewDetailsRow label="Name" value={selectedAuthor.name} />
                <ViewDetailsRow
                  label="Status"
                  value={
                    selectedAuthor.active ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )
                  }
                />
              </ViewDetailsGrid>

              {selectedAuthor.bio && (
                <div className="col-span-2 mt-4">
                  <h4 className="text-sm font-semibold text-beige-700 mb-2">Biography</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{selectedAuthor.bio}</p>
                </div>
              )}
            </ViewDetailsContainer>

            <div className="flex justify-end pt-4 mt-4 border-t">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAuthor(null);
                }}
                className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Books Modal */}
      <Modal
        isOpen={showBooksModal}
        onClose={() => {
          setShowBooksModal(false);
          setSelectedAuthor(null);
          setAuthorBooks([]);
        }}
        title={`Books by ${selectedAuthor?.name || ""}`}
        maxWidth="4xl"
      >
        {authorBooks.length === 0 ? (
          <div className="py-8 text-center text-beige-500">
            This author has no books yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
            {authorBooks.map((book) => (
              <div
                key={book.id}
                className="border border-beige-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <img
                  src={transformImageUrl(book.image) || FALLBACK_IMAGES.book}
                  alt={book.title}
                  className="object-cover w-full h-48 border border-beige-200 rounded mb-3"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGES.book;
                  }}
                />
                <h3 className="font-semibold text-beige-700 mb-1 truncate" title={book.title}>
                  {book.title}
                </h3>
                <p className="text-sm text-beige-600">${book.price.toFixed(2)}</p>
                <p className="text-xs text-beige-500 mt-1">
                  Stock: {book.stockQuantity} | Status:{" "}
                  {book.active ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-600">Inactive</span>
                  )}
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
      </Modal>
    </>
  );

  return isStaffRoute ? content : <ManagementLayout>{content}</ManagementLayout>;
}
