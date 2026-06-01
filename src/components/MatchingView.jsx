import { useEffect, useMemo, useRef, useState } from 'react'
import { addStitch, getStitchPattern } from '../utils/weavingProgress'
import { getUser } from '../utils/auth'
import { getAnimalCelebration } from '../utils/animalCelebration'
import AnimalCelebration from './AnimalCelebration'

const CELEBRATION_MS = 3200

function MatchingView({ vocabulary, onBack, user, deckTitle }) {
  const currentUser = user || getUser()
  const userId = currentUser ? currentUser.id : null

  const [pairs, setPairs] = useState([])
  const [selectedTermId, setSelectedTermId] = useState(null)
  const [matchedIds, setMatchedIds] = useState(new Set())
  const [mistakeMade, setMistakeMade] = useState(false)
  const [stitchAwarded, setStitchAwarded] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [showStitchNotification, setShowStitchNotification] = useState(false)
  const [lastStitchPattern, setLastStitchPattern] = useState(null)
  const [celebrationAnimal, setCelebrationAnimal] = useState(null)
  const celebrationTimeoutRef = useRef(null)

  const showAnimalCelebration = (animal) => {
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
    const validVocabulary = Array.isArray(vocabulary) ? vocabulary : []
    const initialPairs = validVocabulary.map((item, index) => ({
      id: index,
      term: item.term,
      definition: item.definition
    }))

    // Shuffle definitions separately
    const shuffledDefs = [...initialPairs].sort(() => Math.random() - 0.5)

    setPairs(
      initialPairs.map((p, i) => ({
        ...p,
        // Map each term to a definition in shuffled order
        shuffledDefinition: shuffledDefs[i].definition
      }))
    )
    setSelectedTermId(null)
    setMatchedIds(new Set())
    setMistakeMade(false)
    setStitchAwarded(false)
    setFeedback(null)
    setCelebrationAnimal(null)
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current)
      celebrationTimeoutRef.current = null
    }
  }, [vocabulary])

  const totalPairs = pairs.length

  const allMatchedCorrectly = useMemo(
    () => matchedIds.size === totalPairs && totalPairs > 0,
    [matchedIds, totalPairs]
  )

  useEffect(() => {
    if (allMatchedCorrectly && !mistakeMade && !stitchAwarded) {
      let cancelled = false
      ;(async () => {
        const progress = await addStitch(userId)
        if (cancelled) return
        const newStitchIndex = progress.totalStitches - 1
        const pattern = getStitchPattern(newStitchIndex)
        setLastStitchPattern(pattern)
        setShowStitchNotification(true)
        setStitchAwarded(true)
        setFeedback(
          '¡Perfecto! Emparejaste todos los términos correctamente. Has ganado un punto.'
        )
        setTimeout(() => setShowStitchNotification(false), 3000)
      })()
      return () => {
        cancelled = true
      }
    } else if (allMatchedCorrectly && mistakeMade && !stitchAwarded) {
      setFeedback(
        'Terminaste todos los emparejamientos, pero hubo errores en el camino. Intenta de nuevo sin errores para ganar un punto.'
      )
    }
  }, [allMatchedCorrectly, mistakeMade, stitchAwarded, userId])

  const handleSelectTerm = (id) => {
    if (matchedIds.has(id)) return
    setSelectedTermId(id)
    setFeedback(null)
  }

  const handleSelectDefinition = (definitionText) => {
    if (selectedTermId === null) return

    const termPair = pairs.find((p) => p.id === selectedTermId)
    if (!termPair) return

    if (termPair.definition === definitionText) {
      const newMatched = new Set(matchedIds)
      newMatched.add(termPair.id)
      setMatchedIds(newMatched)
      setSelectedTermId(null)
      setFeedback('¡Correcto! Sigue emparejando los términos.')

      const animal = getAnimalCelebration(termPair.term)
      showAnimalCelebration(animal)
    } else {
      setMistakeMade(true)
      setSelectedTermId(null)
      setFeedback('Ese emparejamiento no es correcto. Inténtalo de nuevo.')
    }
  }

  const handleReset = () => {
    const shuffledDefs = [...pairs].sort(() => Math.random() - 0.5)
    setPairs((prev) =>
      prev.map((p, i) => ({
        ...p,
        shuffledDefinition: shuffledDefs[i].definition
      }))
    )
    setSelectedTermId(null)
    setMatchedIds(new Set())
    setMistakeMade(false)
    setStitchAwarded(false)
    setFeedback(null)
    setCelebrationAnimal(null)
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current)
      celebrationTimeoutRef.current = null
    }
  }

  if (!vocabulary || vocabulary.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No hay vocabulario cargado para emparejar.</p>
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="text-right max-w-md">
            {deckTitle && (
              <p className="text-base font-semibold text-gray-900 mb-1 truncate" title={deckTitle}>
                {deckTitle}
              </p>
            )}
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              Juego de emparejar vocabulario
            </p>
            <p className="text-gray-700 text-sm">
              Empareja correctamente todos los términos y definiciones para ganar un punto.
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-4 mb-8">
          <p className="text-gray-700 text-sm">
            Selecciona primero un <span className="font-semibold">término</span> en la columna
            izquierda y luego la <span className="font-semibold">definición</span> correspondiente en
            la columna derecha. Si emparejas todos sin errores, ganarás una puntada (punto) en tu
            manta.
          </p>
        </div>

        {/* Matching grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Terms */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Términos</h3>
            <div className="space-y-2">
              {pairs.map((pair) => (
                <button
                  key={pair.id}
                  type="button"
                  onClick={() => handleSelectTerm(pair.id)}
                  disabled={matchedIds.has(pair.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    matchedIds.has(pair.id)
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : selectedTermId === pair.id
                      ? 'bg-blue-100 border-blue-400 text-blue-800 shadow-md'
                      : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {pair.term || '—'}
                </button>
              ))}
            </div>
          </div>

          {/* Definitions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Definiciones</h3>
            <div className="space-y-2">
              {pairs.map((pair, index) => (
                <button
                  key={`${pair.shuffledDefinition}-${index}`}
                  type="button"
                  onClick={() => handleSelectDefinition(pair.shuffledDefinition)}
                  className="w-full text-left px-4 py-3 rounded-lg border bg-white border-gray-200 text-gray-800 hover:bg-gray-50 transition-all"
                >
                  {pair.shuffledDefinition || '—'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback and controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {feedback && (
            <div
              className={`flex-1 text-sm px-4 py-3 rounded-lg ${
                allMatchedCorrectly && !mistakeMade
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              }`}
            >
              {feedback}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition-colors"
            >
              Reiniciar ejercicio
            </button>
          </div>
        </div>

        {/* Stitch Notification */}
        {showStitchNotification && lastStitchPattern && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-4 border-2 border-purple-300 animate-bounce z-50">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${lastStitchPattern.color} rounded`}></div>
              <div>
                <p className="font-semibold text-gray-900">
                  ¡Ejercicio perfecto! Has ganado una nueva puntada.
                </p>
                <p className="text-sm text-gray-600">{lastStitchPattern.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Emparejaste correctamente todos los términos de este conjunto.
                </p>
              </div>
            </div>
          </div>
        )}

        <AnimalCelebration visible={!!celebrationAnimal} animal={celebrationAnimal} />
      </div>
    </div>
  )
}

export default MatchingView

