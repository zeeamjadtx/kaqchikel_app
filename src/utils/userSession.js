/** Register signed-in student on the server (so they appear in the shared user list). */
export async function registerUserOnServer(accessToken) {
  if (!accessToken) return false

  try {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

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
