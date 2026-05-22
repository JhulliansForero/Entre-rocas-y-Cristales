import api from './api'

export const getCabins       = (params)       => api.get('/cabins/', { params })
export const getCabin        = (id)            => api.get(`/cabins/${id}/`)
export const getAvailability = (id, params)   => api.get(`/cabins/${id}/availability/`, { params })
export const createCabin     = (data)          => api.post('/cabins/', data)
export const updateCabin     = (id, data)      => api.patch(`/cabins/${id}/`, data)
export const deleteCabin     = (id)            => api.delete(`/cabins/${id}/`)

// ── Admin photo management ─────────────────────────────────────
export const uploadCover   = (id, file) => {
  const fd = new FormData()
  fd.append('cover', file)
  return api.post(`/cabins/${id}/upload_cover/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const removeCover   = (id)              => api.delete(`/cabins/${id}/remove_cover/`)
export const addGalleryImg = (id, file, caption = '', order = 0) => {
  const fd = new FormData()
  fd.append('image', file)
  fd.append('caption', caption)
  fd.append('order', order)
  return api.post(`/cabins/${id}/add_image/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const deleteGalleryImg = (imageId) => api.delete(`/cabins/images/${imageId}/`)

// ── Hero images ────────────────────────────────────────────────
export const getHeroImages    = ()         => api.get('/cabins/hero-images/')
export const uploadHeroImage  = (file, caption = '', order = 0) => {
  const fd = new FormData()
  fd.append('image', file)
  fd.append('caption', caption)
  fd.append('order', order)
  return api.post('/cabins/hero-images/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const updateHeroImage  = (id, data) => api.patch(`/cabins/hero-images/${id}/`, data)
export const deleteHeroImage  = (id)       => api.delete(`/cabins/hero-images/${id}/`)
