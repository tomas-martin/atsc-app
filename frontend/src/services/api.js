import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Interceptor de respuesta: manejo global de errores
api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.message || 'Error de conexión'
    if (err.response?.status === 401) {
      localStorage.removeItem('atsc_token')
      window.location.href = '/'
    } else if (err.response?.status >= 500) {
      toast.error('Error del servidor. Intentá de nuevo.')
    }
    return Promise.reject(err)
  }
)

export default api

// ── Servicios por módulo ────────────────────────────────────────────

export const authService = {
  login:  (data) => api.post('/auth/login', data),
  me:     ()     => api.get('/auth/me'),
  logout: ()     => api.post('/auth/logout'),
}

export const personaService = {
  getAll:    (params) => api.get('/personas', { params }),
  getById:   (id)     => api.get(`/personas/${id}`),
  create:    (data)   => api.post('/personas', data),
  update:    (id, data) => api.put(`/personas/${id}`, data),
  delete:    (id)     => api.delete(`/personas/${id}`),
  getCuotas: (id)     => api.get(`/personas/${id}/cuotas`),
}

export const partidoService = {
  getAll:    (params) => api.get('/partidos', { params }),
  getById:   (id)     => api.get(`/partidos/${id}`),
  create:    (data)   => api.post('/partidos', data),
  update:    (id, data) => api.put(`/partidos/${id}`, data),
  delete:    (id)     => api.delete(`/partidos/${id}`),
  getPlantel:(id)     => api.get(`/partidos/${id}/plantel`),
  cerrar:    (id)     => api.post(`/partidos/${id}/cerrar`),
}

export const torneoService = {
  getAll:       (params) => api.get('/torneos', { params }),
  getById:      (id)     => api.get(`/torneos/${id}`),
  create:       (data)   => api.post('/torneos', data),
  update:       (id, data) => api.put(`/torneos/${id}`, data),
  getPosiciones:(id)     => api.get(`/torneos/${id}/posiciones`),
  getPartidos:  (id)     => api.get(`/torneos/${id}/partidos`),
}

export const categoriaService = {
  getAll:  (params) => api.get('/categorias', { params }),
  getById: (id)     => api.get(`/categorias/${id}`),
  create:  (data)   => api.post('/categorias', data),
  update:  (id, data) => api.put(`/categorias/${id}`, data),
}

export const asistenciaService = {
  getAll:  (params) => api.get('/asistencias', { params }),
  create:  (data)   => api.post('/asistencias', data),
  getResumen: (params) => api.get('/asistencias/resumen', { params }),
}

export const cuotaService = {
  getByPersona: (id)   => api.get(`/personas/${id}/cuotas`),
  registrar:    (data) => api.post('/cuotas', data),
  delete:       (id)   => api.delete(`/cuotas/${id}`),
}

export const estadisticaService = {
  goleadores:  (params) => api.get('/estadisticas/goleadores', { params }),
  historial:   (id)     => api.get(`/estadisticas/jugador/${id}`),
  resumenClub: ()       => api.get('/estadisticas/resumen'),
}
