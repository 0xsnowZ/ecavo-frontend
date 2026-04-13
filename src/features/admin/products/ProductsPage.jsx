import { useLocaleStore } from "../../../store/useLocaleStore";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  Image,
} from "lucide-react";
import { toast } from "sonner";
import { adminService, categoriesService } from "../../../services";
import Spinner from "../../../components/ui/Spinner";
import ImageUploader from "../../../components/admin/ImageUploader";
import { resolveImageUrl } from "../../../utils/imageUrl";
import { getLocalized } from "../../../utils/localize";

const EMPTY_FORM = {
  name_ar: "",
  name_en: "",
  name_fr: "",
  description_ar: "",
  description_en: "",
  description_fr: "",
  price: "",
  original_price: "",
  discount_percent: "",
  stock: "",
  category_id: "",
  is_active: true,
  is_featured: false,
  deal_ends_at: "",
  images: [],
};

export default function ProductsPage() {
  const { t, i18n } = useTranslation();
  const { language } = useLocaleStore();
  const isAr = language === "ar";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modal
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [editProduct, setEdit] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Delete confirmation
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    adminService.products
      .list({ search, page, per_page: 20 })
      .then((r) => {
        setProducts(r.data.data || []);
        setMeta(r.data.meta || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  useEffect(() => {
    categoriesService.all().then((r) => setCategories(r.data.data || []));
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEdit(null);
    setModal("create");
  };

  const openEdit = (product) => {
    setForm({
      name_ar: product.name_ar || "",
      name_en: product.name_en || "",
      name_fr: product.name_fr || "",
      description_ar: product.description_ar || "",
      description_en: product.description_en || "",
      description_fr: product.description_fr || "",
      price: product.price,
      original_price: product.original_price || "",
      discount_percent: product.discount_percent || "",
      stock: product.stock,
      category_id: product.category_id || product.category?.id || "",
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      deal_ends_at: product.deal_ends_at
        ? product.deal_ends_at.split("T")[0]
        : "",
      images: product.images || [],
    });
    setErrors({});
    setEdit(product);
    setModal("edit");
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors({});
    try {
      if (modal === "create") {
        await adminService.products.create(form);
        toast.success(
          isAr ? "تم إنشاء المنتج بنجاح ✓" : "Product created successfully",
          { description: form.name_en || form.name_ar },
        );
      } else {
        await adminService.products.update(editProduct.id, form);
        toast.success(
          isAr ? "تم تحديث المنتج بنجاح ✓" : "Product updated successfully",
          { description: form.name_en || form.name_ar },
        );
      }
      setModal(null);
      fetchProducts();
    } catch (err) {
      const serverErrors = err.response?.data?.errors || {};
      setErrors(serverErrors);
      toast.error(isAr ? "فشل في حفظ المنتج" : "Failed to save product", {
        description: isAr
          ? "يرجى التحقق من البيانات والمحاولة مرة أخرى"
          : "Please check your data and try again",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.products.delete(id);
      toast.success(
        isAr ? "تم حذف المنتج بنجاح ✓" : "Product deleted successfully",
        { description: `Product #${id}` },
      );
      fetchProducts();
    } catch {
      toast.error(isAr ? "فشل في حذف المنتج" : "Failed to delete product", {
        description: isAr
          ? "لا يمكن حذف هذا المنتج"
          : "Cannot delete this product",
      });
    } finally {
      setDeleting(null);
    }
  };

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: null }));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-secondary dark:text-white">
          {isAr ? "إدارة المنتجات" : "Products Management"}
        </h1>
        <button onClick={openCreate} className="btn-primary text-sm">
          <Plus size={16} /> {isAr ? "إضافة منتج" : "Add Product"}
        </button>
      </div>

      {/* Search bar */}
      <div className="card p-4 flex gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder={isAr ? "ابحث عن منتج..." : "Search products..."}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input-field ps-9"
          />
        </div>
        <button onClick={fetchProducts} className="btn-ghost px-3">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm admin-table">
            <thead className="bg-surface dark:bg-gray-900/50">
              <tr>
                {[
                  isAr ? "المنتج" : "Product",
                  isAr ? "السعر" : "Price",
                  isAr ? "المخزون" : "Stock",
                  isAr ? "القسم" : "Category",
                  isAr ? "الحالة" : "Status",
                  isAr ? "إجراء" : "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-start px-4 py-3 text-xs font-semibold text-muted dark:text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-muted dark:text-gray-400"
                  >
                    {isAr ? "لا توجد منتجات" : "No products"}
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-surface/60 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && (
                          <img
                            src={resolveImageUrl(p.images[0])}
                            alt=""
                            className="w-10 h-10 rounded-lg object-contain bg-gray-50 dark:bg-gray-700 p-0.5"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-dark dark:text-gray-100 line-clamp-1">
                            {getLocalized(p, "name", language)}
                          </p>
                          <p className="text-xs text-muted dark:text-gray-400">
                            {p.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-primary">
                        ${parseFloat(p.price).toFixed(2)}
                      </p>
                      {p.discount_percent && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          -{p.discount_percent}%
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold ${p.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted dark:text-gray-400 text-xs">
                      {getLocalized(p.category, "name", language) || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.is_active ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 dark:ring-1 dark:ring-green-500/30" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:ring-1 dark:ring-gray-500/30"}`}
                      >
                        {p.is_active
                          ? isAr
                            ? "نشط"
                            : "Active"
                          : isAr
                            ? "غير نشط"
                            : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted dark:text-gray-400 hover:text-primary transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleting(p.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted dark:text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="px-4 py-3 border-t border-border dark:border-gray-700 flex justify-between items-center text-xs text-muted dark:text-gray-400">
            <span>
              {meta.total} {isAr ? "منتج" : "products"}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg font-semibold ${p === page ? "bg-primary text-white" : "text-muted dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                  >
                    {p}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-down">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-border dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-secondary dark:text-white">
                {modal === "create"
                  ? isAr
                    ? "إضافة منتج"
                    : "Add Product"
                  : isAr
                    ? "تعديل منتج"
                    : "Edit Product"}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="text-muted dark:text-gray-400 hover:text-dark dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    key: "name_ar",
                    label: isAr ? "الاسم بالعربية" : "Arabic Name",
                  },
                  {
                    key: "name_en",
                    label: isAr ? "الاسم بالإنجليزية" : "English Name",
                  },
                  {
                    key: "name_fr",
                    label: isAr ? "الاسم بالفرنسية" : "French Name",
                  },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={form[key]}
                      onChange={(e) => setField(key, e.target.value)}
                      className={`input-field ${errors[key] ? "border-red-400" : ""}`}
                    />
                    {errors[key] && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[key][0]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Description fields */}
              <div className="space-y-3">
                {[
                  {
                    key: "description_ar",
                    label: isAr ? "الوصف بالعربية" : "Arabic Description",
                  },
                  {
                    key: "description_en",
                    label: isAr ? "الوصف بالإنجليزية" : "English Description",
                  },
                  {
                    key: "description_fr",
                    label: isAr ? "الوصف بالفرنسية" : "French Description",
                  },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      {label}
                    </label>
                    <textarea
                      value={form[key]}
                      onChange={(e) => setField(key, e.target.value)}
                      className="input-field min-h-[80px]"
                    />
                  </div>
                ))}
              </div>

              {/* Price, Stock, Category */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    key: "price",
                    label: isAr ? "السعر $" : "Price $",
                    type: "number",
                  },
                  {
                    key: "original_price",
                    label: isAr ? "السعر الأصلي" : "Original $",
                    type: "number",
                  },
                  {
                    key: "stock",
                    label: isAr ? "المخزون" : "Stock",
                    type: "number",
                  },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={form[key]}
                      onChange={(e) => setField(key, e.target.value)}
                      className="input-field"
                    />
                  </div>
                ))}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  {isAr ? "القسم" : "Category"}
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => setField("category_id", e.target.value)}
                  className="input-field"
                >
                  <option value="">
                    {isAr ? "اختر قسم" : "Select category"}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getLocalized(c, "name", language)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6">
                {[
                  { key: "is_active", labelAr: "نشط", labelEn: "Active" },
                  { key: "is_featured", labelAr: "مميز", labelEn: "Featured" },
                ].map(({ key, labelAr, labelEn }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => setField(key, e.target.checked)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm text-dark">
                      {isAr ? labelAr : labelEn}
                    </span>
                  </label>
                ))}
              </div>

              {/* Deal ends at */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  {isAr ? "انتهاء العرض" : "Deal Ends At"} (
                  {isAr ? "اختياري" : "optional"})
                </label>
                <input
                  type="date"
                  value={form.deal_ends_at}
                  onChange={(e) => setField("deal_ends_at", e.target.value)}
                  className="input-field"
                />
              </div>

              {/* ── Image Upload ── */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Image size={13} />
                  {isAr ? "صور المنتج" : "Product Images"}
                  <span className="ms-auto font-normal normal-case">
                    {isAr
                      ? "الصورة الأولى هي الصورة الرئيسية"
                      : "First image is the primary/cover image"}
                  </span>
                </label>
                <ImageUploader
                  images={form.images}
                  onChange={(urls) => setField("images", urls)}
                  max={8}
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-border px-6 py-4 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1 justify-center"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isAr ? (
                  "حفظ"
                ) : (
                  "Save"
                )}
              </button>
              <button
                onClick={() => setModal(null)}
                className="btn-ghost flex-1 justify-center"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 animate-fade-in">
            <p className="text-2xl">🗑️</p>
            <p className="font-bold text-secondary">
              {isAr ? "هل أنت متأكد من الحذف؟" : "Confirm Delete?"}
            </p>
            <p className="text-sm text-muted">
              {isAr
                ? "لا يمكن التراجع عن هذا الإجراء."
                : "This action cannot be undone."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleting)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                {isAr ? "حذف" : "Delete"}
              </button>
              <button
                onClick={() => setDeleting(null)}
                className="flex-1 btn-ghost justify-center"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
