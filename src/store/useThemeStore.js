import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Admin-only theme store.
 * Dark mode is scoped to the admin layout wrapper div — never touches <html>.
 * The e-commerce storefront is completely unaffected.
 */
const useThemeStore = create(
  persist(
    (set) => ({
      dark: false,
      toggle() {
        set((s) => ({ dark: !s.dark }));
      },
    }),
    { name: 'ecavo-admin-theme' }
  )
);

export default useThemeStore;
