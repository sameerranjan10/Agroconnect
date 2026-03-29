import api from './api'

const authService = {
  register: async (data) => {
    const res = await api.post('/auth/register', data)
    return res.data
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    return res.data
  },

  logout: async () => {
    await api.post('/auth/logout')
  },

  getProfile: async () => {
    const res = await api.get('/auth/profile')
    return res.data
  },

  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data)
    return res.data
  },

  refresh: async (refreshToken) => {
    const res = await api.post('/auth/refresh', null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    })
    return res.data
  },
}

export default authService
