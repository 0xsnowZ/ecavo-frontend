import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import useThemeStore from "../../../store/useThemeStore";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";
import { adminBannersService } from "../../../services";
import { toast } from "sonner";
import Spinner from "../../../components/ui/Spinner";
import Cropper from 'react-easy-crop';
import getCroppedImg from "../../../utils/cropImage";
import api from "../../../services/api";
export default function BannersPage() {
  const { t } = useTranslation();
  const { dark } = useThemeStore();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingBanner, setDeletingBanner] = useState(null);

  // Form state
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(0);

  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data } = await adminBannersService.getAll();
      setBanners(data);
    } catch (error) {
      toast.error(t("admin.errors.fetch_failed", "Failed to fetch banners"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openModal = async (banner = null) => {
    if (banner) {
      setEditingId(banner.id);
      setIsActive(banner.is_active);
      setOrder(banner.order);
      
      const pathPart = banner.image_url.split('/storage/')[1];
      
      try {
        const response = await api.get(`/admin/banners/image?path=${encodeURIComponent(pathPart)}`, { responseType: 'blob' });
        const blobUrl = URL.createObjectURL(response.data);
        setPreview(blobUrl);
      } catch (err) {
        toast.error("Failed to load image for cropping");
        setPreview(banner.image_url);
      }
      
      setFile(null);
      setIsCropping(true);
    } else {
      setEditingId(null);
      setIsActive(true);
      // Auto-continue display order
      const maxOrder = banners.length > 0 ? Math.max(...banners.map(b => b.order)) : 0;
      setOrder(maxOrder + 1);
      setPreview(null);
      setFile(null);
      setIsCropping(false);
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setIsCropping(true);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !editingId) {
      toast.error(t("admin.errors.image_required", "Image is required"));
      return;
    }

    const formData = new FormData();
    
    // Attempt to crop the image (either new or existing)
    if (isCropping && preview && croppedAreaPixels) {
      try {
        const croppedImageBlob = await getCroppedImg(preview, croppedAreaPixels);
        formData.append("image", croppedImageBlob, "banner.jpg");
      } catch (err) {
        toast.error("Failed to crop image. CORS issue or network error.");
        return;
      }
    } else if (file) {
      formData.append("image", file);
    } else if (!editingId) {
      toast.error(t("admin.errors.image_required", "Image is required"));
      return;
    }

    formData.append("is_active", isActive ? 1 : 0);
    formData.append("order", order);

    // For PUT/PATCH with file uploads in Laravel, we use POST with _method=PUT
    if (editingId) formData.append("_method", "PUT");

    try {
      if (editingId) {
        await adminBannersService.update(editingId, formData);
        toast.success(t("admin.success.updated", "Updated successfully"));
      } else {
        await adminBannersService.create(formData);
        toast.success(t("admin.success.created", "Created successfully"));
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (error) {
      toast.error(t("admin.errors.save_failed", "Failed to save"));
    }
  };

  const toggleActive = async (id) => {
    try {
      await adminBannersService.toggleActive(id);
      toast.success(t("admin.success.updated", "Status updated"));
      fetchBanners();
    } catch (error) {
      toast.error(t("admin.errors.update_failed", "Failed to update"));
    }
  };

  const deleteBanner = (id) => {
    setDeletingBanner(id);
  };

  const confirmDelete = async () => {
    if (!deletingBanner) return;
    try {
      await adminBannersService.delete(deletingBanner);
      toast.success(t("admin.success.deleted", "Deleted successfully"));
      fetchBanners();
    } catch (error) {
      toast.error(t("admin.errors.delete_failed", "Failed to delete"));
    } finally {
      setDeletingBanner(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="text-primary" />
            {t("admin.banners", "Banners")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage storefront hero banners
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          {t("admin.add_new", "Add New")}
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : banners.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 p-12 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
          <ImageIcon size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("admin.no_data", "No Data Available")}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm flex flex-col">
              <div className="aspect-[21/9] bg-gray-100 dark:bg-gray-800 relative">
                <img src={banner.image_url} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute top-3 end-3 flex gap-2">
                  <button
                    onClick={() => toggleActive(banner.id)}
                    className={`p-1.5 rounded-full backdrop-blur-md shadow-sm ${banner.is_active
                      ? 'bg-green-500/90 text-white'
                      : 'bg-white/90 text-gray-400 dark:bg-gray-800/90'
                      }`}
                  >
                    {banner.is_active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  </button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between mt-auto">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("admin.order", "Order")}: {banner.order}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(banner)}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deleteBanner(banner.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && createPortal(
        <div className={dark ? "dark" : ""}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingId ? t("admin.edit", "Edit") : t("admin.add_new", "Add New")}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("admin.image", "Banner Image")}
                </label>
                {isCropping && preview ? (
                  <div className="space-y-4">
                    <div className="relative w-full h-64 bg-black rounded-xl overflow-hidden">
                      <Cropper
                        image={preview}
                        crop={crop}
                        zoom={zoom}
                        aspect={1280 / 575}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            setPreview(null);
                            setIsCropping(false);
                          }}
                          className="bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-lg shadow-sm text-xs font-medium"
                        >
                          Change Image
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 px-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Zoom</span>
                      <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {preview ? (
                      <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain" />
                    ) : (
                      <div className="py-6">
                        <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload image</span>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">
                          {t("admin.recommended_resolution", "Recommended size: 1280x575px")}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("admin.order", "Display Order")}
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center h-full pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("admin.active", "Active")}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors"
                >
                  {t("admin.cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-colors shadow-sm"
                >
                  {t("admin.save", "Save")}
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deletingBanner && createPortal(
        <div className={dark ? "dark" : ""}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-xl p-6 text-center animate-slide-up">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t("admin.confirm_delete", "Are you sure?")}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                {t("admin.delete_warning", "You are about to delete this banner. This action cannot be undone.")}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setDeletingBanner(null)}
                  className="px-5 py-2 text-gray-700 dark:text-gray-300 font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  {t("admin.cancel", "Cancel")}
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-5 py-2 text-white font-medium bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
                >
                  {t("admin.delete", "Delete")}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
