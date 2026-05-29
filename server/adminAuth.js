export function getAdminEmails() {
  const fromEnv = process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  }
  return ['secondaryprincipal@antiguias.org']
}

export function isAdminEmail(email) {
  const normalized = (email || '').trim().toLowerCase()
  return getAdminEmails().includes(normalized)
}
