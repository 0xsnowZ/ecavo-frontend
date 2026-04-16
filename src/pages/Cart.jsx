import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  X,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { useCartStore } from "../store/useCartStore";
import { useLocaleStore } from "../store/useLocaleStore";
import { getLocalized } from "../utils/localize";
import { resolveImageUrl } from "../utils/imageUrl";

export default function Cart() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const {
    items,
    removeItem,
    updateQty,
    getSubtotal,
    getTotal,
    deliveryFee,
    coupon,
    applyCoupon,
    removeCoupon,
    getDiscount,
  } = useCartStore();
  const { currency } = useLocaleStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const fmt = (usd) => `${currency.symbol}${(usd * currency.rate).toFixed(2)}`;

  const handleCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/cart/apply-coupon`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: couponInput.toUpperCase() }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setCouponError(
          data.message || (isAr ? "كود غير صالح" : "Invalid coupon"),
        );
      } else {
        applyCoupon({
          code: data.coupon_code,
          type: "applied",
          value: data.discount,
        });
      }
    } catch {
      setCouponError(isAr ? "حدث خطأ" : "An error occurred");
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0)
    return (
      <div className="container-main py-24 flex flex-col items-center text-center gap-4">
        <ShoppingBag size={64} className="text-gray-200" />
        <h1 className="text-2xl font-bold text-secondary">
          {isAr ? "سلتك فارغة" : "Your cart is empty"}
        </h1>
        <p className="text-muted text-sm">
          {isAr
            ? "أضف بعض المنتجات وابدأ التسوق!"
            : "Add some products and start shopping!"}
        </p>
        <Link to="/products" className="btn-primary">
          {isAr ? "تصفح المنتجات" : "Browse Products"}
        </Link>
      </div>
    );

  return (
    <div className="container-main py-8">
      <h1 className="text-2xl font-bold text-secondary mb-6">
        {t("cart.title")}
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Items list ── */}
        <div className="flex-1 space-y-4">
          {/* Header row */}
          <div className="hidden sm:grid grid-cols-12 text-xs text-muted uppercase tracking-wider px-4 pb-2 border-b border-border">
            <span className="col-span-6">{isAr ? "المنتج" : "Product"}</span>
            <span className="col-span-2 text-center">
              {isAr ? "السعر" : "Price"}
            </span>
            <span className="col-span-2 text-center">{t("cart.qty")}</span>
            <span className="col-span-2 text-center">
              {isAr ? "الإجمالي" : "Total"}
            </span>
          </div>

          {items.map((item) => {
            const price = item.product.price + (item.variant?.extra_price ?? 0);
            return (
              <div
                key={item.key}
                className="card p-4 grid grid-cols-12 gap-3 items-center animate-fade-in"
              >
                {/* Image + name */}
                <div className="col-span-12 sm:col-span-6 flex items-center gap-3">
                  <Link to={`/products/${item.product.slug}`}>
                    <img
                      src={resolveImageUrl(item.product.images?.[0])}
                      alt={getLocalized(item.product, "name", i18n.language)}
                      className="w-16 h-16 object-contain rounded-xl bg-gray-50 p-1"
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      to={`/products/${item.product.slug}`}
                      className="text-sm font-semibold text-dark hover:text-primary transition-colors line-clamp-2"
                    >
                      {getLocalized(item.product, "name", i18n.language)}
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-muted mt-0.5">
                        {item.variant.attribute}: {item.variant.value}
                      </p>
                    )}
                    {/* Mobile price */}
                    <p className="sm:hidden text-sm font-bold text-primary mt-1">
                      {fmt(price)}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="hidden sm:flex col-span-2 justify-center">
                  <span className="text-sm font-semibold text-dark">
                    {fmt(price)}
                  </span>
                </div>

                {/* Qty */}
                <div className="col-span-8 sm:col-span-2 flex items-center justify-center gap-1">
                  <button
                    onClick={() => updateQty(item.key, item.qty - 1)}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.key, item.qty + 1)}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Line total + delete */}
                <div className="col-span-4 sm:col-span-2 flex items-center justify-end sm:justify-center gap-2">
                  <span className="text-sm font-bold text-primary">
                    {fmt(price * item.qty)}
                  </span>
                  <button
                    onClick={() => removeItem(item.key)}
                    className="text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Continue shopping */}
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mt-2"
          >
            <ArrowRight size={16} className="rtl-flip" />
            {t("cart.continue")}
          </Link>
        </div>

        {/* ── Summary panel ── */}
        <div className="lg:w-80 shrink-0">
          <div className="card p-5 space-y-4 sticky top-24">
            <h2 className="font-bold text-secondary text-lg border-b border-border pb-3">
              {isAr ? "ملخص الطلب" : "Order Summary"}
            </h2>

            {/* Coupon input */}
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 block">
                {t("cart.coupon")}
              </label>
              {coupon ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <Tag size={14} className="text-green-600" />
                  <span className="text-sm font-semibold text-green-700 flex-1">
                    {coupon.code}
                  </span>
                  <button
                    onClick={removeCoupon}
                    className="text-green-500 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponError("");
                    }}
                    placeholder="ECAVO10"
                    className="input-field flex-1 uppercase"
                  />
                  <button
                    onClick={handleCoupon}
                    disabled={couponLoading}
                    className="btn-outline text-sm px-3 py-2 whitespace-nowrap"
                  >
                    {t("cart.apply_coupon")}
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-xs text-red-500 mt-1">{couponError}</p>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>{t("cart.subtotal")}</span>
                <span>{fmt(getSubtotal())}</span>
              </div>
              {getDiscount() > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{isAr ? "الخصم" : "Discount"}</span>
                  <span>- {fmt(getDiscount())}</span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>{t("cart.delivery")}</span>
                <span>{fmt(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-dark text-base pt-2 border-t border-border">
                <span>{t("cart.total")}</span>
                <span className="text-primary">{fmt(getTotal())}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="btn-primary w-full justify-center py-3"
            >
              {t("cart.checkout")}
              <ArrowRight size={18} className="rtl-flip" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
