import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Lock,
  ShieldCheck,
  CreditCard,
  Tag,
  X,
} from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import { useLocaleStore } from "../store/useLocaleStore";
import { ordersService } from "../services";
import { getLocalized } from "../utils/localize";
import { resolveImageUrl } from "../utils/imageUrl";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

// ─────────────────────────────────────────────────────────────────────────────
// StripePaymentSection — only rendered inside <Elements>, so hooks are safe
// ─────────────────────────────────────────────────────────────────────────────
function StripePaymentSection({ onConfirm, loading }) {
  const stripe = useStripe();
  const elements = useElements();

  // Expose confirm logic to parent via callback on mount
  // We do this by passing a ready callback
  const ready = stripe && elements;

  return (
    <div className="mt-4 space-y-4">
      {ready ? (
        <PaymentElement />
      ) : (
        <div className="flex items-center justify-center gap-3 py-6 text-muted">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm">Loading secure payment form…</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CheckoutForm — pure form logic, NO Stripe hooks
// ─────────────────────────────────────────────────────────────────────────────
function CheckoutForm({
  onStripeSelected,
  stripeEnabled,    // true once Elements is mounted
  stripeError,      // error from fetching client_secret
  fetchingSecret,   // loading state while fetching client_secret
  onConfirmStripe,  // async fn(cartPayload) -> { paymentIntentId } | throws
}) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const isFr = i18n.language === "fr";
  const navigate = useNavigate();

  const {
    items,
    getSubtotal,
    getTotal,
    deliveryFee,
    getDiscount,
    coupon,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { currency } = useLocaleStore();

  const fmt = (usd) => `${currency.symbol}${(usd * currency.rate).toFixed(2)}`;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
    coupon_code: coupon?.code || "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // ── Coupon state ──
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

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
        setCouponError(data.message || (isAr ? "كود غير صالح" : "Invalid coupon code"));
      } else {
        applyCoupon({ code: data.coupon_code, type: data.discount_type, value: data.value });
        setCouponInput("");
      }
    } catch {
      setCouponError(isAr ? "حدث خطأ" : "An error occurred");
    } finally {
      setCouponLoading(false);
    }
  };

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handlePaymentMethodChange = (id) => {
    setPaymentMethod(id);
    if (id === "stripe") onStripeSelected();
  };

  const validate = () => {
    const errs = {};
    if (!form.name)
      errs.name = isAr ? "الاسم مطلوب" : isFr ? "Nom requis" : "Name required";
    if (!form.email)
      errs.email = isAr ? "البريد الإلكتروني مطلوب" : isFr ? "Email requis" : "Email required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = isAr ? "البريد الإلكتروني غير صالح" : isFr ? "Email invalide" : "Invalid email address";
    if (!form.phone)
      errs.phone = isAr
        ? "الهاتف مطلوب"
        : isFr
          ? "Téléphone requis"
          : "Phone required";
    if (!form.address)
      errs.address = isAr
        ? "العنوان مطلوب"
        : isFr
          ? "Adresse requise"
          : "Address required";
    if (!form.city)
      errs.city = isAr
        ? "المدينة مطلوبة"
        : isFr
          ? "Ville requise"
          : "City required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const cartPayload = items.map((item) => {
      let vIds = [];
      const vIdRaw = item.variant?.id;
      if (typeof vIdRaw === 'number') {
         vIds = [vIdRaw];
      } else if (typeof vIdRaw === 'string' && vIdRaw.startsWith('var-')) {
         vIds = vIdRaw.replace('var-', '').split('-').map(Number);
      }
      return {
        product_id: item.product.id,
        qty: item.qty,
        variant_label: item.variant?.value || null,
        variant_ids: vIds.length > 0 ? vIds : null,
      };
    });

    setLoading(true);
    setApiError("");
    try {
      let paymentIntentId = null;

      if (paymentMethod === "stripe") {
        // onConfirmStripe handles useStripe/useElements internally
        paymentIntentId = await onConfirmStripe();
        if (!paymentIntentId) {
          // Error was already shown inside onConfirmStripe
          setLoading(false);
          return;
        }
      }

      const res = await ordersService.checkout({
        ...form,
        items: cartPayload,
        payment_method: paymentMethod,
        payment_intent_id: paymentIntentId,
      });
      const orderId = res.data.order?.id;
      clearCart();
      navigate(`/order-confirm/${orderId}`);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (isAr
          ? "حدث خطأ أثناء إتمام الطلب"
          : isFr
            ? "Échec du paiement, veuillez réessayer"
            : "Checkout failed, please try again");
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0)
    return (
      <div className="container-main py-24 text-center">
        <p className="text-xl text-muted mb-4">{t("checkout.empty_cart")}</p>
        <Link to="/products" className="btn-primary">
          {t("checkout.shop_now")}
        </Link>
      </div>
    );

  return (
    <div className="container-main py-8 pb-24 lg:pb-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">
          {t("nav.home")}
        </Link>
        <ChevronRight size={12} className="rtl-flip" />
        <Link to="/cart" className="hover:text-primary">
          {t("cart.title")}
        </Link>
        <ChevronRight size={12} className="rtl-flip" />
        <span className="text-dark">{t("checkout.title")}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-secondary dark:text-white mb-1 tracking-tight">
          {t("checkout.title")}
        </h1>
        <p className="text-muted dark:text-gray-400 text-sm">
          {isAr
            ? "أكمل بياناتك بأمان لإتمام الطلب"
            : "Complete your details securely to place your order."}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Left: Shipping + Payment ── */}
          <div className="flex-1 space-y-5">
            {/* Shipping details card */}
            <div className="bg-white dark:bg-[#1a1a25] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-xl">
                  <MapPin size={20} className="text-primary" />
                </div>
                <h2 className="text-lg font-bold text-secondary dark:text-white">
                  {t("checkout.shipping_details")}
                </h2>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-dark dark:text-gray-200 mb-1.5">
                  {t("checkout.name")}
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute start-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder={
                      isAr ? "محمد أحمد" : t("checkout.name_placeholder")
                    }
                    className={`input-field ps-9 ${errors.name ? "border-red-400" : ""}`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-dark dark:text-gray-200 mb-1.5">
                  {isAr ? "البريد الإلكتروني" : isFr ? "Adresse e-mail" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute start-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder={isAr ? "example@email.com" : isFr ? "exemple@email.com" : "you@example.com"}
                    className={`input-field ps-9 ${errors.email ? "border-red-400" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-dark dark:text-gray-200 mb-1.5">
                  {t("checkout.phone")}
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute start-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+20 100 000 0000"
                    className={`input-field ps-9 ${errors.phone ? "border-red-400" : ""}`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Address + City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark dark:text-gray-200 mb-1.5">
                    {t("checkout.street")}
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder={
                      isAr
                        ? "شارع الجمهورية 45"
                        : t("checkout.address_placeholder")
                    }
                    className={`input-field ${errors.address ? "border-red-400" : ""}`}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark dark:text-gray-200 mb-1.5">
                    {t("checkout.city")}
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder={
                      isAr ? "القاهرة" : t("checkout.city_placeholder")
                    }
                    className={`input-field ${errors.city ? "border-red-400" : ""}`}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-dark dark:text-gray-200 mb-1.5">
                  {t("checkout.notes")}{" "}
                  <span className="text-muted font-normal">
                    {t("checkout.optional")}
                  </span>
                </label>
                <div className="relative">
                  <FileText
                    size={16}
                    className="absolute start-3 top-3 text-muted"
                  />
                  <textarea
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    rows={3}
                    placeholder={
                      isAr
                        ? "ملاحظات إضافية للتوصيل..."
                        : t("checkout.notes_placeholder")
                    }
                    className="input-field ps-9 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white dark:bg-[#1a1a25] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-xl">
                    <Lock size={20} className="text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-secondary dark:text-white">
                    {t("checkout.payment")}
                  </h2>
                </div>
                <div className="flex gap-1.5 items-center">
                  <ShieldCheck size={16} className="text-green-500" />
                  <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">
                    Secure
                  </span>
                </div>
              </div>

              {/* Payment method cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: "cod", labelEn: "Cash on Delivery", labelAr: "الدفع عند الاستلام", icon: "💵" },
                  { id: "stripe", labelEn: "Credit / Debit Card", labelAr: "الدفع بالبطاقة", icon: "💳" },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`relative flex items-center p-4 rounded-xl border cursor-pointer transition-colors
                      ${paymentMethod === m.id
                        ? "border-primary bg-white shadow-sm dark:bg-gray-800 ring-1 ring-primary"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-gray-50/50 dark:bg-gray-800/50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={paymentMethod === m.id}
                      onChange={() => handlePaymentMethodChange(m.id)}
                      className="sr-only"
                    />
                    
                    {/* Radio circle */}
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0
                        ${paymentMethod === m.id ? "border-primary" : "border-gray-300 dark:border-gray-600"}`}
                    >
                      {paymentMethod === m.id && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>

                    {/* Text and Icon */}
                    <div className="flex items-center justify-between w-full ms-3">
                      <span className={`text-sm font-semibold transition-colors ${paymentMethod === m.id ? "text-primary dark:text-white" : "text-dark dark:text-gray-300"}`}>
                        {isAr ? m.labelAr : m.labelEn}
                      </span>
                      <span className="text-2xl opacity-80">{m.icon}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Stripe payment element — only rendered when stripeEnabled */}
              {paymentMethod === "stripe" && (
                <div className="mt-6 p-5 border-2 border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/60">
                  {fetchingSecret && (
                    <div className="flex items-center justify-center gap-3 py-6 text-muted">
                      <Loader2 className="animate-spin" size={20} />
                      <span className="text-sm">Initializing secure payment…</span>
                    </div>
                  )}
                  {stripeError && !fetchingSecret && (
                    <p className="text-sm text-red-500 flex items-center gap-2 py-4">
                      <ShieldCheck size={16} /> {stripeError}
                    </p>
                  )}
                  {/* StripePaymentSection is injected by CheckoutWrapper when ready */}
                  {stripeEnabled && !fetchingSecret && !stripeError && (
                    <PaymentElement />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:w-[380px] shrink-0">
            <div className="bg-gray-50 dark:bg-gray-800/80 rounded-2xl p-6 sm:p-8 sticky top-24 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h2 className="text-lg font-bold text-secondary dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4 mb-6 flex justify-between items-center">
                {t("checkout.order_summary")}
                <span className="bg-white dark:bg-gray-700 text-dark dark:text-white text-xs px-2.5 py-1 rounded-full font-semibold border border-gray-100 dark:border-gray-600">
                  {items.length} {isAr ? "عناصر" : "items"}
                </span>
              </h2>

              {/* Items list */}
              <div className="space-y-4 max-h-64 overflow-y-auto mb-6 p-2 -mx-2">
                {items.map((item) => (
                  <div key={item.key} className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={resolveImageUrl(item.product.images?.[0])}
                        alt={getLocalized(item.product, "name", i18n.language)}
                        className="w-14 h-14 object-cover rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                      />
                      <span className="absolute -top-2 -end-2 z-10 bg-gray-700 text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold ring-2 ring-gray-50 dark:ring-gray-800">
                        {item.qty}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark dark:text-white line-clamp-2 leading-snug">
                        {getLocalized(item.product, "name", i18n.language)}
                      </p>
                      {item.variant?.value && (
                        <p className="text-xs text-muted dark:text-gray-400 mt-1">
                          {item.variant.value}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-dark dark:text-white whitespace-nowrap">
                      {fmt((parseFloat(item.product.price) + parseFloat(item.variant?.extra_price || 0)) * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              {/* ── Coupon code ── */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                <label className="text-xs font-bold text-muted dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag size={13} />
                  {isAr ? "كود الخصم" : "Discount Code"}
                </label>
                {coupon ? (
                  <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl px-3 py-2.5">
                    <Tag size={14} className="text-green-600 dark:text-green-400 shrink-0" />
                    <span className="text-sm font-bold text-green-700 dark:text-green-300 flex-1 uppercase tracking-wider">
                      {coupon.code}
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-green-500 hover:text-red-500 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCoupon())}
                      placeholder={isAr ? "أدخل الكود" : "e.g. ECAVO10"}
                      className="input-field flex-1 uppercase text-sm tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={handleCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="shrink-0 bg-gray-100 dark:bg-gray-700 hover:bg-primary hover:text-white disabled:opacity-50 text-dark dark:text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                    >
                      {couponLoading ? <Loader2 size={16} className="animate-spin" /> : (isAr ? "تطبيق" : "Apply")}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1.5">{couponError}</p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 text-sm border-t border-gray-200 dark:border-gray-700 pt-5">
                <div className="flex justify-between text-muted dark:text-gray-400">
                  <span>{t("cart.subtotal")}</span>
                  <span className="font-medium text-dark dark:text-white">{fmt(getSubtotal())}</span>
                </div>
                {getDiscount() > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1.5 rounded-lg">
                    <span>{t("checkout.discount")}</span>
                    <span>- {fmt(getDiscount())}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted dark:text-gray-400">
                  <span>{t("cart.delivery")}</span>
                  <span className="font-medium text-dark dark:text-white">{fmt(deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-dark dark:text-white text-xl pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span>{t("cart.total")}</span>
                  <span className="text-primary">{fmt(getTotal())}</span>
                </div>
              </div>

              {/* API Error */}
              {apiError && (
                <div className="mt-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl p-4">
                  {apiError}
                </div>
              )}

              {/* Guest warning */}
              {!isAuthenticated && (
                <div className="mt-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-1">{t("checkout.guest_note")}</p>
                  <Link to="/login" className="font-bold hover:underline">
                    {t("checkout.guest_signin")}
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (paymentMethod === "stripe" && (fetchingSecret || !stripeEnabled || !!stripeError))}
                className="w-full mt-6 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : (
                  <>
                    <Lock size={18} />
                    <span>
                      {isAr ? "دفع وإتمام الطلب" : "Pay & Place Order"}
                    </span>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-muted dark:text-gray-500 mt-4 flex items-center justify-center gap-1.5">
                <Lock size={11} />
                {isAr
                  ? "جميع المعاملات آمنة ومشفرة"
                  : "Secured & encrypted by Stripe"}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StripeCheckout — renders CheckoutForm INSIDE <Elements>, so hooks are safe
// ─────────────────────────────────────────────────────────────────────────────
function StripeCheckout({ onStripeSelected, stripeError, fetchingSecret, onConfirmStripe }) {
  // These hooks are safe here because this component is ALWAYS inside <Elements>
  const stripe = useStripe();
  const elements = useElements();

  const handleConfirmStripe = async () => {
    if (!stripe || !elements) return null;
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/order-confirm/temp",
      },
      redirect: "if_required",
    });
    if (error) throw new Error(error.message);
    return paymentIntent.id;
  };

  return (
    <CheckoutForm
      onStripeSelected={onStripeSelected}
      stripeEnabled={!!(stripe && elements)}
      stripeError={stripeError}
      fetchingSecret={fetchingSecret}
      onConfirmStripe={handleConfirmStripe}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CheckoutWrapper — decides whether to wrap with <Elements> or not
// ─────────────────────────────────────────────────────────────────────────────
export default function CheckoutWrapper() {
  const { items } = useCartStore();
  const [clientSecret, setClientSecret] = useState("");
  const [fetchingSecret, setFetchingSecret] = useState(false);
  const [stripeError, setStripeError] = useState("");

  const handleStripeSelected = async () => {
    if (clientSecret || fetchingSecret) return;
    setFetchingSecret(true);
    setStripeError("");
    try {
      const cartPayload = items.map((item) => {
        let vIds = [];
        const vIdRaw = item.variant?.id;
        if (typeof vIdRaw === 'number') {
           vIds = [vIdRaw];
        } else if (typeof vIdRaw === 'string' && vIdRaw.startsWith('var-')) {
           vIds = vIdRaw.replace('var-', '').split('-').map(Number);
        }
        return {
          product_id: item.product.id,
          qty: item.qty,
          variant_label: item.variant?.value || null,
          variant_ids: vIds.length > 0 ? vIds : null,
        };
      });
      const res = await ordersService.createPaymentIntent({ items: cartPayload });
      setClientSecret(res.data.clientSecret);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Could not initialize payment. Please try again.";
      setStripeError(msg);
    } finally {
      setFetchingSecret(false);
    }
  };

  // Once we have a clientSecret, wrap in Elements so useStripe/useElements work
  if (clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <StripeCheckout
          onStripeSelected={handleStripeSelected}
          stripeError={stripeError}
          fetchingSecret={fetchingSecret}
        />
      </Elements>
    );
  }

  // No clientSecret yet — render plain form (COD works, Stripe shows loading state)
  return (
    <CheckoutForm
      onStripeSelected={handleStripeSelected}
      stripeEnabled={false}
      stripeError={stripeError}
      fetchingSecret={fetchingSecret}
      onConfirmStripe={async () => null}
    />
  );
}
