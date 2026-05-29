import { useState, useEffect, useRef } from 'react'
import { addStitch, getStitchPattern } from '../utils/weavingProgress'
import { getUser } from '../utils/auth'
import { getAnimalCelebration } from '../utils/animalCelebration'
import AnimalCelebration from './AnimalCelebration'

const CELEBRATION_MS = 3200

function FlashcardView({ vocabulary, onBack, user, deckTitle }) {
  const currentUser = user || getUser()
  const userId = currentUser ? currentUser.id : null
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [shuffledVocabulary, setShuffledVocabulary] = useState([])
  const [studiedCards, setStudiedCards] = useState(new Set())
  const [showStitchNotification, setShowStitchNotification] = useState(false)
  const [lastStitchPattern, setLastStitchPattern] = useState(null)
  const [stitchAddedForSet, setStitchAddedForSet] = useState(false)
  const [celebrationAnimal, setCelebrationAnimal] = useState(null)
  const celebrationTimeoutRef = useRef(null)

  const showAnimalCelebration = (term) => {
    const animal = getAnimalCelebration(term)
    if (!animal) return
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current)
    }
    setCelebrationAnimal(animal)
    celebrationTimeoutRef.current = window.setTimeout(() => {
      setCelebrationAnimal(null)
      celebrationTimeoutRef.current = null
    }, CELEBRATION_MS)
  }

  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Shuffle the vocabulary array
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5)
    setShuffledVocabulary(shuffled)
  }, [vocabulary])

  const currentCard = shuffledVocabulary[currentIndex]

  const handleNext = () => {
    if (currentIndex < shuffledVocabulary.length - 1) {
      // Mark current card as studied if they've seen the definition
      const newStudiedCards = new Set([...studiedCards])
      if (isFlipped) {
        newStudiedCards.add(currentIndex)
      }
      
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setStudiedCards(newStudiedCards)
      
      // Check if all cards have been studied
      const allCardsStudied = newStudiedCards.size === shuffledVocabulary.length
      
      // Add ONE stitch only when all cards in the set have been visited
      if (allCardsStudied && !stitchAddedForSet) {
        const progress = addStitch(userId)
        const newStitchIndex = progress.totalStitches - 1
        const pattern = getStitchPattern(newStitchIndex)
        setLastStitchPattern(pattern)
        setShowStitchNotification(true)
        setTimeout(() => setShowStitchNotification(false), 3000)
        setStitchAddedForSet(true)
      }
    } else {
      // On the last card, check if all have been studied
      const newStudiedCards = new Set([...studiedCards])
      if (isFlipped) {
        newStudiedCards.add(currentIndex)
      }
      setStudiedCards(newStudiedCards)
      
      const allCardsStudied = newStudiedCards.size === shuffledVocabulary.length
      
      // Add ONE stitch only when all cards in the set have been visited
      if (allCardsStudied && !stitchAddedForSet) {
        const progress = addStitch(userId)
        const newStitchIndex = progress.totalStitches - 1
        const pattern = getStitchPattern(newStitchIndex)
        setLastStitchPattern(pattern)
        setShowStitchNotification(true)
        setTimeout(() => setShowStitchNotification(false), 3000)
        setStitchAddedForSet(true)
      }
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleFlip = () => {
    const card = shuffledVocabulary[currentIndex]
    setIsFlipped(!isFlipped)

    if (!isFlipped && card?.term) {
      showAnimalCelebration(card.term)
    }

    // When flipping to see definition, mark card as studied
    if (!isFlipped && !studiedCards.has(currentIndex)) {
      const newStudiedCards = new Set([...studiedCards, currentIndex])
      setStudiedCards(newStudiedCards)
      
      // Check if all cards have been studied after this flip
      const allCardsStudied = newStudiedCards.size === shuffledVocabulary.length
      
      // Add ONE stitch only when all cards in the set have been visited
      if (allCardsStudied && !stitchAddedForSet) {
        const progress = addStitch(userId)
        const newStitchIndex = progress.totalStitches - 1
        const pattern = getStitchPattern(newStitchIndex)
        setLastStitchPattern(pattern)
        setShowStitchNotification(true)
        setTimeout(() => setShowStitchNotification(false), 3000)
        setStitchAddedForSet(true)
      }
    }
  }

  const handleShuffle = () => {
    const shuffled = [...shuffledVocabulary].sort(() => Math.random() - 0.5)
    setShuffledVocabulary(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
    setStudiedCards(new Set())
    setStitchAddedForSet(false) // Reset so a new stitch can be added when all cards are studied again
  }

  if (shuffledVocabulary.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No hay vocabulario cargado</p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <AnimalCelebration visible={!!celebrationAnimal} animal={celebrationAnimal} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
          <div className="text-gray-600">
            Tarjeta {currentIndex + 1} de {shuffledVocabulary.length}
          </div>
        </div>

        {deckTitle && (
          <p className="text-center text-lg font-semibold text-gray-800 mb-4 truncate px-2" title={deckTitle}>
            {deckTitle}
          </p>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / shuffledVocabulary.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="mb-8">
          <div
            className="relative h-96 cursor-pointer perspective-1000"
            onClick={handleFlip}
          >
            <div
              className={`absolute inset-0 w-full h-full transition-transform duration-500 transform-style-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front of card */}
              <div
                className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-2xl shadow-2xl flex items-center justify-center p-8"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(0deg)'
                }}
              >
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-4 uppercase tracking-wide">Término</div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {currentCard?.term || 'Sin término'}
                  </h2>
                  <p className="text-gray-400 text-sm">Haz clic para voltear</p>
                </div>
              </div>

              {/* Back of card */}
              <div
                className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center p-8"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="text-center text-white">
                  <div className="text-sm text-blue-100 mb-4 uppercase tracking-wide">Definición</div>
                  <p className="text-2xl md:text-3xl font-semibold">
                    {currentCard?.definition || 'Sin definición'}
                  </p>
                  <p className="text-blue-100 text-sm mt-4">Haz clic para volver</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center px-6 py-3 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>

          <button
            onClick={handleFlip}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold"
          >
            {isFlipped ? 'Ver término' : 'Ver definición'}
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === shuffledVocabulary.length - 1}
            className="flex items-center px-6 py-3 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Shuffle Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleShuffle}
            className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center mx-auto"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Barajar tarjetas
          </button>
        </div>

        {/* Stitch Notification */}
        {showStitchNotification && lastStitchPattern && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-4 border-2 border-purple-300 animate-bounce z-50">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${lastStitchPattern.color} rounded`}></div>
              <div>
                <p className="font-semibold text-gray-900">¡Conjunto completado! ¡Se añadió una puntada!</p>
                <p className="text-sm text-gray-600">{lastStitchPattern.name}</p>
                <p className="text-xs text-gray-500 mt-1">Has estudiado todas las tarjetas de este conjunto</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FlashcardView
