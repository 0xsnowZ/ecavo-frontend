import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, Loader2, GripVertical, Star } from 'lucide-react';
import { adminService } from '../../services';

/**
 * ImageUploader
 *
 * Props:
 *   images   — string[]   current image URLs
 *   onChange — (urls: string[]) => void   called on every change
 *   max      — number   max images (default 8)
 */
export default function ImageUploader({ images = [], onChange, max = 8 }) {
  const [draggingOver, setDraggingOver] = useState(false);
  const [uploads, setUploads]           = useState({}); // { tempId: { progress, error } }
  const fileRef = useRef(null);

  // ── Upload a File object ──────────────────────────────────────────────────
  const uploadFile = useCallback(async (file) => {
    const tempId = `uploading-${Date.now()}-${Math.random()}`;

    // Validate client-side
    if (!file.type.startsWith('image/')) {
      alert('يُسمح بالصور فقط / Images only');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      alert('الحد الأقصى 4MB / Max 4MB');
      return;
    }

    setUploads(u => ({ ...u, [tempId]: { progress: true, error: null } }));

    try {
      const res = await adminService.uploadImage(file);
      const url = res.data.url;
      onChange([...images, url]);
    } catch (err) {
      const msg = err.response?.data?.message || 'فشل الرفع / Upload failed';
      setUploads(u => ({ ...u, [tempId]: { progress: false, error: msg } }));
      setTimeout(() => setUploads(u => {
        const copy = { ...u };
        delete copy[tempId];
        return copy;
      }), 3000);
      return;
    }

    setUploads(u => {
      const copy = { ...u };
      delete copy[tempId];
      return copy;
    });
  }, [images, onChange]);

  // ── Process selected files ────────────────────────────────────────────────
  const handleFiles = useCallback((files) => {
    const remaining = max - images.length;
    Array.from(files).slice(0, remaining).forEach(uploadFile);
  }, [max, images.length, uploadFile]);

  // ── Drag & Drop handlers ──────────────────────────────────────────────────
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDraggingOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // ── Remove image ──────────────────────────────────────────────────────────
  const removeImage = async (url, index) => {
    // Extract storage path from URL (the part after /storage/)
    try {
      const path = url.split('/storage/')[1];
      if (path) await adminService.deleteImage(path);
    } catch {
      // Non-fatal — image URL is already removed from list
    }
    onChange(images.filter((_, i) => i !== index));
  };

  // ── Set as primary (move to index 0) ─────────────────────────────────────
  const setPrimary = (index) => {
    if (index === 0) return;
    const reordered = [images[index], ...images.filter((_, i) => i !== index)];
    onChange(reordered);
  };

  const isUploading = Object.values(uploads).some(u => u.progress);
  const canUploadMore = images.length < max;

  return (
    <div className="space-y-3">
      {/* Existing images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url, i) => (
            <div
              key={url}
              className={`relative group rounded-xl overflow-hidden bg-gray-50 border-2 aspect-square
                ${i === 0 ? 'border-primary' : 'border-transparent hover:border-gray-300'}`}
            >
              <img
                src={url}
                alt={`product-${i}`}
                className="w-full h-full object-contain p-2"
              />

              {/* Primary badge */}
              {i === 0 && (
                <div className="absolute top-1 start-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  رئيسية
                </div>
              )}

              {/* Hover controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => setPrimary(i)}
                    title="Set as primary"
                    className="bg-white/90 hover:bg-white text-primary p-1.5 rounded-full text-xs transition-all"
                  >
                    <Star size={13} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(url, i)}
                  title="Remove"
                  className="bg-white/90 hover:bg-red-500 hover:text-white text-red-500 p-1.5 rounded-full transition-all"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}

          {/* Uploading placeholders */}
          {Object.entries(uploads).map(([id, state]) => (
            <div
              key={id}
              className={`rounded-xl border-2 border-dashed aspect-square flex flex-col items-center justify-center gap-1
                ${state.error ? 'border-red-300 bg-red-50' : 'border-primary/40 bg-primary/5'}`}
            >
              {state.progress
                ? <Loader2 size={22} className="text-primary animate-spin" />
                : <p className="text-[10px] text-red-500 text-center px-1">{state.error}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {canUploadMore && (
        <div
          onDragOver={e => { e.preventDefault(); setDraggingOver(true); }}
          onDragLeave={() => setDraggingOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
            ${draggingOver
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : 'border-border hover:border-primary hover:bg-primary/5'}`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={e => { if (e.target.files) handleFiles(e.target.files); e.target.value = ''; }}
          />

          <div className="flex flex-col items-center gap-2 pointer-events-none">
            {isUploading ? (
              <Loader2 size={30} className="text-primary animate-spin" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload size={22} className="text-primary" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-dark">
                {draggingOver
                  ? 'أفلت الصورة هنا / Drop here'
                  : 'اسحب وأفلت أو انقر للرفع / Drag & drop or click'}
              </p>
              <p className="text-xs text-muted mt-0.5">
                JPG, PNG, WebP — Max 4MB — {images.length}/{max} صور
              </p>
            </div>
          </div>
        </div>
      )}

      {images.length >= max && (
        <p className="text-xs text-muted text-center">
          وصلت للحد الأقصى {max} صور / Maximum {max} images reached
        </p>
      )}

      {/* Order hint */}
      {images.length > 1 && (
        <p className="text-xs text-muted flex items-center gap-1">
          <Star size={11} className="text-primary" />
          الصورة الأولى هي الصورة الرئيسية — انقر ⭐ لتعيين أي صورة رئيسية
        </p>
      )}
    </div>
  );
}
