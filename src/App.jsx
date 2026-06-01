import { useState, useEffect } from 'react'
import HomePage from './components/HomePage'
import FlashcardView from './components/FlashcardView'
import PracticeView from './components/PracticeView'
import LoginPage from './components/LoginPage'
import MatchingView from './components/MatchingView'
import { getUser, logout, isAllowedSchoolEmail } from './utils/auth'
import { migrateGuestVocabularyToUser } from './utils/vocabularyStorage'
import { registerUserOnServer } from './utils/userSession'

function App() {
  const [view, setView] = useState('home') // 'home', 'flashcards', 'practice', 'matching', 'login'
  const [vocabulary, setVocabulary] = useState([])
  const [activeDeck, setActiveDeck] = useState(null)
  const [previousView, setPreviousView] = useState('home')
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const currentUser = getUser()
    if (currentUser && !isAllowedSchoolEmail(currentUser.email)) {
      logout()
      setUser(null)
    } else {
      setUser(currentUser)
      if (currentUser?.email) {
        registerUserOnServer(currentUser.accessToken)
      }
    }
    setCheckingAuth(false)
  }, [])

  const handleSelectVocabulary = (payload) => {
    if (payload && Array.isArray(payload.vocabulary)) {
      setVocabulary(payload.vocabulary)
      setActiveDeck({ id: payload.id, name: payload.name })
    } else {
      setVocabulary(payload)
      setActiveDeck(null)
    }
    setPreviousView('practice')
    setView('flashcards')
  }

  const handleSelectVocabularyForMatching = (payload) => {
    if (payload && Array.isArray(payload.vocabulary)) {
      setVocabulary(payload.vocabulary)
      setActiveDeck({ id: payload.id, name: payload.name })
    } else {
      setVocabulary(payload)
      setActiveDeck(null)
    }
    setPreviousView('practice')
    setView('matching')
  }

  const handleBackFromFlashcards = () => {
    setView(previousView)
  }

  const handleBackToHome = () => {
    setView('home')
  }

  const handleGoToPractice = () => {
    setView('practice')
  }

  const handleLoginSuccess = (userData) => {
    if (userData?.id) {
      migrateGuestVocabularyToUser(String(userData.id))
    }
    setUser(userData)
    setView('home')
  }

  const handleGoToLogin = () => {
    setView('login')
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (view === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onBack={() => setView('home')} />
  }

  if (view === 'practice') {
    return (
      <PracticeView
        onSelectVocabulary={handleSelectVocabulary}
        onSelectMatching={handleSelectVocabularyForMatching}
        onBack={handleBackToHome}
        user={user}
      />
    )
  }

  if (view === 'flashcards') {
    return (
      <FlashcardView
        vocabulary={vocabulary}
        deckTitle={activeDeck?.name}
        onBack={handleBackFromFlashcards}
        user={user}
      />
    )
  }

  if (view === 'matching') {
    return (
      <MatchingView
        vocabulary={vocabulary}
        deckTitle={activeDeck?.name}
        onBack={handleBackFromFlashcards}
        user={user}
      />
    )
  }

  return (
    <HomePage
      onGoToPractice={handleGoToPractice}
      user={user}
      onLoginSuccess={handleLoginSuccess}
      onGoToLogin={handleGoToLogin}
    />
  )
}

export default App
