import { useState, useEffect } from 'react'
import { getWeavingProgress, getStitchPattern } from '../utils/weavingProgress'
import { getUser } from '../utils/auth'

function WeavingProgress({ user }) {
  const currentUser = user || getUser()
  const userId = currentUser ? currentUser.id : null
  
  const [progress, setProgress] = useState(getWeavingProgress(userId))

  useEffect(() => {
    // Update progress when component mounts or when storage changes
    const updateProgress = () => {
      setProgress(getWeavingProgress(userId))
    }
    
    updateProgress()
    window.addEventListener('storage', updateProgress)
    window.addEventListener('kaqchikel-weaving-updated', updateProgress)

    return () => {
      window.removeEventListener('storage', updateProgress)
      window.removeEventListener('kaqchikel-weaving-updated', updateProgress)
    }
  }, [userId])

  // Calculate blanket dimensions (grid of stitches)
  const stitchesPerRow = 10
  const totalRows = Math.ceil(progress.totalStitches / stitchesPerRow)
  const maxStitchesToShow = 100 // Show up to 100 stitches visually

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-900 mb-2">
          Tu camino de tejido
        </h3>
        <p className="text-gray-600">
          Cada sesión de práctica con tarjetas añade una nueva puntada a tu manta
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-red-600 mb-1">
            {progress.totalStitches}
          </div>
          <div className="text-sm text-red-700 font-medium">Puntadas totales</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {totalRows}
          </div>
          <div className="text-sm text-blue-700 font-medium">Filas tejidas</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {Math.floor(progress.totalStitches / 10)}
          </div>
          <div className="text-sm text-purple-700 font-medium">Patrones</div>
        </div>
      </div>

      {/* Blanket Visualization */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Tu manta en crecimiento
        </h4>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border-4 border-amber-200">
          <div className="grid grid-cols-10 gap-1 max-w-2xl mx-auto">
            {Array.from({ length: Math.min(progress.totalStitches, maxStitchesToShow) }).map((_, index) => {
              const stitch = progress.stitches[index]
              const pattern = stitch ? getStitchPattern(index) : null
              return (
                <div
                  key={index}
                  className={`aspect-square rounded-sm ${pattern?.color || 'bg-gray-200'} transition-all duration-300 hover:scale-110 shadow-sm animate-fade-in`}
                  title={pattern?.name || 'Empty'}
                  style={{
                    animationDelay: `${index * 0.01}s`
                  }}
                />
              )
            })}
            {progress.totalStitches === 0 && (
              <div className="col-span-10 text-center text-gray-400 py-8">
                <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>¡Empieza a practicar con tarjetas para comenzar a tejer!</p>
              </div>
            )}
          </div>
        </div>
        {progress.totalStitches > maxStitchesToShow && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Mostrando las primeras {maxStitchesToShow} puntadas de un total de {progress.totalStitches}
          </p>
        )}
      </div>

      {/* Progress Message */}
      {progress.totalStitches > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 text-center">
          <p className="text-gray-700">
            <span className="font-semibold">¡Vas muy bien!</span> Has tejido{' '}
            <span className="font-bold text-blue-600">{progress.totalStitches}</span> puntada
            {progress.totalStitches !== 1 ? 's' : ''} en tu manta.
            {progress.totalStitches >= 50 && (
              <span className="block mt-2 text-purple-600 font-medium">
                🌟 ¡Estás creando un patrón hermoso!
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

export default WeavingProgress
