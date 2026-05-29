const DEFAULT_ALLOWED_DOMAINS = ['antiguais.org']

export function getAllowedEmailDomains() {
  const fromEnv = process.env.ALLOWED_EMAIL_DOMAINS || process.env.VITE_ALLOWED_EMAIL_DOMAINS
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.split(',').map((d) => d.trim().toLowerCase()).filter(Boolean)
  }
  return DEFAULT_ALLOWED_DOMAINS
}

export function isAllowedSchoolEmail(email) {
  const normalized = (email || '').trim().toLowerCase()
  const domain = normalized.split('@').pop()
  if (!domain) return false
  return getAllowedEmailDomains().includes(domain)
}

/** Verify Google OAuth access token and return profile if @antiguais.org (etc.). */
export async function verifyGoogleAccessToken(accessToken) {
  if (!accessToken || typeof accessToken !== 'string') {
    return null
  }

  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken.trim()}` }
  })

  if (!res.ok) {
    return null
  }

  const profile = await res.json()
  if (!profile?.id || !profile?.email || !isAllowedSchoolEmail(profile.email)) {
    return null
  }

  return {
    id: String(profile.id),
    email: profile.email.trim().toLowerCase(),
    name: profile.name || profile.email,
    picture: profile.picture || null
  }
}

export function getBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization
  if (!header || typeof header !== 'string') return null
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : null
}
