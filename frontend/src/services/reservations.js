import api from './api'

export const getReservations   = (params)  => api.get('/reservations/', { params })
export const getReservation    = (id)       => api.get(`/reservations/${id}/`)
export const createReservation = (data)     => api.post('/reservations/', data)
export const updateReservation = (id, data) => api.patch(`/reservations/${id}/`, data)
export const cancelReservation = (id)       => api.delete(`/reservations/${id}/`)

export const getAnalytics = (year) =>
  api.get('/reservations/analytics/', { params: year ? { year } : {} })

export const adminCreateReservation = (data) =>
  api.post('/reservations/admin-create/', data)
