import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearRvIds } from '../utils/recentlyViewed';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      // Called after login, register, or /auth/me bootstrap
      setAuth: (user) => {
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        // Clear the recently-viewed list on logout
        clearRvIds();
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (data) => {
        set({ user: { ...get().user, ...data } });
      },

      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'ecavo-auth',
      // Only persist the user object — the actual auth token lives
      // in an HTTP-only cookie managed entirely by the browser.
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
