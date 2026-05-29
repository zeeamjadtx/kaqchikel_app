import { useEffect, useState } from 'react'
import { getWeavingLeaderboard } from '../utils/weavingProgress'

function Leaderboard() {
  const [entries, setEntries] = useState([])

  useEffect(() => {
    const refresh = () => {
      const data = getWeavingLeaderboard()
      setEntries(data.slice(0, 5)) // top 5
    }

    refresh()
    window.addEventListener('storage', refresh)
    return () => window.removeEventListener('storage', refresh)
  }, [])

  if (!entries.length) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Tabla de líderes
        </h3>
        <p className="text-center text-gray-500">
          Aún no hay puntadas registradas. ¡Empieza a practicar para aparecer en la tabla!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
        Tabla de líderes
      </h3>
      <p className="text-center text-gray-500 mb-6">
        Personas con más puntadas tejidas en su manta.
      </p>
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div
            key={entry.user.id || index}
            className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 text-center font-bold text-gray-700">
                {index + 1}
              </div>
              {entry.user.picture ? (
                <img
                  src={entry.user.picture}
                  alt={entry.user.name || 'User'}
                  className="w-10 h-10 rounded-full border border-indigo-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
                  {(entry.user.name || 'I')
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {entry.user.name || 'Invitado'}
                </p>
                {entry.user.email && (
                  <p className="text-xs text-gray-500">{entry.user.email}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-purple-700">
                {entry.totalStitches}
              </p>
              <p className="text-xs text-gray-500">puntadas</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Leaderboard

