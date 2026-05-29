import { useState, useEffect } from 'react'
import { isAdminUser, isAllowedSchoolEmail, getPrimaryAllowedDomain } from '../utils/auth'
import { registerUserOnServer } from '../utils/userSession'

function LoginPage({ onLoginSuccess, onBack }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [googleLoaded, setGoogleLoaded] = useState(false)

  useEffect(() => {
    // Check if Google API is already loaded
    if (window.google && window.google.accounts) {
      setGoogleLoaded(true)
      return
    }

    // Wait for Google API to load
    const checkGoogle = setInterval(() => {
      if (window.google && window.google.accounts) {
        setGoogleLoaded(true)
        clearInterval(checkGoogle)
      }
    }, 100)

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkGoogle)
      if (!googleLoaded) {
        setError('Google authentication is taking longer than expected. Please refresh the page.')
      }
    }, 5000)

    return () => clearInterval(checkGoogle)
  }, [googleLoaded])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError('')

    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      setError('El Google Client ID no est? configurado. Por favor, contacta a la persona administradora.')
      setIsLoading(false)
      return
    }

    try {
      // Initialize Google OAuth
      if (window.google && window.google.accounts) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          hd: getPrimaryAllowedDomain(),
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          callback: async (response) => {
            if (response.error) {
              setError('Authentication failed. Please try again.')
              setIsLoading(false)
              return
            }

            try {
              // Get user profile
              const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                  Authorization: `Bearer ${response.access_token}`
                }
              })
              
              if (!profileResponse.ok) {
                throw new Error('Failed to fetch user profile')
              }
              
              const profile = await profileResponse.json()

              if (!isAllowedSchoolEmail(profile.email)) {
                setError(
                  `Solo las cuentas de Google con correo @${getPrimaryAllowedDomain()} pueden iniciar sesión.`
                )
                setIsLoading(false)
                return
              }

              const userData = {
                id: profile.id,
                email: profile.email,
                name: profile.name,
                picture: profile.picture,
                accessToken: response.access_token,
                loginTime: new Date().toISOString(),
                isAdmin: isAdminUser({ email: profile.email })
              }

              localStorage.setItem('kaqchikel_user', JSON.stringify(userData))
              await registerUserOnServer(response.access_token)
              onLoginSuccess(userData)
            } catch (err) {
              console.error('Error fetching user data:', err)
              setError('Failed to load your profile. Please try again.')
              setIsLoading(false)
            }
          }
        })
        
        client.requestAccessToken()
      } else {
        setError('La autenticaci?n de Google no est? disponible. Por favor, actualiza la p?gina.')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Ocurri? un error durante el inicio de sesi?n. Por favor, int?ntalo de nuevo.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center text-gray-700 hover:text-blue-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </button>
        )}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Aprendizaje de Kaqchikel
            </h1>
            <p className="text-gray-600">
              Inicia sesión con tu cuenta de Google de Antigua International School (
              @{getPrimaryAllowedDomain()}) para guardar tu progreso.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Iniciando sesi?n...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Iniciar sesi?n con Google</span>
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Solo estudiantes y personal con correo @{getPrimaryAllowedDomain()} pueden iniciar sesión.
              Puedes practicar sin cuenta desde la página principal.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => onLoginSuccess(null)}
              className="w-full text-gray-600 hover:text-gray-800 text-sm transition-colors"
            >
              Continuar sin iniciar sesi?n
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
