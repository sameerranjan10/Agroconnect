/**
 * AgroConnect - API Service
 * Centralized Axios instance with JWT interceptors.
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── Request interceptor: attach JWT ──────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor: handle 401 globally ────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)  => api.post('/auth/register', data),
  login:    (data)  => api.post('/auth/login',    data),
}

// ── Users ─────────────────────────────────────────────────────────────────
export const usersAPI = {
  getMe:    ()     => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  getUser:  (id)   => api.get(`/users/${id}`),
}

// ── Products ──────────────────────────────────────────────────────────────
export const productsAPI = {
  list:     (params) => api.get('/products',         { params }),
  myList:   (params) => api.get('/products/my',      { params }),
  get:      (id)     => api.get(`/products/${id}`),
  create:   (data)   => api.post('/products',         data),
  update:   (id, d)  => api.put(`/products/${id}`,    d),
  delete:   (id)     => api.delete(`/products/${id}`),
}

// ── Orders ────────────────────────────────────────────────────────────────
export const ordersAPI = {
  place:         (data)      => api.post('/orders',            data),
  buyerOrders:   ()          => api.get('/orders/buyer'),
  farmerOrders:  ()          => api.get('/orders/farmer'),
  get:           (id)        => api.get(`/orders/${id}`),
  updateStatus:  (id, status)=> api.put(`/orders/${id}/status`, { status }),
}

// ── AI ────────────────────────────────────────────────────────────────────
export const aiAPI = {
  recommendCrop: (data) => api.post('/ai/recommend-crop', data),
  predictPrice:  (data) => api.post('/ai/predict-price',  data),
  health:        ()     => api.get('/ai/health'),
}

export default api
