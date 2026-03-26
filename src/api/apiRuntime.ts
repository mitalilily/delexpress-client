import axios from 'axios'

const RAW_API_BASE_URL = import.meta.env.VITE_API_URL
const DEFAULT_API_BASE_URL = 'https://delexpress-backend.onrender.com/api'
const DEFAULT_BACKEND_ORIGIN = DEFAULT_API_BASE_URL.replace(/\/api\/?$/, '')

const resolveApiBaseUrl = () => {
  const fallback = DEFAULT_API_BASE_URL.replace(/\/+$/, '')

  try {
    if (!RAW_API_BASE_URL) return fallback

    const candidate = new URL(RAW_API_BASE_URL, window.location.origin)
    const currentHost = window.location.hostname
    const isNetlifyHost = currentHost.endsWith('netlify.app')
    const pointsBackToFrontend = candidate.hostname === currentHost

    if (isNetlifyHost && pointsBackToFrontend) {
      return fallback
    }

    const normalized = candidate.href.replace(/\/+$/, '')
    if (normalized.endsWith('/api') || normalized.includes('/api/')) return normalized
    return `${normalized}/api`
  } catch {
    return fallback
  }
}

const resolveBackendOrigin = () => {
  try {
    if (!RAW_API_BASE_URL) return DEFAULT_BACKEND_ORIGIN

    const candidate = new URL(RAW_API_BASE_URL, window.location.origin)
    if (candidate.origin === window.location.origin) return DEFAULT_BACKEND_ORIGIN
    return candidate.origin.replace(/\/+$/, '')
  } catch {
    return DEFAULT_BACKEND_ORIGIN
  }
}

export const API_BASE_URL = resolveApiBaseUrl()
export const BACKEND_HEALTH_URL = `${resolveBackendOrigin()}/health`

type ApiErrorLike = {
  response?: { data?: Record<string, unknown> }
  code?: string
  message?: string
}

export const isNetworkLikeApiError = (err: ApiErrorLike | unknown) => {
  const error = err as ApiErrorLike
  if (error?.response) return false

  const code = String(error?.code || '').toUpperCase()
  const message = String(error?.message || '').toLowerCase()

  return (
    code === 'ERR_NETWORK' ||
    code === 'ECONNABORTED' ||
    message.includes('network error') ||
    message.includes('timeout') ||
    message.includes('socket hang up')
  )
}

export const getApiConnectionHelpText = () =>
  `Cannot reach API (${API_BASE_URL}). The backend may be waking up on Render. Please wait 20-60 seconds and try again.`

export const getApiErrorMessage = (err: ApiErrorLike | unknown, fallback: string) => {
  const error = err as ApiErrorLike
  const data = error?.response?.data
  const fromData =
    (typeof data?.error === 'string' && data.error) ||
    (typeof data?.message === 'string' && data.message) ||
    (typeof data?.msg === 'string' && data.msg) ||
    ''

  const message = fromData || error?.message || fallback
  return isNetworkLikeApiError(error) ? getApiConnectionHelpText() : message
}

let wakeBackendPromise: Promise<void> | null = null

export const wakeBackendIfNeeded = async () => {
  if (wakeBackendPromise) return wakeBackendPromise

  wakeBackendPromise = axios
    .get(BACKEND_HEALTH_URL, {
      timeout: 45000,
      validateStatus: (status) => status >= 200 && status < 500,
    })
    .then(() => undefined)
    .catch(() => undefined)
    .finally(() => {
      wakeBackendPromise = null
    })

  return wakeBackendPromise
}
