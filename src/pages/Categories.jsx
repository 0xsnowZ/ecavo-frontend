import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, Tag, ArrowRight } from "lucide-react";
import { categoriesService } from "../services";
import Skeleton from "../components/ui/Skeleton";
import SEO from "../components/common/SEO";
import { getLocalized } from "../utils/localize";
import { resolveImageUrl } from "../utils/imageUrl";

// Category color palette — cycles through for visual variety
const PALETTE = [
  { bg: "bg-red-50", icon: "text-red-500", border: "hover:border-red-300" },
  { bg: "bg-blue-50", icon: "text-blue-500", border: "hover:border-blue-300" },
  {
    bg: "bg-green-50",
    icon: "text-green-500",
    border: "hover:border-green-300",
  },
  {
    bg: "bg-purple-50",
    icon: "text-purple-500",
    border: "hover:border-purple-300",
  },
  {
    bg: "bg-orange-50",
    icon: "text-orange-500",
    border: "hover:border-orange-300",
  },
  { bg: "bg-teal-50", icon: "text-teal-500", border: "hover:border-teal-300" },
  { bg: "bg-pink-50", icon: "text-pink-500", border: "hover:border-pink-300" },
  {
    bg: "bg-indigo-50",
    icon: "text-indigo-500",
    border: "hover:border-indigo-300",
  },
  {
    bg: "bg-yellow-50",
    icon: "text-yellow-600",
    border: "hover:border-yellow-300",
  },
  { bg: "bg-cyan-50", icon: "text-cyan-500", border: "hover:border-cyan-300" },
];

export default function Categories() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesService
      .all()
      .then((r) => setCategories(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEO
        titleAr="جميع الأقسام"
        titleEn="All Categories"
        descriptionAr="تصفح كل أقسام متجر إيكافو — أجهزة كهربائية، ملابس، موبايلات، أثاث، مستحضرات جمال وأكثر."
        descriptionEn="Browse all ECAVO store categories — appliances, clothes, mobiles, furniture, beauty, and more."
        lang={isAr ? "ar" : "en"}
      />

      <div className="container-main py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-primary">
            {t("nav.home")}
          </Link>
          <ChevronRight size={12} className="rtl-flip" />
          <span className="text-dark">{isAr ? "الأقسام" : "Categories"}</span>
        </nav>

        <h1 className="section-title text-2xl">
          {isAr ? "جميع الأقسام" : "All Categories"}
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-8">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="card p-4 space-y-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-8">
            {categories.map((cat, i) => {
              const palette = PALETTE[i % PALETTE.length];
              return (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.slug}`}
                  className={`card group p-5 flex flex-col gap-3 border-2 border-transparent
                    ${palette.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-hover`}
                >
                  {/* Icon area */}
                  <div
                    className={`w-12 h-12 rounded-xl ${palette.bg} flex items-center justify-center`}
                  >
                    {cat.image ? (
                      <img
                        src={resolveImageUrl(cat.image)}
                        alt=""
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <Tag size={22} className={palette.icon} />
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <p className="font-bold text-dark group-hover:text-primary transition-colors">
                      {getLocalized(cat, "name", i18n.language)}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {i18n.language === "ar" ? cat.name_en : cat.name_ar}
                    </p>
                  </div>

                  {/* Children count or browse arrow */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                    <span className="text-xs text-muted">
                      {cat.children?.length > 0
                        ? `${cat.children.length} ${isAr ? "قسم فرعي" : "sub-categories"}`
                        : isAr
                          ? "تصفح"
                          : "Browse"}
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-muted group-hover:text-primary group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Sub-categories expanded view */}
        {!loading && categories.some((c) => c.children?.length > 0) && (
          <div className="mt-12 space-y-6">
            <h2 className="text-lg font-bold text-secondary">
              {isAr ? "الأقسام الفرعية" : "Sub-categories"}
            </h2>
            {categories
              .filter((c) => c.children?.length > 0)
              .map((parent) => (
                <div key={parent.id}>
                  <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">
                    {getLocalized(parent, "name", i18n.language)}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {parent.children.map((child) => (
                      <Link
                        key={child.id}
                        to={`/categories/${child.slug}`}
                        className="px-4 py-1.5 rounded-full border border-border text-sm text-dark
                                 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                      >
                        {getLocalized(child, "name", i18n.language)}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
}
