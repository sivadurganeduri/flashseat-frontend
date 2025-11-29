import axios from 'axios'

const API_BASE = 'https://flashseat-backend-2.onrender.com/api'  // FIXED: Your live backend

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// FIXED: Handle 401/403 (expired/malformed token) – relogin
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('Token invalid – relogging in...')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Helper functions
export const login = (credentials) => api.post('/auth/login', credentials)
export const getMyBookings = () => api.get('/bookings/my')
export const getScheduleSeats = (scheduleId) => api.get(`/schedules/${scheduleId}/seats`)
export const bookSeat = (bookingData) => api.post('/bookings', bookingData)