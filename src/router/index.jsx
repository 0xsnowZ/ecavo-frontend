/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import Spinner from '../components/ui/Spinner';
import HomePageSkeleton from '../components/ui/HomePageSkeleton';
import ProtectedRoute from '../components/common/ProtectedRoute';

const Fallback = () => (
  <div className="flex justify-center py-24"><Spinner size="lg" /></div>
);

const withSuspense = (Comp) => (
  <Suspense fallback={<Fallback />}>
    <Comp />
  </Suspense>
);

// Home gets a content-shaped skeleton so the page never shows a bare spinner
const withHomeSuspense = (Comp) => (
  <Suspense fallback={<HomePageSkeleton />}>
    <Comp />
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
const ForgotPassword  = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword   = lazy(() => import('../pages/ResetPassword'));

// Admin pages
const AdminDashboard  = lazy(() => import('../features/admin/dashboard/DashboardPage'));
const AdminOrders     = lazy(() => import('../features/admin/orders/OrdersPage'));
const AdminProducts   = lazy(() => import('../features/admin/products/ProductsPage'));
const AdminCategories = lazy(() => import('../features/admin/categories/CategoriesPage'));
const AdminCoupons    = lazy(() => import('../features/admin/coupons/CouponsPage'));
const AdminReviews    = lazy(() => import('../features/admin/reviews/ReviewsPage'));
const AdminBanners    = lazy(() => import('../features/admin/banners/BannersPage'));

const protect    = (el) => <ProtectedRoute>{el}</ProtectedRoute>;
const adminGuard = (el) => <ProtectedRoute adminOnly>{el}</ProtectedRoute>;

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true,                element: withHomeSuspense(HomePage) },
      { path: 'products',           element: withSuspense(ProductsPage) },
      { path: 'products/:slug',     element: withSuspense(ProductDetail) },
      { path: 'categories',         element: withSuspense(CategoriesPage) },
      { path: 'categories/:slug',   element: withSuspense(ProductsPage) },
      { path: 'cart',               element: withSuspense(CartPage) },
      { path: 'login',              element: withSuspense(LoginPage) },
      { path: 'register',           element: withSuspense(RegisterPage) },
      { path: 'forgot-password',    element: withSuspense(ForgotPassword) },
      { path: 'reset-password',     element: withSuspense(ResetPassword) },
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
      { index: true,        element: adminGuard(withSuspense(AdminDashboard)) },
      { path: 'orders',     element: adminGuard(withSuspense(AdminOrders)) },
      { path: 'products',   element: adminGuard(withSuspense(AdminProducts)) },
      { path: 'categories', element: adminGuard(withSuspense(AdminCategories)) },
      { path: 'coupons',    element: adminGuard(withSuspense(AdminCoupons)) },
      { path: 'reviews',    element: adminGuard(withSuspense(AdminReviews)) },
      { path: 'banners',    element: adminGuard(withSuspense(AdminBanners)) },
    ],
  },
]);

export default router;
