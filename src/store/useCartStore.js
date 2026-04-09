import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      deliveryFee: 5.99,

      addItem: (product, qty = 1, variant = null) => {
        const { items } = get();
        const key = `${product.id}-${variant?.id || 'default'}`;
        const existing = items.find((i) => i.key === key);

        if (existing) {
          set({
            items: items.map((i) =>
              i.key === key ? { ...i, qty: i.qty + qty } : i
            ),
          });
        } else {
          set({
            items: [...items, { key, product, qty, variant }],
          });
        }
      },

      removeItem: (key) => {
        set({ items: get().items.filter((i) => i.key !== key) });
      },

      updateQty: (key, qty) => {
        if (qty < 1) {
          get().removeItem(key);
          return;
        }
        set({
          items: get().items.map((i) => (i.key === key ? { ...i, qty } : i)),
        });
      },

      clearCart: () => set({ items: [], coupon: null }),

      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),

      // Computed
      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const price = item.product.discountPrice ?? item.product.price;
          return sum + price * item.qty;
        }, 0);
      },

      getDiscount: () => {
        const { coupon } = get();
        if (!coupon) return 0;
        const subtotal = get().getSubtotal();
        if (coupon.type === 'percent') return (subtotal * coupon.value) / 100;
        return coupon.value;
      },

      getTotal: () => {
        return (
          get().getSubtotal() - get().getDiscount() + get().deliveryFee
        );
      },

      getCount: () => {
        return get().items.reduce((sum, item) => sum + item.qty, 0);
      },
    }),
    {
      name: 'ecavo-cart',
    }
  )
);
