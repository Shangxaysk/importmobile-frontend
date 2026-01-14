import axios from 'axios';

// API URL: Vercel environment variable yoki lokal test uchun
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token qo‘shish (agar mavjud bo‘lsa)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});


// -------------------- PRODUCTS --------------------
export const getProducts = async () => {
  const { data } = await api.get('/api/products'); // ✅ Backend route bilan mos
  return data;
};

export const getProduct = async (id: string) => {
  const { data } = await api.get(`/api/products/${id}`);
  return data;
};

export const createProduct = async (productData: any) => {
  const { data } = await api.post('/api/products', productData);
  return data;
};

export const updateProduct = async (id: string, productData: any) => {
  const { data } = await api.put(`/api/products/${id}`, productData);
  return data;
};

export const deleteProduct = async (id: string) => {
  const { data } = await api.delete(`/api/products/${id}`);
  return data;
};


// -------------------- AUTH --------------------
export const register = async (phone: string, password: string) => {
  const { data } = await api.post('/api/auth/register', { phone, password });
  return data;
};

export const login = async (phone: string, password: string) => {
  const { data } = await api.post('/api/auth/login', { phone, password });
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/api/auth/me');
  return data;
};


// -------------------- CART (localStorage) --------------------
export const getCart = () => {
  if (typeof window === 'undefined') return [];
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
};

export const addToCart = (product: any) => {
  if (typeof window === 'undefined') return;
  const cart = getCart();
  const existingItem = cart.find((item: any) => item.productId === product._id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ productId: product._id, product, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  return cart;
};

export const removeFromCart = (productId: string) => {
  if (typeof window === 'undefined') return;
  const cart = getCart().filter((item: any) => item.productId !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  return cart;
};

export const updateCartItem = (productId: string, quantity: number) => {
  if (typeof window === 'undefined') return;
  const cart = getCart();
  const item = cart.find((item: any) => item.productId === productId);
  if (item) {
    item.quantity = quantity;
    if (item.quantity <= 0) {
      return removeFromCart(productId);
    }
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  return cart;
};

export const clearCart = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('cart');
};


// -------------------- ORDERS --------------------
export const createOrder = async (orderData: any) => {
  const { data } = await api.post('/api/orders', orderData);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await api.get('/api/orders/my');
  return data;
};


// -------------------- NEWS --------------------
export const getNews = async () => {
  const { data } = await api.get('/api/news');
  return data;
};

export const getNewsItem = async (id: string) => {
  const { data } = await api.get(`/api/news/${id}`);
  return data;
};


// -------------------- UPLOAD --------------------
export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('screenshot', file);

  const { data } = await api.post('/api/upload/payment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};


// -------------------- ADMIN --------------------
export const getAllOrders = async () => {
  const { data } = await api.get('/api/orders');
  return data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const { data } = await api.patch(`/api/orders/${orderId}/status`, { status });
  return data;
};

export const requestPassportData = async (orderId: string) => {
  const { data } = await api.post(`/api/admin/orders/${orderId}/request-passport`);
  return data;
};

export const addPassportData = async (orderId: string, passportData: string) => {
  const { data } = await api.patch(`/api/orders/${orderId}/passport`, { passportData });
  return data;
};


export default api;
