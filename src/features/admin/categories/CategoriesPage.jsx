import { useLocaleStore } from '../../../store/useLocaleStore';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, X, Loader2, RefreshCw, Tag } from 'lucide-react';
import { adminService } from '../../../services';
import Spinner from '../../../components/ui/Spinner';
import { getLocalized } from '../../../utils/localize';

const EMPTY_FORM = { name_ar: '', name_en: '', name_fr: '', parent_id: '', sort_order: 0, is_active: true };

export default function CategoriesPage() {
  const { t, i18n } = useTranslation();
  const { language } = useLocaleStore(); const isAr = language === 'ar';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleting, setDeleting] = useState(null);

  const fetchCategories = useCallback(() => {
    setLoading(true);
    adminService.categories.list()
      .then(r => setCategories(r.data.data || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditCat(null);
    setModal('create');
  };

  const openEdit = (cat) => {
    setForm({
      name_ar: cat.name_ar || '', name_en: cat.name_en || '', name_fr: cat.name_fr || '',
      parent_id: cat.parent_id || '', sort_order: cat.sort_order || 0,
      is_active: cat.is_active ?? true,
    });
    setErrors({});
    setEditCat(cat);
    setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'create') {
        await adminService.categories.create(form);
      } else {
        await adminService.categories.update(editCat.id, form);
      }
      setModal(null);
      fetchCategories();
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.categories.delete(id);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: null }));
  };

  // Flatten tree for display
  const flatCategories = [];
  categories.forEach(cat => {
    flatCategories.push({ ...cat, indent: 0 });
    (cat.children || []).forEach(child => {
      flatCategories.push({ ...child, indent: 1 });
    });
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-secondary">{isAr ? 'إدارة الأقسام' : 'Categories Management'}</h1>
        <div className="flex gap-2">
          <button onClick={fetchCategories} className="btn-ghost text-sm"><RefreshCw size={16} /></button>
          <button onClick={openCreate} className="btn-primary text-sm">
            <Plus size={16} /> {isAr ? 'إضافة قسم' : 'Add Category'}
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                {[isAr ? 'القسم' : 'Category', isAr ? 'الرابط' : 'Slug', isAr ? 'الترتيب' : 'Order',
                isAr ? 'الحالة' : 'Status', isAr ? 'المنتجات' : 'Products', isAr ? 'إجراء' : 'Actions'].map(h => (
                  <th key={h} className="text-start px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center"><Spinner /></td></tr>
              ) : flatCategories.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-muted">
                  {isAr ? 'لا توجد أقسام' : 'No categories'}
                </td></tr>
              ) : flatCategories.map(cat => (
                <tr key={cat.id} className="hover:bg-surface/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2" style={{ paddingInlineStart: `${cat.indent * 20}px` }}>
                      {cat.indent > 0 && <span className="text-gray-300 text-xs">└</span>}
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Tag size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-dark">{getLocalized(cat, 'name', language)}</p>
                        <p className="text-xs text-muted">
                          {language === 'ar' ? cat.name_en : cat.name_ar}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs font-mono">{cat.slug}</td>
                  <td className="px-4 py-3 text-muted">{cat.sort_order}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.is_active ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {cat.children?.length > 0
                      ? `${cat.children.length} ${isAr ? 'قسم فرعي' : 'subs'}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted hover:text-primary transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleting(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-down">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-secondary">
                {modal === 'create' ? (isAr ? 'إضافة قسم' : 'Add Category') : (isAr ? 'تعديل قسم' : 'Edit Category')}
              </h3>
              <button onClick={() => setModal(null)} className="text-muted hover:text-dark"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              {[
                { key: 'name_ar', label: isAr ? 'الاسم بالعربية' : 'Arabic Name' },
                { key: 'name_en', label: isAr ? 'الاسم بالإنجليزية' : 'English Name' },
                { key: 'name_fr', label: isAr ? 'الاسم بالفرنسية' : 'French Name' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-muted mb-1">{label}</label>
                  <input value={form[key]} onChange={e => setField(key, e.target.value)}
                    className={`input-field ${errors[key] ? 'border-red-400' : ''}`} />
                  {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key][0]}</p>}
                </div>
              ))}

              {/* Parent */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  {isAr ? 'القسم الأب (اختياري)' : 'Parent Category (optional)'}
                </label>
                <select value={form.parent_id} onChange={e => setField('parent_id', e.target.value)} className="input-field">
                  <option value="">{isAr ? 'بدون أب' : 'No parent (root)'}</option>
                  {categories.filter(c => !editCat || c.id !== editCat.id).map(c => (
                    <option key={c.id} value={c.id}>{getLocalized(c, 'name', language)}</option>
                  ))}
                </select>
              </div>

              {/* Sort order + Active */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-muted mb-1">
                    {isAr ? 'الترتيب' : 'Sort Order'}
                  </label>
                  <input type="number" value={form.sort_order}
                    onChange={e => setField('sort_order', parseInt(e.target.value))}
                    className="input-field" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active}
                      onChange={e => setField('is_active', e.target.checked)}
                      className="w-4 h-4 accent-primary" />
                    <span className="text-sm text-dark">{isAr ? 'نشط' : 'Active'}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-border px-6 py-4 flex gap-3">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? <Loader2 size={16} className="animate-spin" /> : (isAr ? 'حفظ' : 'Save')}
              </button>
              <button onClick={() => setModal(null)} className="btn-ghost flex-1 justify-center">
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 animate-fade-in">
            <p className="text-2xl">🗑️</p>
            <p className="font-bold text-secondary">{isAr ? 'حذف القسم؟' : 'Delete Category?'}</p>
            <p className="text-sm text-muted">
              {isAr ? 'لا يمكن حذف قسم يحتوي على منتجات.' : 'Categories with products cannot be deleted.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleting)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg text-sm">
                {isAr ? 'حذف' : 'Delete'}
              </button>
              <button onClick={() => setDeleting(null)} className="flex-1 btn-ghost justify-center">
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
