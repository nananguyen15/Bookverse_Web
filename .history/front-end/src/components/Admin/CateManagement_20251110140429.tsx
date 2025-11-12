import { useState, useEffect } from "react";
import { categoriesApi } from "../../api";
import type { SupCategory, SubCategory, CategoryWithSubs } from "../../types";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaUndo,
  FaCheck,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaFolder,
  FaFolderOpen,
} from "react-icons/fa";

type StatusFilter = "all" | "active" | "inactive";
type ViewMode = "hierarchical" | "flat";

export function CateManagement() {
  const [supCategories, setSupCategories] = useState<SupCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [expandedSups, setExpandedSups] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("hierarchical");
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

      // Sort
      hierarchy.sort((a, b) => {
        const compare = a.name.localeCompare(b.name);
        return sortOrder === "asc" ? compare : -compare;
      });

      // Sort subs within each sup
      hierarchy.forEach((sup) => {
        sup.subCategories?.sort((a, b) => {
          const compare = a.name.localeCompare(b.name);
          return sortOrder === "asc" ? compare : -compare;
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
        const compare = a.name.localeCompare(b.name);
        return sortOrder === "asc" ? compare : -compare;
      });

      return filtered;
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
      await categoriesApi.sup.create(supFormData);
      alert("Tạo danh mục cha thành công!");
      setShowCreateSupModal(false);
      resetSupForm();
      loadAllCategories();
    } catch (error) {
      console.error("Error creating sup category:", error);
      alert("Không thể tạo danh mục cha");
    }
  };

  const handleUpdateSup = async () => {
    if (!selectedSup) return;

    try {
      await categoriesApi.sup.update(selectedSup.id, supFormData);
      alert("Cập nhật thành công!");
      setShowEditSupModal(false);
      resetSupForm();
      loadAllCategories();
    } catch (error) {
      console.error("Error updating sup category:", error);
      alert("Không thể cập nhật danh mục cha");
    }
  };

  const handleToggleSupStatus = async (sup: SupCategory) => {
    try {
      if (sup.active) {
        await categoriesApi.sup.deactivate(sup.id);
        alert("Đã ẩn danh mục cha!");
      } else {
        await categoriesApi.sup.activate(sup.id);
        alert("Đã kích hoạt lại danh mục cha!");
      }
      loadAllCategories();
    } catch (error) {
      console.error("Error toggling sup status:", error);
      alert("Không thể thay đổi trạng thái");
    }
  };

  // SUB Category Handlers
  const handleCreateSub = async () => {
    try {
      await categoriesApi.sub.create(subFormData);
      alert("Tạo danh mục con thành công!");
      setShowCreateSubModal(false);
      resetSubForm();
      loadAllCategories();
    } catch (error) {
      console.error("Error creating sub category:", error);
      alert("Không thể tạo danh mục con");
    }
  };

  const handleUpdateSub = async () => {
    if (!selectedSub) return;

    try {
      await categoriesApi.sub.update(selectedSub.id, subFormData);
      alert("Cập nhật thành công!");
      setShowEditSubModal(false);
      resetSubForm();
      loadAllCategories();
    } catch (error) {
      console.error("Error updating sub category:", error);
      alert("Không thể cập nhật danh mục con");
    }
  };

  const handleToggleSubStatus = async (sub: SubCategory) => {
    try {
      if (sub.active) {
        await categoriesApi.sub.deactivate(sub.id);
        alert("Đã ẩn danh mục con!");
      } else {
        await categoriesApi.sub.activate(sub.id);
        alert("Đã kích hoạt lại danh mục con!");
      }
      loadAllCategories();
    } catch (error) {
      console.error("Error toggling sub status:", error);
      alert("Không thể thay đổi trạng thái");
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
          <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
            title="Tìm kiếm danh mục"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
          aria-label="Lọc theo trạng thái"
          title="Lọc theo trạng thái"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã ẩn</option>
        </select>

        {/* View Mode */}
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as ViewMode)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent"
          aria-label="Chế độ xem"
          title="Chế độ xem"
        >
          <option value="hierarchical">Xem phân cấp</option>
          <option value="flat">Xem danh sách</option>
        </select>

        {/* Sort */}
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm transition-colors border rounded-lg border-beige-300 hover:bg-beige-50"
        >
          {sortOrder === "asc" ? "A → Z" : "Z → A"}
        </button>
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
                        className={`p-2 rounded transition-colors ${
                          sup.active
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
                              className={`p-2 rounded transition-colors ${
                                sub.active
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
                          className={`p-2 rounded transition-colors ${
                            sub.active
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
