/** Reserved for future admin-only features (decks are managed via data/vocabulary/ on the server). */

export const normalizeEmail = (email) => (email || '').trim().toLowerCase()

const DEFAULT_ADMIN_EMAILS = ['secondaryprincipal@antiguias.org']

const parseAdminEmails = () => {
  const fromEnv = import.meta.env.VITE_ADMIN_EMAILS
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.split(',').map(normalizeEmail).filter(Boolean)
  }
  return DEFAULT_ADMIN_EMAILS.map(normalizeEmail)
}

const ADMIN_EMAILS = parseAdminEmails()

export const isAdminUser = (user) => {
  if (!user?.email) return false
  return ADMIN_EMAILS.includes(normalizeEmail(user.email))
}

export const canManageVocabulary = (user) => isAdminUser(user)
