import api from './api'

export const register      = (data)    => api.post('/auth/register/', data)
export const login         = (data)    => api.post('/auth/login/', data)
export const logout        = (refresh) => api.post('/auth/logout/', { refresh })
export const getProfile    = ()        => api.get('/auth/profile/')
export const updateProfile = (data)    => api.patch('/auth/profile/', data)
