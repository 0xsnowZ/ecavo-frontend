import { useLocaleStore } from "../../../store/useLocaleStore";
import useThemeStore from "../../../store/useThemeStore";
import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, X, Loader2, RefreshCw, Tag, Wand2, Ticket, Calendar } from "lucide-react";
import { toast } from "sonner";
import { adminCouponsService } from "../../../services";
import Spinner from "../../../components/ui/Spinner";
import SkeletonLoader from "../../../components/ui/SkeletonLoader";

const EMPTY_FORM = {
  code: "",
  discount_type: "percent",
  value: 0,
  max_uses: "",
  min_order_amount: "",
  expires_at: "",
  is_active: true,
};

export default function CouponsPage() {
  const { t, i18n } = useTranslation();
  const { language } = useLocaleStore();
  const { dark } = useThemeStore();
  const isAr = language === "ar";
  const isFr = language === "fr";

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editCoupon, setEditCoupon] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleting, setDeleting] = useState(null);

  const fetchCoupons = useCallback(() => {
    setLoading(true);
    adminCouponsService
      .getAll()
      .then((r) => setCoupons(r.data || []))
      .catch(() => toast.error(isAr ? "فشل جلب الكوبونات" : "Failed to fetch coupons"))
      .finally(() => setLoading(false));
  }, [isAr]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditCoupon(null);
    setModal("create");
  };

  const openEdit = (coupon) => {
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      value: coupon.value,
      max_uses: coupon.max_uses || "",
      min_order_amount: coupon.min_order_amount || "",
      expires_at: coupon.expires_at ? coupon.expires_at.split("T")[0] : "",
      is_active: coupon.is_active,
    });
    setErrors({});
    setEditCoupon(coupon);
    setModal("edit");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.max_uses) payload.max_uses = null;
      if (!payload.min_order_amount) payload.min_order_amount = null;
      if (!payload.expires_at) payload.expires_at = null;

      if (modal === "create") {
        await adminCouponsService.create(payload);
        toast.success(
          isAr ? "تم إنشاء الكوبون بنجاح ✓" : "Coupon created successfully",
          { description: form.code }
        );
      } else {
        await adminCouponsService.update(editCoupon.id, payload);
        toast.success(
          isAr ? "تم تحديث الكوبون بنجاح ✓" : "Coupon updated successfully",
          { description: form.code }
        );
      }
      setModal(null);
      fetchCoupons();
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
      toast.error(isAr ? "فشل حفظ الكوبون" : "Failed to save coupon", {
        description: err.response?.data?.message || (isAr ? "تحقق من البيانات" : "Check your data"),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminCouponsService.delete(id);
      toast.success(
        isAr ? "تم حذف الكوبون بنجاح ✓" : "Coupon deleted successfully"
      );
      fetchCoupons();
    } catch (err) {
      toast.error(isAr ? "فشل الحذف" : "Failed to delete coupon");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (coupon) => {
    try {
      await adminCouponsService.toggleActive(coupon.id);
      fetchCoupons();
      toast.success(
        isAr ? "تم تحديث حالة الكوبون" : "Coupon status updated"
      );
    } catch (err) {
      toast.error(isAr ? "فشل التحديث" : "Failed to update status");
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setField("code", code);
  };

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: null }));
  };

  return (
    <div className="space-y-5">
      {loading ? (
        <>
          <div className="flex items-center justify-between">
            <SkeletonLoader height={28} width={150} />
            <div className="flex gap-2">
              <SkeletonLoader height={36} width={36} />
              <SkeletonLoader height={36} width={120} />
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-6 space-y-4">
              <SkeletonLoader height={20} count={5} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-secondary dark:text-white">
              {isAr ? "إدارة الكوبونات" : isFr ? "Gestion des Coupons" : "Coupons Management"}
            </h1>
            <div className="flex gap-2">
              <button onClick={fetchCoupons} className="btn-ghost text-sm">
                <RefreshCw size={16} />
              </button>
              <button onClick={openCreate} className="btn-primary text-sm">
                <Plus size={16} />{" "}
                {isAr ? "إضافة كوبون" : isFr ? "Ajouter un Coupon" : "Add Coupon"}
              </button>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm admin-table">
                <thead className="bg-surface dark:bg-gray-900/50">
                  <tr>
                    {[
                      isAr ? "الكود" : "Code",
                      isAr ? "النوع" : "Type",
                      isAr ? "القيمة" : "Value",
                      isAr ? "الاستخدامات" : "Usage",
                      isAr ? "ينتهي في" : "Expires At",
                      isAr ? "الحالة" : "Status",
                      isAr ? "إجراء" : "Actions",
                    ].map((h) => (
                      <th key={h} className="text-start px-4 py-3 text-xs font-semibold text-muted dark:text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-gray-700">
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted dark:text-gray-400">
                        {isAr ? "لا توجد كوبونات" : "No coupons found"}
                      </td>
                    </tr>
                  ) : (
                    coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-surface/60 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                              <Tag size={14} className="text-green-600 dark:text-green-400" />
                            </div>
                            <span className="font-bold text-dark dark:text-gray-100 uppercase tracking-wide">
                              {coupon.code}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted dark:text-gray-400">
                          {coupon.discount_type === "percent" ? (isAr ? "نسبة" : "Percent") : (isAr ? "ثابت" : "Fixed")}
                        </td>
                        <td className="px-4 py-3 font-semibold text-primary">
                          {coupon.discount_type === "percent" ? `${coupon.value}%` : `$${coupon.value}`}
                        </td>
                        <td className="px-4 py-3 text-muted dark:text-gray-400 text-xs">
                          {coupon.used_count} / {coupon.max_uses ? coupon.max_uses : "∞"}
                        </td>
                        <td className="px-4 py-3 text-muted dark:text-gray-400 text-xs">
                          {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggle(coupon)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                              coupon.is_active
                                ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-300 dark:hover:bg-green-500/30"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            }`}
                          >
                            {coupon.is_active ? (isAr ? "نشط" : "Active") : (isAr ? "غير نشط" : "Inactive")}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(coupon)}
                              className="p-1.5 rounded-lg hover:bg-primary/10 text-muted hover:text-primary transition-colors"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => setDeleting(coupon.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-colors"
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
          </div>

          {/* Modal */}
          {modal && createPortal(
            <div className={dark ? "dark" : ""}>
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-slide-down">
                <div className="border-b border-border dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                  <h3 className="font-bold text-secondary dark:text-white">
                    {modal === "create"
                      ? (isAr ? "إضافة كوبون" : "Add Coupon")
                      : (isAr ? "تعديل الكوبون" : "Edit Coupon")}
                  </h3>
                  <button onClick={() => setModal(null)} className="text-muted dark:text-gray-400 hover:text-dark">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      {isAr ? "كود الخصم" : "Coupon Code"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={form.code}
                        onChange={(e) => setField("code", e.target.value.toUpperCase())}
                        className={`input-field flex-1 uppercase ${errors.code ? "border-red-400" : ""}`}
                        placeholder="E.g. SUMMER24"
                      />
                      <button
                        type="button"
                        onClick={generateCode}
                        className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-dark dark:text-gray-200 px-3 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                      >
                        <Wand2 size={14} /> {isAr ? "توليد" : "Gen"}
                      </button>
                    </div>
                    {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code[0]}</p>}
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-muted mb-1">
                        {isAr ? "النوع" : "Discount Type"}
                      </label>
                      <select
                        value={form.discount_type}
                        onChange={(e) => setField("discount_type", e.target.value)}
                        className="input-field"
                      >
                        <option value="percent">{isAr ? "نسبة مئوية (%)" : "Percentage (%)"}</option>
                        <option value="fixed">{isAr ? "مبلغ ثابت" : "Fixed Amount"}</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-muted mb-1">
                        {isAr ? "القيمة" : "Value"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.value}
                        onChange={(e) => setField("value", parseFloat(e.target.value))}
                        className={`input-field ${errors.value ? "border-red-400" : ""}`}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-muted mb-1">
                        {isAr ? "الحد الأقصى للاستخدام (اختياري)" : "Max Uses (optional)"}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={form.max_uses}
                        onChange={(e) => setField("max_uses", e.target.value)}
                        className="input-field"
                        placeholder="∞"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-muted mb-1">
                        {isAr ? "الحد الأدنى للطلب (اختياري)" : "Min Order Amount (opt)"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.min_order_amount}
                        onChange={(e) => setField("min_order_amount", e.target.value)}
                        className="input-field"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      {isAr ? "تاريخ الانتهاء (اختياري)" : "Expires At (optional)"}
                    </label>
                    <input
                      type="date"
                      value={form.expires_at}
                      onChange={(e) => setField("expires_at", e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => setField("is_active", e.target.checked)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm text-dark dark:text-gray-100">
                        {isAr ? "نشط ومتاح للاستخدام" : "Active and available to use"}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="border-t border-border dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex-1 justify-center"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : (isAr ? "حفظ" : "Save")}
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
            </div>,
            document.body
          )}

          {/* Delete confirm */}
          {deleting && createPortal(
            <div className={dark ? "dark" : ""}>
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 animate-fade-in">
                <p className="text-2xl">🗑️</p>
                <p className="font-bold text-secondary dark:text-white">
                  {isAr ? "حذف الكوبون؟" : "Delete Coupon?"}
                </p>
                <p className="text-sm text-muted dark:text-gray-400">
                  {isAr ? "هل أنت متأكد من حذف هذا الكوبون؟" : "Are you sure you want to delete this coupon?"}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDelete(deleting)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg text-sm"
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
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}
