import { getUser, updateUserData, isAllowedSchoolEmail } from './auth'
import { requestGoogleAccessToken } from './googleToken'

async function fetchWithGoogleAuth(url, options = {}) {
  const user = getUser()
  if (!user?.email || !isAllowedSchoolEmail(user.email)) {
    return { res: null, token: null }
  }

  let token = user.accessToken
  if (!token) {
    try {
      token = await requestGoogleAccessToken({ prompt: '' })
      updateUserData({ accessToken: token })
    } catch {
      return { res: null, token: null }
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    Authorization: `Bearer ${token}`
  }

  let res = await fetch(url, { ...options, headers })

  if (res.status === 401) {
    try {
      token = await requestGoogleAccessToken({ prompt: '' })
      updateUserData({ accessToken: token })
      res = await fetch(url, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${token}` }
      })
    } catch (err) {
      console.warn('fetchWithGoogleAuth: token refresh failed', err)
    }
  }

  return { res, token }
}

/** Register signed-in student on the server (so they appear in the shared user list). */
export async function registerUserOnServer(accessToken) {
  if (!accessToken) {
    return ensureServerSession()
  }

  try {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (res.status === 401) {
      return ensureServerSession()
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.warn('registerUserOnServer:', err.error || res.status)
      return false
    }

    window.dispatchEvent(new CustomEvent('kaqchikel-weaving-updated'))
    return true
  } catch (error) {
    console.warn('registerUserOnServer:', error)
    return false
  }
}

/** Sync session to server with a fresh Google token if needed. */
export async function ensureServerSession() {
  const { res } = await fetchWithGoogleAuth('/api/auth/session', { method: 'POST' })
  if (!res) return false

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.warn('ensureServerSession:', err.error || res.status)
    return false
  }

  window.dispatchEvent(new CustomEvent('kaqchikel-weaving-updated'))
  return true
}

export { fetchWithGoogleAuth }
