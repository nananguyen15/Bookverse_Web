import { useState, useEffect } from "react";
import { categoriesApi } from "../../api";
import type { SupCategory, SubCategory, CategoryWithSubs } from "../../types";
import {
  FaPlus,
  FaChevronDown,
  FaChevronRight,
  FaFolder,
  FaFolderOpen,
  FaEdit,
  FaTrash,
  FaUndo,
} from "react-icons/fa";
import {
  TableHeader,
  SortableTableHeader,
  TableCell,
  TableCellText,
  StatusBadge,
  Modal,
  ModalActions,
} from "../Shared/Management";

type StatusFilter = "all" | "active" | "inactive";
type ViewMode = "hierarchical" | "flat";
type SortField = "id" | "name";

export function CateManagement() {
  const [supCategories, setSupCategories] = useState<SupCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [expandedSups, setExpandedSups] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("hierarchical");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modal states
  const [showCreateSupModal, setShowCreateSupModal] = useState(false);
  const [showEditSupModal, setShowEditSupModal] = useState(false);
  const [showCreateSubModal, setShowCreateSubModal] = useState(false);
  const [showEditSubModal, setShowEditSubModal] = useState(false);
  const [selectedSup, setSelectedSup] = useState<SupCategory | null>(null);
  const [selectedSub, setSelectedSub] = useState<SubCategory | null>(null);

  // Form state
  const [supFormData, setSupFormData] = useState({
    name: "",
    slug: "",
  });

  const [subFormData, setSubFormData] = useState({
    name: "",
    description: "",
    slug: "",
    supCategoryId: 0,
  });

  // Load data
  useEffect(() => {
    loadAllCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadAllCategories = async () => {
    try {
      setLoading(true);

      let supData: SupCategory[];
      let subData: SubCategory[];

      if (statusFilter === "active") {
        [supData, subData] = await Promise.all([
          categoriesApi.sup.getActive(),
          categoriesApi.sub.getActive(),
        ]);
      } else if (statusFilter === "inactive") {
        [supData, subData] = await Promise.all([
          categoriesApi.sup.getInactive(),
          categoriesApi.sub.getInactive(),
        ]);
      } else {
        [supData, subData] = await Promise.all([
          categoriesApi.sup.getAll(),
          categoriesApi.sub.getAll(),
        ]);
      }

      setSupCategories(supData);
      setSubCategories(subData);
    } catch (error) {
      console.error("Error loading categories:", error);
      alert("Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  // Build hierarchical structure
  const buildHierarchy = (): CategoryWithSubs[] => {
    return supCategories.map((sup) => ({
      ...sup,
      subCategories: subCategories.filter((sub) => sub.supCategoryId === sup.id),
    }));
  };

  // Filter and sort
  const getFilteredData = () => {
    if (viewMode === "hierarchical") {
      let hierarchy = buildHierarchy();

      // Search filter
      if (searchTerm) {
        hierarchy = hierarchy
          .map((sup) => ({
            ...sup,
            subCategories: sup.subCategories?.filter((sub) =>
              sub.name.toLowerCase().includes(searchTerm.toLowerCase())
            ),
          }))
          .filter(
            (sup) =>
              sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (sup.subCategories && sup.subCategories.length > 0)
          );
      }

      // Sort parent categories
      hierarchy.sort((a, b) => {
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

      // Sort subs within each sup
      hierarchy.forEach((sup) => {
        sup.subCategories?.sort((a, b) => {
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
      });

      return hierarchy;
    } else {
      // Flat view - all subcategories
      let filtered = [...subCategories];

      if (searchTerm) {
        filtered = filtered.filter((sub) =>
          sub.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      filtered.sort((a, b) => {
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

      return filtered;
    }
  };

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

  const toggleExpand = (supId: number) => {
    const newExpanded = new Set(expandedSups);
    if (newExpanded.has(supId)) {
      newExpanded.delete(supId);
    } else {
      newExpanded.add(supId);
    }
    setExpandedSups(newExpanded);
  };

  // SUP Category Handlers
  const handleCreateSup = async () => {
    try {
      // Add active field for new sup category
      const createData = {
        name: supFormData.name,
        active: true, // Always set active to true for new categories
      };

      console.log('Creating sup category with data:', createData);
      await categoriesApi.sup.create(createData);
      alert("Parent category created successfully!");
      setShowCreateSupModal(false);
      resetSupForm();
      loadAllCategories();
    } catch (error) {
      console.error("Error creating sup category:", error);
      alert("Unable to create parent category");
    }
  };

  const handleUpdateSup = async () => {
    if (!selectedSup) return;

    try {
      // Must include active field to prevent null constraint error
      const updateData = {
        name: supFormData.name,
        active: selectedSup.active, // Keep current active status
      };

      console.log('Updating sup category with data:', updateData);
      await categoriesApi.sup.update(selectedSup.id, updateData);
      alert("Updated successfully!");
      setShowEditSupModal(false);
      resetSupForm();
      loadAllCategories();
    } catch (error) {
      console.error("Error updating sup category:", error);
      alert("Unable to update parent category");
    }
  };

  const handleToggleSupStatus = async (sup: SupCategory) => {
    try {
      if (sup.active) {
        await categoriesApi.sup.deactivate(sup.id);
        alert("Parent category has been hidden!");
      } else {
        await categoriesApi.sup.activate(sup.id);
        alert("Parent category has been reactivated!");
      }
      loadAllCategories();
    } catch (error) {
      console.error("Error toggling sup status:", error);
      alert("Unable to change status");
    }
  };

  // SUB Category Handlers
  const handleCreateSub = async () => {
    try {
      // Add active field for new sub category
      const createData = {
        name: subFormData.name,
        description: subFormData.description,
        supCategoryId: subFormData.supCategoryId,
        active: true, // Always set active to true for new categories
      };

      console.log('Creating sub category with data:', createData);
      await categoriesApi.sub.create(createData);
      alert("Sub category created successfully!");
      setShowCreateSubModal(false);
      resetSubForm();
      loadAllCategories();
    } catch (error) {
      console.error("Error creating sub category:", error);
      alert("Unable to create sub category");
    }
  };

  const handleUpdateSub = async () => {
    if (!selectedSub) return;

    try {
      // Must include active field to prevent null constraint error
      const updateData = {
        name: subFormData.name,
        description: subFormData.description,
        supCategoryId: subFormData.supCategoryId,
        active: selectedSub.active, // Keep current active status
      };

      console.log('Updating sub category with data:', updateData);
      await categoriesApi.sub.update(selectedSub.id, updateData);
      alert("Updated successfully!");
      setShowEditSubModal(false);
      resetSubForm();
      loadAllCategories();
    } catch (error) {
      console.error("Error updating sub category:", error);
      alert("Unable to update sub category");
    }
  };

  const handleToggleSubStatus = async (sub: SubCategory) => {
    try {
      if (sub.active) {
        await categoriesApi.sub.deactivate(sub.id);
        alert("Sub category has been hidden!");
      } else {
        await categoriesApi.sub.activate(sub.id);
        alert("Sub category has been reactivated!");
      }
      loadAllCategories();
    } catch (error) {
      console.error("Error toggling sub status:", error);
      alert("Unable to change status");
    }
  };

  const resetSupForm = () => {
    setSupFormData({ name: "", slug: "" });
    setSelectedSup(null);
  };

  const resetSubForm = () => {
    setSubFormData({ name: "", description: "", slug: "", supCategoryId: 0 });
    setSelectedSub(null);
  };

  const openEditSupModal = (sup: SupCategory) => {
    setSelectedSup(sup);
    setSupFormData({
      name: sup.name,
      slug: sup.slug || "",
    });
    setShowEditSupModal(true);
  };

  const openEditSubModal = (sub: SubCategory) => {
    setSelectedSub(sub);
    setSubFormData({
      name: sub.name,
      description: sub.description || "",
      slug: sub.slug || "",
      supCategoryId: sub.supCategoryId,
    });
    setShowEditSubModal(true);
  };

  const openCreateSubModal = (supId: number) => {
    setSubFormData({
      name: "",
      description: "",
      slug: "",
      supCategoryId: supId,
    });
    setShowCreateSubModal(true);
  };

  const getSupName = (supId: number) => {
    return supCategories.find((s) => s.id === supId)?.name || "—";
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

  const filteredData = getFilteredData();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-beige-900">Category Management</h1>
          <p className="mt-1 text-sm text-beige-600">
            {supCategories.length} parent categories • {subCategories.length} subcategories
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateSupModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
          >
            <FaFolder /> Add Parent Category
          </button>
          <button
            onClick={() => setShowCreateSubModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
          >
            <FaPlus /> Add Subcategory
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 p-4 mb-6 bg-white rounded-lg shadow md:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by category name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
            title="Search categories"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
          aria-label="Filter by status"
          title="Filter by status"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Hidden</option>
        </select>

        {/* View Mode */}
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as ViewMode)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
          aria-label="View mode"
          title="View mode"
        >
          <option value="hierarchical">Hierarchical View</option>
          <option value="flat">Flat List View</option>
        </select>

        {/* Sort Field and Order */}
        <div className="flex gap-2">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
            aria-label="Sort by"
            title="Sort by"
          >
            <option value="id">Sort by ID</option>
            <option value="name">Sort by Name</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm transition-colors border rounded-lg border-beige-300 hover:bg-beige-50"
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "hierarchical" ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-beige-100">
              <tr>
                <th className="px-6 py-3"></th>
                <SortableTableHeader
                  sortable
                  sortKey="id"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                >
                  ID
                </SortableTableHeader>
                <SortableTableHeader
                  sortable
                  sortKey="name"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                >
                  Name
                </SortableTableHeader>
                <TableHeader>Subcategories</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(filteredData as CategoryWithSubs[]).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No categories found
                  </td>
                </tr>
              ) : (
                (filteredData as CategoryWithSubs[]).map((sup) => (
                  <>
                    {/* Parent Category Row */}
                    <tr key={sup.id} className="transition-colors hover:bg-beige-50">
                      <TableCell>
                        <button
                          onClick={() => toggleExpand(sup.id)}
                          className="p-1 text-gray-600 transition-colors rounded hover:bg-gray-200"
                        >
                          {expandedSups.has(sup.id) ? (
                            <FaChevronDown className="w-4 h-4" />
                          ) : (
                            <FaChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        <TableCellText className="font-medium">#{sup.id}</TableCellText>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {expandedSups.has(sup.id) ? (
                            <FaFolderOpen className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <FaFolder className="w-5 h-5 text-yellow-600" />
                          )}
                          <TableCellText className="font-semibold">{sup.name}</TableCellText>
                        </div>
                      </TableCell>
                      <TableCell>
                        <TableCellText className="text-sm text-gray-500">
                          {sup.subCategories?.length || 0} subcategories
                        </TableCellText>
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge active={sup.active} />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openCreateSubModal(sup.id)}
                            className="p-2 text-green-600 transition-colors rounded hover:bg-green-50"
                            title="Add Subcategory"
                          >
                            <FaPlus />
                          </button>
                          <button
                            onClick={() => openEditSupModal(sup)}
                            className="p-2 text-yellow-600 transition-colors rounded hover:bg-yellow-50"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleToggleSupStatus(sup)}
                            className={`p-2 rounded transition-colors ${sup.active
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                              }`}
                            title={sup.active ? "Hide" : "Activate"}
                          >
                            {sup.active ? <FaTrash /> : <FaUndo />}
                          </button>
                        </div>
                      </TableCell>
                    </tr>

                    {/* Subcategories */}
                    {expandedSups.has(sup.id) && sup.subCategories && sup.subCategories.length > 0 &&
                      sup.subCategories.map((sub) => (
                        <tr key={`sub-${sub.id}`} className="transition-colors bg-gray-50 hover:bg-gray-100">
                          <TableCell><div className="w-12"></div></TableCell>
                          <TableCell>
                            <TableCellText className="pl-8 text-sm font-medium">#{sub.id}</TableCellText>
                          </TableCell>
                          <TableCell>
                            <TableCellText className="pl-8">{sub.name}</TableCellText>
                            {sub.description && (
                              <TableCellText className="pl-8 text-sm text-gray-500">{sub.description}</TableCellText>
                            )}
                          </TableCell>
                          <TableCell>
                            <TableCellText className="text-sm text-gray-500">—</TableCellText>
                          </TableCell>
                          <TableCell className="text-center">
                            <StatusBadge active={sub.active} />
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditSubModal(sub)}
                                className="p-2 text-yellow-600 transition-colors rounded hover:bg-yellow-50"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleToggleSubStatus(sub)}
                                className={`p-2 rounded transition-colors ${sub.active
                                  ? "text-red-600 hover:bg-red-50"
                                  : "text-green-600 hover:bg-green-50"
                                  }`}
                                title={sub.active ? "Hide" : "Activate"}
                              >
                                {sub.active ? <FaTrash /> : <FaUndo />}
                              </button>
                            </div>
                          </TableCell>
                        </tr>
                      ))
                    }
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Flat View - Table */
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
                <SortableTableHeader
                  sortable
                  sortKey="name"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                >
                  Category Name
                </SortableTableHeader>
                <TableHeader>Parent Category</TableHeader>
                <TableHeader>Description</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(filteredData as SubCategory[]).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No categories found
                  </td>
                </tr>
              ) : (
                (filteredData as SubCategory[]).map((sub) => (
                  <tr key={sub.id} className="transition-colors hover:bg-beige-50">
                    <TableCell>
                      <TableCellText className="font-medium">#{sub.id}</TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText className="font-medium">{sub.name}</TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText>{getSupName(sub.supCategoryId)}</TableCellText>
                    </TableCell>
                    <TableCell>
                      <TableCellText className="text-sm text-gray-500">
                        {sub.description || "—"}
                      </TableCellText>
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge active={sub.active} />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditSubModal(sub)}
                          className="p-2 text-yellow-600 transition-colors rounded hover:bg-yellow-50"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleToggleSubStatus(sub)}
                          className={`p-2 rounded transition-colors ${sub.active
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                            }`}
                          title={sub.active ? "Hide" : "Activate"}
                        >
                          {sub.active ? <FaTrash /> : <FaUndo />}
                        </button>
                      </div>
                    </TableCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Sup Modal */}
      <Modal
        isOpen={showCreateSupModal}
        onClose={() => setShowCreateSupModal(false)}
        title="Add Parent Category"
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateSup();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={supFormData.name}
              onChange={(e) =>
                setSupFormData({ ...supFormData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
              placeholder="Literature, Science, Children..."
              title="Parent category name"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Slug (optional)
            </label>
            <input
              type="text"
              value={supFormData.slug}
              onChange={(e) =>
                setSupFormData({ ...supFormData, slug: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
              placeholder="literature, science..."
              title="URL-friendly slug"
            />
          </div>

          <ModalActions
            confirmText="Create"
            cancelText="Cancel"
            confirmType="submit"
            onCancel={() => setShowCreateSupModal(false)}
          />
        </form>
      </Modal>

      {/* Edit Sup Modal */}
      <Modal
        isOpen={showEditSupModal}
        onClose={() => setShowEditSupModal(false)}
        title="Edit Parent Category"
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateSup();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={supFormData.name}
              onChange={(e) =>
                setSupFormData({ ...supFormData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
              title="Parent category name"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Slug (optional)
            </label>
            <input
              type="text"
              value={supFormData.slug}
              onChange={(e) =>
                setSupFormData({ ...supFormData, slug: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
              placeholder="literature, science..."
              title="Slug"
            />
          </div>

          <ModalActions
            confirmText="Update"
            cancelText="Cancel"
            confirmType="submit"
            onCancel={() => {
              setShowEditSupModal(false);
              resetSupForm();
            }}
          />
        </form>
      </Modal>

      {/* Create Sub Modal */}
      <Modal
        isOpen={showCreateSubModal}
        onClose={() => setShowCreateSubModal(false)}
        title="Add Subcategory"
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateSub();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Parent Category <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={subFormData.supCategoryId}
              onChange={(e) =>
                setSubFormData({
                  ...subFormData,
                  supCategoryId: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
              aria-label="Select parent category"
              title="Select parent category"
            >
              <option value={0}>-- Select Parent Category --</option>
              {supCategories
                .filter((s) => s.active)
                .map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subFormData.name}
              onChange={(e) =>
                setSubFormData({ ...subFormData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
              placeholder="Tiểu thuyết, Truyện ngắn..."
              title="Tên danh mục con"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Mô tả (tùy chọn)
            </label>
            <textarea
              rows={3}
              value={subFormData.description}
              onChange={(e) =>
                setSubFormData({
                  ...subFormData,
                  description: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
              placeholder="Mô tả về danh mục..."
              title="Mô tả"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Slug (tùy chọn)
            </label>
            <input
              type="text"
              value={subFormData.slug}
              onChange={(e) =>
                setSubFormData({ ...subFormData, slug: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
              placeholder="tieu-thuyet, truyen-ngan..."
              title="Slug"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
            >
              Tạo
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateSubModal(false);
                resetSubForm();
              }}
              className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Sub Modal */}
      <Modal
        isOpen={showEditSubModal && selectedSub !== null}
        onClose={() => setShowEditSubModal(false)}
        title="Chỉnh Sửa Danh Mục Con"
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateSub();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Danh mục cha <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={subFormData.supCategoryId}
              onChange={(e) =>
                setSubFormData({
                  ...subFormData,
                  supCategoryId: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
              aria-label="Chọn danh mục cha"
              title="Chọn danh mục cha"
            >
              {supCategories
                .filter((s) => s.active)
                .map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subFormData.name}
              onChange={(e) =>
                setSubFormData({ ...subFormData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
              title="Tên danh mục con"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Mô tả (tùy chọn)
            </label>
            <textarea
              rows={3}
              value={subFormData.description}
              onChange={(e) =>
                setSubFormData({
                  ...subFormData,
                  description: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
              placeholder="Mô tả về danh mục..."
              title="Mô tả"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Slug (tùy chọn)
            </label>
            <input
              type="text"
              value={subFormData.slug}
              onChange={(e) =>
                setSubFormData({ ...subFormData, slug: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
              placeholder="tieu-thuyet, truyen-ngan..."
              title="Slug"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEditSubModal(false);
                resetSubForm();
              }}
              className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
