import { useLocaleStore } from "../../../store/useLocaleStore";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Search, RefreshCw, ChevronDown, X, Loader2 } from "lucide-react";
import { adminService } from "../../../services";
import Spinner from "../../../components/ui/Spinner";

const ALL_STATUSES = [
  "placed",
  "preparing",
  "awaiting_shipment",
  "shipped",
  "in_transit",
  "delivered",
  "no_answer",
  "postponed",
  "wrong_address",
  "cancelled",
  "returned",
];

const STATUS_LABEL_AR = {
  placed: "تم الطلب",
  preparing: "يتم التجهيز",
  awaiting_shipment: "انتظار الشحن",
  shipped: "تم الشحن",
  in_transit: "في الطريق",
  delivered: "تم الاستلام",
  no_answer: "لا يرد",
  postponed: "مؤجل",
  wrong_address: "عنوان خاطئ",
  cancelled: "ملغي",
  returned: "مرتجع",
};

const STATUS_LABEL_FR = {
  placed: "Placé",
  preparing: "En Préparation",
  awaiting_shipment: "En Attente",
  shipped: "Expédié",
  in_transit: "En Transit",
  delivered: "Livré",
  no_answer: "Pas de Réponse",
  postponed: "Reporté",
  wrong_address: "Mauvaise Adresse",
  cancelled: "Annulé",
  returned: "Retourné",
};

const STATUS_COLOR = {
  placed:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 dark:ring-1 dark:ring-blue-500/30",
  preparing:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-1 dark:ring-indigo-500/30",
  awaiting_shipment:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300 dark:ring-1 dark:ring-yellow-500/30",
  shipped:
    "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 dark:ring-1 dark:ring-teal-500/30",
  in_transit:
    "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 dark:ring-1 dark:ring-purple-500/30",
  delivered:
    "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 dark:ring-1 dark:ring-green-500/30",
  no_answer:
    "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 dark:ring-1 dark:ring-orange-500/30",
  postponed:
    "bg-gray-100 text-gray-500 dark:bg-gray-500/20 dark:text-gray-300 dark:ring-1 dark:ring-gray-500/30",
  wrong_address:
    "bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-300 dark:ring-1 dark:ring-red-500/30",
  cancelled:
    "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300 dark:ring-1 dark:ring-red-500/30",
  returned:
    "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300 dark:ring-1 dark:ring-pink-500/30",
};

