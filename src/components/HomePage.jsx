import { useEffect, useRef, useState } from 'react'
import WeavingProgress from './WeavingProgress'
import Leaderboard from './Leaderboard'
import RegisteredStudents from './RegisteredStudents'
import AnimalCelebration from './AnimalCelebration'
import { getAnimalCelebration } from '../utils/animalCelebration'
import { logout } from '../utils/auth'

const CELEBRATION_PREVIEW_MS = 3200
const PREVIEW_ANIMAL = getAnimalCelebration('Köj')

function HomePage({ onGoToPractice, user, onLoginSuccess, onGoToLogin }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [celebrationPreview, setCelebrationPreview] = useState(null)
  const [celebrationPreviewKey, setCelebrationPreviewKey] = useState(0)
  const celebrationPreviewTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (celebrationPreviewTimeoutRef.current) {
        clearTimeout(celebrationPreviewTimeoutRef.current)
      }
    }
  }, [])

  const triggerCelebrationPreview = () => {
    if (!PREVIEW_ANIMAL) return
    if (celebrationPreviewTimeoutRef.current) {
      clearTimeout(celebrationPreviewTimeoutRef.current)
    }
    setCelebrationPreviewKey((k) => k + 1)
    setCelebrationPreview(PREVIEW_ANIMAL)
    celebrationPreviewTimeoutRef.current = window.setTimeout(() => {
      setCelebrationPreview(null)
      celebrationPreviewTimeoutRef.current = null
    }, CELEBRATION_PREVIEW_MS)
  }

  const handlePracticeClick = () => {
    if (onGoToPractice) {
      onGoToPractice()
    } else {
      console.error('onGoToPractice is not defined')
    }
  }

  const handleLogout = () => {
    logout()
    if (onLoginSuccess) {
      onLoginSuccess(null)
    }
    setShowUserMenu(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <AnimalCelebration
        key={celebrationPreviewKey}
        visible={!!celebrationPreview}
        animal={celebrationPreview}
      />
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Kaqchikel
              </h1>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#learn" className="text-gray-700 hover:text-blue-600 transition-colors">
                Aprender
              </a>
              <button 
                type="button"
                onClick={handlePracticeClick}
                className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Practicar
              </button>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {user.picture && (
                      <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                    )}
                    <span className="hidden lg:inline">{user.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onGoToLogin}
                  className="text-gray-700 hover:text-blue-600 transition-colors text-sm"
                >
                  Sign in
                </button>
              )}
            </div>
            <button
              className="md:hidden text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-4">
              <a href="#learn" className="block text-gray-700 hover:text-blue-600">Aprender</a>
              <button 
                type="button"
                onClick={handlePracticeClick}
                className="block w-full text-left text-gray-700 hover:text-blue-600 cursor-pointer"
              >
                Practicar
              </button>
              {user ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-3">
                    {user.picture && (
                      <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-sm text-red-600 hover:text-red-700"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    if (onGoToLogin) {
                      onGoToLogin()
                    }
                  }}
                  className="w-full text-left text-sm text-gray-700 hover:text-blue-600"
                >
                  Iniciar sesión con Google
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Aprende <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Kaqchikel</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Practica tu kaqchikel con lecciones interactivas y conjuntos de práctica.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handlePracticeClick}
              className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Ver conjuntos de práctica
            </button>
          </div>
        </div>
      </section>

      {/* Weaving Progress Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <WeavingProgress user={user} />
      </section>

      {/* Leaderboard Section — visible when signed in */}
      <section
        id="leaderboard"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        {user ? (
          <>
            <Leaderboard user={user} />
            <RegisteredStudents user={user} />
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Tabla de líderes
            </h3>
            <p className="text-gray-500 mb-6">
              Inicia sesión con tu cuenta <strong>@antiguais.org</strong> para ver los
              puntajes de toda la escuela.
            </p>
            {onGoToLogin && (
              <button
                type="button"
                onClick={onGoToLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          ¿Por qué aprender kaqchikel?
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Lecciones interactivas</h4>
            <p className="text-gray-600">
              Aprende con lecciones interactivas y atractivas diseñadas para ayudarte a dominar el kaqchikel paso a paso.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Pronunciación en audio</h4>
            <p className="text-gray-600">
              Escucha a hablantes nativos y practica tu pronunciación con nuestras funciones de audio.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Sigue tu progreso</h4>
            <p className="text-gray-600">
              Supervisa tu aprendizaje con un seguimiento detallado del progreso y logros.
            </p>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">Kaqchikel</h4>
              <p className="text-gray-400">
                Aprende el hermoso idioma kaqchikel y conéctate con la cultura maya.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Aprender</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Lecciones</a></li>
                <li><a href="#" className="hover:text-white">Vocabulario</a></li>
                <li><a href="#" className="hover:text-white">Gramática</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Práctica</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Ejercicios</a></li>
                <li><a href="#" className="hover:text-white">Cuestionarios</a></li>
                <li><a href="#" className="hover:text-white">Tarjetas</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 space-y-3">
            <p>&copy; 2024 Kaqchikel Language Learning. Todos los derechos reservados.</p>
            <button
              type="button"
              onClick={triggerCelebrationPreview}
              className="text-sm text-amber-400/90 hover:text-amber-300 underline-offset-2 hover:underline"
            >
              Ver animación de celebración (animales)
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
