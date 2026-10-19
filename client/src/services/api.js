import axios from 'axios'

const TOKEN_KEY = 'imovies_token'

// Storage can be blocked (private windows, strict settings), so never let it crash the app.
export const tokenStore = {
  get() {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
  },
  set(token) {
    try { localStorage.setItem(TOKEN_KEY, token) } catch { /* ignore */ }
  },
  clear() {
    try { localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ }
  },
}

// One axios instance for the whole app. In development "/api" is proxied to Express (see vite.config.js).
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

// Attach the login token to every request.
api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Turns any failed request into a sentence the user can act on.
export function errorMessage(err) {
  if (err.response?.data?.message) return err.response.data.message
  if (err.request) return 'Cannot reach the server. Check that it is running and try again.'
  return 'Something went wrong. Try again.'
}

export default api