export default function OrdersPage() {
  const { t, i18n } = useTranslation();
  const { language } = useLocaleStore();
  const isAr = language === "ar";
  const isFr = language === "fr";

  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ total: 0, last_page: 1, current_page: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilter] = useState("");
  const [page, setPage] = useState(1);

  // Status update modal
  const [editOrder, setEditOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState("");

  const fetchOrders = useCallback(() => {
    setLoading(true);
    adminService.orders
      .list({ search, status: filterStatus, page, per_page: 20 })
      .then((r) => {
        setOrders(r.data.data || []);
        setMeta(r.data.meta || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, filterStatus, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openEditModal = (order) => {
    setEditOrder(order);
    setNewStatus(order.status);
    setUpdateSuccess("");
  };

  const handleStatusUpdate = async () => {
    if (!editOrder || !newStatus) return;
    setUpdating(true);
    try {
      await adminService.orders.updateStatus(editOrder.id, newStatus);
      setUpdateSuccess(
        isAr
          ? "تم تحديث الحالة بنجاح ✓"
          : isFr
            ? "Statut mis à jour avec succès ✓"
            : "Status updated ✓",
      );
      fetchOrders();
      setTimeout(() => {
        setEditOrder(null);
        setUpdateSuccess("");
      }, 1200);
    } catch {
      alert(
        isAr ? "حدث خطأ" : isFr ? "Échec de la mise à jour" : "Update failed",
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-black text-secondary dark:text-white">
        {isAr
          ? "إدارة الطلبات"
          : isFr
            ? "Gestion des Commandes"
            : "Orders Management"}
      </h1>

      {/* Filters bar */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder={
              isAr
                ? "بحث برقم الطلب أو الاسم أو الهاتف..."
                : isFr
                  ? "Recherche par commande#, nom, téléphone..."
                  : "Search by order#, name, phone..."
            }
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input-field ps-9"
          />
        </div>
        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          className="input-field w-auto"
        >
          <option value="">
            {isAr ? "جميع الحالات" : isFr ? "Tous les Statuts" : "All Statuses"}
          </option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {isAr
                ? STATUS_LABEL_AR[s]
                : isFr
                  ? STATUS_LABEL_FR[s]
                  : s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button
          onClick={fetchOrders}
          className="btn-ghost px-3"
          title="Refresh"
        >
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
                  "#",
                  isAr ? "العميل" : isFr ? "Client" : "Customer",
                  isAr ? "الهاتف" : isFr ? "Téléphone" : "Phone",
                  isAr ? "الإجمالي" : isFr ? "Total" : "Total",
                  isAr ? "الحالة" : isFr ? "Statut" : "Status",
                  isAr ? "التاريخ" : isFr ? "Date" : "Date",
                  isAr ? "إجراء" : isFr ? "Actions" : "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-start px-4 py-3 text-xs font-semibold text-muted dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-muted dark:text-gray-400 text-sm"
                  >
                    {isAr
                      ? "لا توجد طلبات"
                      : isFr
                        ? "Aucune commande"
                        : "No orders found"}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-surface/60 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-dark dark:text-white">
                      #{order.id}
                    </td>
                    <td className="px-4 py-3 text-dark dark:text-gray-200 whitespace-nowrap">
                      {order.guest_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted dark:text-gray-400">
                      {order.guest_phone || "—"}
                    </td>
                    <td className="px-4 py-3 font-bold text-primary">
                      ${parseFloat(order.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_COLOR[order.status] || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}
                      >
                        {isAr
                          ? STATUS_LABEL_AR[order.status]
                          : isFr
                            ? STATUS_LABEL_FR[order.status]
                            : order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted dark:text-gray-400 text-xs whitespace-nowrap">
                      {order.created_at?.split("T")[0] ||
                        order.created_at?.split(" ")[0]}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEditModal(order)}
                        className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                      >
                        <ChevronDown size={14} />
                        {isAr
                          ? "تغيير الحالة"
                          : isFr
                            ? "Mettre à jour"
                            : "Update Status"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="px-4 py-3 border-t border-border dark:border-gray-700 flex items-center justify-between text-xs text-muted dark:text-gray-400">
            <span>
              {isAr
                ? `${meta.total} طلب`
                : isFr
                  ? `${meta.total} commandes`
                  : `${meta.total} orders`}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg font-semibold transition-colors
                    ${p === page ? "bg-primary text-white" : "text-muted dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                  >
                    {p}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {editOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-secondary dark:text-white">
                {isAr
                  ? `تحديث طلب #${editOrder.id}`
                  : isFr
                    ? `Mettre à jour la commande #${editOrder.id}`
                    : `Update Order #${editOrder.id}`}
              </h3>
              <button
                onClick={() => setEditOrder(null)}
                className="text-muted dark:text-gray-400 hover:text-dark dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-muted dark:text-gray-400 mb-3">
              {isAr
                ? `العميل: ${editOrder.guest_name || "—"}`
                : isFr
                  ? `Client: ${editOrder.guest_name || "—"}`
                  : `Customer: ${editOrder.guest_name || "—"}`}
            </p>

            <label className="block text-sm font-semibold text-dark dark:text-gray-200 mb-2">
              {isAr ? "الحالة الجديدة" : isFr ? "Nouveau Statut" : "New Status"}
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="input-field mb-4"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {isAr
                    ? STATUS_LABEL_AR[s]
                    : isFr
                      ? STATUS_LABEL_FR[s]
                      : s.replace(/_/g, " ")}
                </option>
              ))}
            </select>

            {updateSuccess && (
              <p className="text-green-600 text-sm font-medium mb-3">
                {updateSuccess}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="btn-primary flex-1 justify-center"
              >
                {updating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isAr ? (
                  "تحديث"
                ) : isFr ? (
                  "Mettre à jour"
                ) : (
                  "Update"
                )}
              </button>
              <button
                onClick={() => setEditOrder(null)}
                className="btn-ghost flex-1 justify-center"
              >
                {isAr ? "إلغاء" : isFr ? "Annuler" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
