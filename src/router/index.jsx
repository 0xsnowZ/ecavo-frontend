import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import Spinner from '../components/ui/Spinner';

const withSuspense = (Component) => (
  <Suspense fallback={<div className="flex justify-center py-24"><Spinner size="lg" /></div>}>
    <Component />
  </Suspense>
);

// Customer pages
const HomePage = lazy(() => import('../pages/Home'));
const ProductsPage = lazy(() => import('../pages/Products'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetail'));
const CategoriesPage = lazy(() => import('../pages/Categories'));
const CartPage = lazy(() => import('../pages/Cart'));
const CheckoutPage = lazy(() => import('../pages/Checkout'));
const OrderConfirmPage = lazy(() => import('../pages/OrderConfirm'));
const OrderTrackPage = lazy(() => import('../pages/OrderTrack'));
const WishlistPage = lazy(() => import('../pages/Wishlist'));
const AccountPage = lazy(() => import('../pages/Account'));
const LoginPage = lazy(() => import('../pages/Login'));
const RegisterPage = lazy(() => import('../pages/Register'));

// Admin pages
const AdminDashboard = lazy(() => import('../features/admin/dashboard/DashboardPage'));
const AdminOrders = lazy(() => import('../features/admin/orders/OrdersPage'));
const AdminProducts = lazy(() => import('../features/admin/products/ProductsPage'));
const AdminCategories = lazy(() => import('../features/admin/categories/CategoriesPage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: withSuspense(HomePage) },
      { path: 'products', element: withSuspense(ProductsPage) },
      { path: 'products/:slug', element: withSuspense(ProductDetailPage) },
      { path: 'categories', element: withSuspense(CategoriesPage) },
      { path: 'categories/:slug', element: withSuspense(ProductsPage) },
      { path: 'cart', element: withSuspense(CartPage) },
      { path: 'checkout', element: withSuspense(CheckoutPage) },
      { path: 'order-confirm/:id', element: withSuspense(OrderConfirmPage) },
      { path: 'orders/:id/track', element: withSuspense(OrderTrackPage) },
      { path: 'wishlist', element: withSuspense(WishlistPage) },
      { path: 'account', element: withSuspense(AccountPage) },
      { path: 'login', element: withSuspense(LoginPage) },
      { path: 'register', element: withSuspense(RegisterPage) },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: withSuspense(AdminDashboard) },
      { path: 'orders', element: withSuspense(AdminOrders) },
      { path: 'products', element: withSuspense(AdminProducts) },
      { path: 'categories', element: withSuspense(AdminCategories) },
    ],
  },
]);

export default router;
