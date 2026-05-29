import { useState, useEffect } from 'react'
import { fetchSharedVocabularySets } from '../utils/sharedVocabulary'
function PracticeView({ onSelectVocabulary, onSelectMatching, onBack }) {
  const [sharedSets, setSharedSets] = useState([])

  const refreshSharedSets = async () => {
    const list = await fetchSharedVocabularySets()
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    setSharedSets(list)
  }

  useEffect(() => {
    refreshSharedSets()
  }, [])

  const handlePractice = (set) => {
    onSelectVocabulary({ id: set.id, name: set.name, vocabulary: set.vocabulary })
  }

  const handleMatchingPractice = (set) => {
    if (onSelectMatching) {
      onSelectMatching({ id: set.id, name: set.name, vocabulary: set.vocabulary })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Conjuntos de práctica</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Los mazos <span className="font-semibold text-amber-800">compartidos</span> los publica el
            equipo en el servidor. Cualquier persona (con o sin cuenta) puede practicarlos.
          </p>
        </div>

        {sharedSets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No hay conjuntos disponibles</h3>
            <p className="text-gray-600 mb-6">
              Aún no hay mazos publicados. El administrador puede añadir archivos CSV en{' '}
              <code className="text-sm bg-gray-100 px-1 rounded">data/vocabulary/</code> del proyecto.
            </p>
            <button
              onClick={onBack}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        ) : (
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2 flex-wrap">
              Mazos compartidos
              <span className="text-sm font-semibold uppercase tracking-wide text-amber-800 bg-amber-100 px-2 py-1 rounded-md">
                Todos los usuarios
              </span>
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {sharedSets.map((set) => (
                <div
                  key={set.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 flex flex-col ring-2 ring-amber-200/80"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 break-words">{set.name}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {set.totalCards} tarjetas
                      </div>
                      {set.createdAt && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Publicado: {formatDate(set.createdAt)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => handlePractice(set)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-md"
                    >
                      Practicar con tarjetas
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMatchingPractice(set)}
                      className="w-full bg-white border border-purple-300 text-purple-700 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all transform hover:scale-105 shadow-md"
                    >
                      Juego de emparejar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default PracticeView
