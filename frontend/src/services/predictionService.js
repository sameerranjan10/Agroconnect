import api from './api'

const predictionService = {
  predictCrop: async (soilData) => {
    const res = await api.post('/predictions/crop', soilData)
    return res.data
  },

  detectDisease: async (imageFile) => {
    const formData = new FormData()
    formData.append('file', imageFile)
    const res = await api.post('/predictions/disease', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  getHistory: async ({ type = null, page = 1, perPage = 10 } = {}) => {
    const params = { page, per_page: perPage }
    if (type) params.type = type
    const res = await api.get('/predictions/history', { params })
    return res.data
  },

  getDetail: async (id) => {
    const res = await api.get(`/predictions/${id}`)
    return res.data
  },
}

export default predictionService
