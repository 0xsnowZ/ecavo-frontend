import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const productsService = {
  list: (params) => api.get('/products', { params }),
  detail: (slug) => api.get(`/products/${slug}`),
  byCategory: (slug, params) => api.get(`/categories/${slug}/products`, { params }),
};

export const categoriesService = {
  all: () => api.get('/categories'),
  detail: (slug) => api.get(`/categories/${slug}`),
};

export const cartService = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  update: (itemId, data) => api.patch(`/cart/update/${itemId}`, data),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}`),
  applyCoupon: (code) => api.post('/cart/apply-coupon', { code }),
};

export const ordersService = {
  checkout: (data) => api.post('/orders/checkout', data),
  list: () => api.get('/orders'),
  detail: (id) => api.get(`/orders/${id}`),
  track: (id) => api.get(`/orders/${id}/track`),
};

export const wishlistService = {
  get: () => api.get('/wishlist'),
  toggle: (productId) => api.post(`/wishlist/toggle/${productId}`),
};

export const adminService = {
  stats: () => api.get('/admin/dashboard/stats'),
  orders: {
    list: (params) => api.get('/admin/orders', { params }),
    updateStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
    update: (id, data) => api.put(`/admin/orders/${id}`, data),
  },
  products: {
    list: (params) => api.get('/admin/products', { params }),
    create: (data) => api.post('/admin/products', data),
    update: (id, data) => api.put(`/admin/products/${id}`, data),
    delete: (id) => api.delete(`/admin/products/${id}`),
  },
  categories: {
    list: () => api.get('/admin/categories'),
    create: (data) => api.post('/admin/categories', data),
    update: (id, data) => api.put(`/admin/categories/${id}`, data),
    delete: (id) => api.delete(`/admin/categories/${id}`),
  },
};
