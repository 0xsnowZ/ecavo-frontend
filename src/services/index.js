import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.post('/auth/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
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

export const recentlyViewedService = {
  /**
   * Fetch products for recently-viewed IDs.
   * Pass an array of IDs for guest mode, omit for auth mode.
   */
  get: (ids = []) => {
    if (ids.length === 0) return api.get('/recently-viewed');
    return api.get('/recently-viewed', { params: { ids: ids.join(',') } });
  },
  /** Record a view for the logged-in user (fire-and-forget). */
  track: (productId) => api.post(`/recently-viewed/${productId}`),
};

export const adminService = {
  stats: () => api.get('/admin/dashboard/stats'),

  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/admin/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteImage: (path) => api.delete('/admin/upload/image', { data: { path } }),

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
