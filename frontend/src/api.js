import axios from 'axios'

// All requests go to /api/... and Vite forwards them to Django.
const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Token expired or invalid: log out and go to login
    if (err.response?.status === 401 && localStorage.getItem('access')) {
      localStorage.removeItem('access')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

// Turns a Django error response into one readable sentence
export function errorText(err) {
  const data = err.response?.data
  if (!data) return 'Cannot reach the server. Is Django running?'
  if (typeof data === 'string') return 'Something went wrong on the server.'
  if (data.detail) return data.detail
  return Object.entries(data)
    .map(([field, msgs]) => `${field.replace('_', ' ')}: ${[].concat(msgs).join(' ')}`)
    .join('\n')
}

export default api
