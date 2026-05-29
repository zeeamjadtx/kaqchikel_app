// Authentication utility functions

const DEFAULT_ALLOWED_DOMAINS = ['antiguais.org']

export const getAllowedEmailDomains = () => {
  const fromEnv = import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.split(',').map((d) => d.trim().toLowerCase()).filter(Boolean)
  }
  return DEFAULT_ALLOWED_DOMAINS
}

export const normalizeEmail = (email) => (email || '').trim().toLowerCase()

/** Only @antiguais.org (or VITE_ALLOWED_EMAIL_DOMAINS) may sign in. */
export const isAllowedSchoolEmail = (email) => {
  const normalized = normalizeEmail(email)
  const domain = normalized.split('@').pop()
  if (!domain) return false
  return getAllowedEmailDomains().includes(domain)
}

export const getPrimaryAllowedDomain = () => getAllowedEmailDomains()[0] || 'antiguais.org'

export const getUser = () => {
  try {
    const userData = localStorage.getItem('kaqchikel_user')
    if (userData) {
      return JSON.parse(userData)
    }
  } catch (error) {
    console.error('Error reading user data:', error)
  }
  return null
}

export const isAuthenticated = () => {
  const user = getUser()
  return user !== null && user.accessToken && isAllowedSchoolEmail(user.email)
}

export const logout = () => {
  localStorage.removeItem('kaqchikel_user')
  // Clear other user-specific data if needed
  // localStorage.removeItem('kaqchikel_saved_vocabulary')
  // localStorage.removeItem('kaqchikel_weaving_progress')
}

export const updateUserData = (updates) => {
  try {
    const user = getUser()
    if (user) {
      const updatedUser = { ...user, ...updates }
      localStorage.setItem('kaqchikel_user', JSON.stringify(updatedUser))
      return updatedUser
    }
  } catch (error) {
    console.error('Error updating user data:', error)
  }
  return null
}

export { isAdminUser, canManageVocabulary } from './admin'
