import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import Spinner from '../components/ui/Spinner';
import ProtectedRoute from '../components/common/ProtectedRoute';

const Fallback = () => (
  <div className="flex justify-center py-24"><Spinner size="lg" /></div>
);

const withSuspense = (Component) => (
  <Suspense fallback={<Fallback />}>
    <Component />
  </Suspense>
);

// Customer pages
const HomePage        = lazy(() => import('../pages/Home'));
const ProductsPage    = lazy(() => import('../pages/Products'));
const ProductDetail   = lazy(() => import('../pages/ProductDetail'));
const CategoriesPage  = lazy(() => import('../pages/Categories'));
const CartPage        = lazy(() => import('../pages/Cart'));
const CheckoutPage    = lazy(() => import('../pages/Checkout'));
const OrderConfirm    = lazy(() => import('../pages/OrderConfirm'));
const OrderTrack      = lazy(() => import('../pages/OrderTrack'));
const WishlistPage    = lazy(() => import('../pages/Wishlist'));
const AccountPage     = lazy(() => import('../pages/Account'));
const LoginPage       = lazy(() => import('../pages/Login'));
const RegisterPage    = lazy(() => import('../pages/Register'));

// Admin pages
const AdminDashboard  = lazy(() => import('../features/admin/dashboard/DashboardPage'));
const AdminOrders     = lazy(() => import('../features/admin/orders/OrdersPage'));
const AdminProducts   = lazy(() => import('../features/admin/products/ProductsPage'));
const AdminCategories = lazy(() => import('../features/admin/categories/CategoriesPage'));

const protect    = (el) => <ProtectedRoute>{el}</ProtectedRoute>;
const adminGuard = (el) => <ProtectedRoute adminOnly>{el}</ProtectedRoute>;

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true,                element: withSuspense(HomePage) },
      { path: 'products',           element: withSuspense(ProductsPage) },
      { path: 'products/:slug',     element: withSuspense(ProductDetail) },
      { path: 'categories',         element: withSuspense(CategoriesPage) },
      { path: 'categories/:slug',   element: withSuspense(ProductsPage) },
      { path: 'cart',               element: withSuspense(CartPage) },
      { path: 'login',              element: withSuspense(LoginPage) },
      { path: 'register',           element: withSuspense(RegisterPage) },
      // Protected customer routes
      { path: 'checkout',           element: protect(withSuspense(CheckoutPage)) },
      { path: 'order-confirm/:id',  element: protect(withSuspense(OrderConfirm)) },
      { path: 'orders/:id/track',   element: protect(withSuspense(OrderTrack)) },
      { path: 'wishlist',           element: protect(withSuspense(WishlistPage)) },
      { path: 'account',            element: protect(withSuspense(AccountPage)) },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true,      element: adminGuard(withSuspense(AdminDashboard)) },
      { path: 'orders',   element: adminGuard(withSuspense(AdminOrders)) },
      { path: 'products', element: adminGuard(withSuspense(AdminProducts)) },
      { path: 'categories', element: adminGuard(withSuspense(AdminCategories)) },
    ],
  },
]);

export default router;
