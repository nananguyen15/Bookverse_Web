import { useState, useEffect } from "react";
import { categoriesApi } from "../../api";
import type { SupCategory, SubCategory, CategoryWithSubs } from "../../types";
import {
  FaPlus,
  FaChevronDown,
  FaChevronRight,
  FaFolder,
  FaFolderOpen,
  FaCheck,
  FaTimes,
  FaEdit,
  FaTrash,
  FaUndo,
} from "react-icons/fa";
import {
  TableHeader,
  SortableTableHeader,
  TableCell,
  TableCellText,
  ActionButton,
  ActionButtonGroup,
  StatusBadge,
  FilterBar,
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
          <h1 className="text-3xl font-bold text-beige-900">Quản Lý Danh Mục</h1>
          <p className="mt-1 text-sm text-beige-600">
            {supCategories.length} danh mục cha • {subCategories.length} danh mục con
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateSupModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
          >
            <FaFolder /> Thêm Danh Mục Cha
          </button>
          <button
            onClick={() => setShowCreateSubModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
          >
            <FaPlus /> Thêm Danh Mục Con
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
        <div className="bg-white rounded-lg shadow">
          {(filteredData as CategoryWithSubs[]).length === 0 ? (
            <p className="py-12 text-center text-gray-500">Không tìm thấy danh mục nào</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {(filteredData as CategoryWithSubs[]).map((sup) => (
                <div key={sup.id}>
                  {/* Sup Category Row */}
                  <div className="flex items-center gap-3 p-4 transition-colors hover:bg-beige-50">
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

                    {expandedSups.has(sup.id) ? (
                      <FaFolderOpen className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <FaFolder className="w-5 h-5 text-yellow-600" />
                    )}

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{sup.name}</h3>
                      <p className="text-sm text-gray-500">
                        {sup.subCategories?.length || 0} danh mục con
                      </p>
                    </div>

                    {sup.active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                        <FaCheck className="w-3 h-3" /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                        <FaTimes className="w-3 h-3" /> Đã ẩn
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openCreateSubModal(sup.id)}
                        className="p-2 text-green-600 transition-colors rounded hover:bg-green-50"
                        title="Thêm danh mục con"
                      >
                        <FaPlus />
                      </button>
                      <button
                        onClick={() => openEditSupModal(sup)}
                        className="p-2 text-yellow-600 transition-colors rounded hover:bg-yellow-50"
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleToggleSupStatus(sup)}
                        className={`p-2 rounded transition-colors ${sup.active
                          ? "text-red-600 hover:bg-red-50"
                          : "text-green-600 hover:bg-green-50"
                          }`}
                        title={sup.active ? "Ẩn" : "Kích hoạt"}
                      >
                        {sup.active ? <FaTrash /> : <FaUndo />}
                      </button>
                    </div>
                  </div>

                  {/* Sub Categories */}
                  {expandedSups.has(sup.id) && sup.subCategories && sup.subCategories.length > 0 && (
                    <div className="pl-16 pr-4 pb-2 bg-gray-50">
                      {sup.subCategories.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center gap-3 p-3 mb-2 transition-colors bg-white border border-gray-200 rounded-lg hover:shadow-sm"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{sub.name}</h4>
                            {sub.description && (
                              <p className="text-sm text-gray-500">{sub.description}</p>
                            )}
                          </div>

                          {sub.active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                              <FaCheck className="w-3 h-3" /> Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                              <FaTimes className="w-3 h-3" /> Đã ẩn
                            </span>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditSubModal(sub)}
                              className="p-2 text-yellow-600 transition-colors rounded hover:bg-yellow-50"
                              title="Chỉnh sửa"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleToggleSubStatus(sub)}
                              className={`p-2 rounded transition-colors ${sub.active
                                ? "text-red-600 hover:bg-red-50"
                                : "text-green-600 hover:bg-green-50"
                                }`}
                              title={sub.active ? "Ẩn" : "Kích hoạt"}
                            >
                              {sub.active ? <FaTrash /> : <FaUndo />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Flat View - Table */
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-beige-100">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-beige-700">
                  Tên danh mục
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-beige-700">
                  Danh mục cha
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center uppercase text-beige-700">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center uppercase text-beige-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(filteredData as SubCategory[]).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy danh mục nào
                  </td>
                </tr>
              ) : (
                (filteredData as SubCategory[]).map((sub) => (
                  <tr key={sub.id} className="transition-colors hover:bg-beige-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{sub.name}</div>
                      {sub.description && (
                        <div className="text-sm text-gray-500">{sub.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-500">{getSupName(sub.supCategoryId)}</div>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {sub.active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                          <FaCheck className="w-3 h-3" /> Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                          <FaTimes className="w-3 h-3" /> Đã ẩn
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditSubModal(sub)}
                          className="p-2 text-yellow-600 transition-colors rounded hover:bg-yellow-50"
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleToggleSubStatus(sub)}
                          className={`p-2 rounded transition-colors ${sub.active
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                            }`}
                          title={sub.active ? "Ẩn" : "Kích hoạt"}
                        >
                          {sub.active ? <FaTrash /> : <FaUndo />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Sup Modal */}
      {showCreateSupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-beige-900">
              Thêm Danh Mục Cha
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateSup();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={supFormData.name}
                  onChange={(e) =>
                    setSupFormData({ ...supFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="Văn học, Khoa học, Thiếu nhi..."
                  title="Tên danh mục cha"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Slug (tùy chọn)
                </label>
                <input
                  type="text"
                  value={supFormData.slug}
                  onChange={(e) =>
                    setSupFormData({ ...supFormData, slug: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="van-hoc, khoa-hoc..."
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
                    setShowCreateSupModal(false);
                    resetSupForm();
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Sup Modal */}
      {showEditSupModal && selectedSup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-beige-900">
              Chỉnh Sửa Danh Mục Cha
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateSup();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={supFormData.name}
                  onChange={(e) =>
                    setSupFormData({ ...supFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  title="Tên danh mục cha"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Slug (tùy chọn)
                </label>
                <input
                  type="text"
                  value={supFormData.slug}
                  onChange={(e) =>
                    setSupFormData({ ...supFormData, slug: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  placeholder="van-hoc, khoa-hoc..."
                  title="Slug"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
                >
                  Cập Nhật
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditSupModal(false);
                    resetSupForm();
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Sub Modal */}
      {showCreateSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-beige-900">
              Thêm Danh Mục Con
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateSub();
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
                  <option value={0}>-- Chọn danh mục cha --</option>
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
          </div>
        </div>
      )}

      {/* Edit Sub Modal */}
      {showEditSubModal && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-beige-900">
              Chỉnh Sửa Danh Mục Con
            </h2>
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
                  Cập Nhật
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
          </div>
        </div>
      )}
    </div>
  );
}
