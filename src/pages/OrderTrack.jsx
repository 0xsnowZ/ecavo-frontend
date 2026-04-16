import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { ordersService } from "../services";
import { useLocaleStore } from "../store/useLocaleStore";
import Spinner from "../components/ui/Spinner";
import { resolveImageUrl } from "../utils/imageUrl";

const STEPS = [
  { status: "placed", key: "status_placed", icon: CheckCircle2 },
  { status: "preparing", key: "status_preparing", icon: Package },
  { status: "awaiting_shipment", key: "status_awaiting_ship", icon: Package },
  { status: "shipped", key: "status_shipped", icon: Truck },
  { status: "in_transit", key: "status_in_transit", icon: Truck },
  { status: "delivered", key: "status_delivered", icon: ShieldCheck },
];

// Non-pipeline statuses shown as alert pill
const ALERT_STATUSES = {
  no_answer: {
    key: "status_no_answer",
    color: "bg-orange-100 text-orange-700",
  },
  postponed: { key: "status_postponed", color: "bg-gray-100 text-gray-600" },
  wrong_address: {
    key: "status_wrong_address",
    color: "bg-red-100 text-red-600",
  },
  cancelled: { key: "status_cancelled", color: "bg-red-100 text-red-600" },
  returned: { key: "status_returned", color: "bg-purple-100 text-purple-700" },
};

export default function OrderTrack() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { currency } = useLocaleStore();
  const fmt = (usd) => `${currency.symbol}${(usd * currency.rate).toFixed(2)}`;

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ordersService.detail(id).then((r) => setOrder(r.data.data)),
      ordersService.track(id).then((r) => setTracking(r.data.data)),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  if (!order)
    return (
      <div className="container-main py-24 text-center">
        <p className="text-muted">{t("orders.not_found")}</p>
      </div>
    );

  const currentStep = tracking?.current_step ?? 0;
  const isAlertStatus = ALERT_STATUSES[order.status];

  return (
    <div className="container-main py-8 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">
          {t("nav.home")}
        </Link>
        <ChevronRight size={12} className="rtl-flip" />
        <Link to="/account" className="hover:text-primary">
          {t("orders.my_account")}
        </Link>
        <ChevronRight size={12} className="rtl-flip" />
        <span className="text-dark">#{id}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary">
          {t("orders.track_title", { id })}
        </h1>
        <span className="text-xs text-muted">{order.created_at}</span>
      </div>

      {/* Alert status pill */}
      {isAlertStatus && (
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm mb-5 ${isAlertStatus.color}`}
        >
          {t(`orders.${isAlertStatus.key}`)}
        </div>
      )}

      {/* Timeline */}
      <div className="card p-6 mb-5">
        <h2 className="font-bold text-secondary mb-8">{t("orders.journey")}</h2>

        {/* Desktop horizontal timeline */}
        <div className="hidden sm:flex items-start justify-between relative">
          {/* Background line */}
          <div className="absolute top-5 start-0 end-0 h-0.5 bg-gray-200" />
          {/* Progress line */}
          <div
            className="absolute top-5 start-0 h-0.5 bg-primary transition-all duration-700 ease-smooth"
            style={{
              width: `${Math.max(0, ((currentStep - 1) / (STEPS.length - 1)) * 100)}%`,
            }}
          />
          {STEPS.map(({ status, key, icon: Icon }, i) => {
            const stepNum = i + 1;
            const isDone = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            return (
              <div
                key={status}
                className="flex flex-col items-center gap-2 z-10 flex-1"
              >
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300
                  ${
                    isDone
                      ? "bg-primary border-primary text-white"
                      : isCurrent
                        ? "bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/30"
                        : "bg-white border-gray-200 text-gray-300"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={`text-xs text-center leading-tight max-w-16
                  ${isCurrent ? "text-primary font-bold" : isDone ? "text-dark font-medium" : "text-gray-400"}`}
                >
                  {t(`orders.${key}`)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile vertical timeline */}
        <div className="sm:hidden space-y-0">
          {STEPS.map(({ status, key, icon: Icon }, i) => {
            const stepNum = i + 1;
            const isDone = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            const isLast = i === STEPS.length - 1;
            return (
              <div key={status} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                    ${
                      isDone
                        ? "bg-primary border-primary text-white"
                        : isCurrent
                          ? "bg-primary border-primary text-white shadow-md shadow-primary/30"
                          : "bg-white border-gray-200 text-gray-300"
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  {!isLast && (
                    <div
                      className={`w-0.5 h-8 mt-1 ${isDone ? "bg-primary" : "bg-gray-200"}`}
                    />
                  )}
                </div>
                <div className="pb-6">
                  <p
                    className={`text-sm font-medium ${isCurrent ? "text-primary" : isDone ? "text-dark" : "text-gray-400"}`}
                  >
                    {t(`orders.${key}`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order summary */}
      <div className="card p-6 mb-5">
        <h2 className="font-bold text-secondary mb-4">{t("orders.details")}</h2>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 py-2 border-b border-border last:border-0"
            >
              {item.product?.images?.[0] && (
                <img
                  src={resolveImageUrl(item.product.images[0])}
                  alt=""
                  className="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-dark">
                  {item.product_name}
                </p>
                <p className="text-xs text-muted">
                  ×{item.qty} @ {fmt(item.unit_price)}
                </p>
              </div>
              <span className="text-sm font-bold text-primary">
                {fmt(item.total)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-2 text-sm">
          <span className="text-muted">{t("cart.subtotal")}</span>
          <span className="text-end font-medium">{fmt(order.subtotal)}</span>
          <span className="text-muted">{t("cart.delivery")}</span>
          <span className="text-end font-medium">
            {fmt(order.delivery_fee)}
          </span>
          {order.discount > 0 && (
            <>
              <span className="text-green-600">{t("orders.discount")}</span>
              <span className="text-end font-medium text-green-600">
                - {fmt(order.discount)}
              </span>
            </>
          )}
          <span className="font-bold text-dark">{t("cart.total")}</span>
          <span className="text-end font-black text-primary text-base">
            {fmt(order.total)}
          </span>
        </div>
      </div>

      {/* Delivery info */}
      {(order.guest_name || order.guest_address) && (
        <div className="card p-6">
          <h2 className="font-bold text-secondary mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            {t("orders.delivery_info")}
          </h2>
          <div className="text-sm space-y-1">
            {order.guest_name && (
              <p>
                <span className="text-muted">{t("orders.name_label")}</span>
                {order.guest_name}
              </p>
            )}
            {order.guest_phone && (
              <p>
                <span className="text-muted">{t("orders.phone_label")}</span>
                {order.guest_phone}
              </p>
            )}
            {order.guest_address && (
              <p>
                <span className="text-muted">{t("orders.address_label")}</span>
                {order.guest_address}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
