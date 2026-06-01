import { useEffect, useState, useCallback } from 'react'
import { fetchWeavingLeaderboard } from '../utils/weavingProgress'
import { ensureServerSession } from '../utils/userSession'

function Leaderboard({ user }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('ok')

  const refresh = useCallback(async () => {
    if (!user?.email) {
      setEntries([])
      setLoading(false)
      return
    }

    setLoading(true)
    await ensureServerSession()
    try {
      const result = await fetchWeavingLeaderboard(50)
      setEntries(result.entries)
      setStatus(result.status)
    } catch {
      setEntries([])
      setStatus('network_error')
    } finally {
      setLoading(false)
    }
  }, [user?.email, user?.id])

  useEffect(() => {
    refresh()
    window.addEventListener('kaqchikel-weaving-updated', refresh)
    return () => window.removeEventListener('kaqchikel-weaving-updated', refresh)
  }, [refresh])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Tabla de líderes
        </h3>
        <p className="text-center text-gray-500">Cargando…</p>
      </div>
    )
  }

  if (status === 'db_error') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Tabla de líderes
        </h3>
        <p className="text-center text-amber-700 text-sm">
          No se pudo conectar a la base de datos. En Vercel: Storage → Postgres →
          conectar el proyecto, y en Environment asegúrate de que{' '}
          <code>POSTGRES_URL</code> tenga la cadena de conexión. Luego redeploy.
        </p>
      </div>
    )
  }

  if (status === 'empty') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Tabla de líderes
        </h3>
        <p className="text-center text-gray-500">
          Aún no hay puntajes en la escuela. Practica y completa un mazo (tarjetas o
          emparejar sin errores) para ganar puntadas y aparecer aquí.
        </p>
      </div>
    )
  }

  if (!entries.length) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Tabla de líderes
        </h3>
        <p className="text-center text-gray-500">
          No se pudo cargar la tabla. Comprueba tu conexión e inténtalo de nuevo.
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
        Puntajes de toda la escuela (solo cuentas con sesión iniciada).
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
                  {entry.user.name || 'Estudiante'}
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
