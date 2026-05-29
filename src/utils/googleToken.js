import { getPrimaryAllowedDomain } from './auth'

let tokenClient = null

/** Request a fresh Google access token (silent when possible). */
export function requestGoogleAccessToken({ prompt = '' } = {}) {
  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      reject(new Error('Google Client ID not configured'))
      return
    }
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Sign-In not loaded'))
      return
    }

    if (!tokenClient) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        hd: getPrimaryAllowedDomain(),
        scope:
          'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: (response) => {
          if (response.error) {
            reject(new Error(response.error))
            return
          }
          resolve(response.access_token)
        }
      })
    }

    tokenClient.requestAccessToken({ prompt })
  })
}
