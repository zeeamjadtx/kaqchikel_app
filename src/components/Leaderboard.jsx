import { useEffect, useState, useCallback, useRef } from 'react'
import { fetchWeavingLeaderboard } from '../utils/weavingProgress'
import { ensureServerSession } from '../utils/userSession'

function Leaderboard({ user }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('ok')
  const hasLoadedRef = useRef(false)
  const refreshTimerRef = useRef(null)

  const loadLeaderboard = useCallback(async (showSpinner = false) => {
    if (!user?.email) {
      setEntries([])
      setLoading(false)
      return
    }

    if (showSpinner || !hasLoadedRef.current) {
      setLoading(true)
    }

    try {
      const result = await fetchWeavingLeaderboard(50)
      setEntries(result.entries)
      setStatus(result.status)
      hasLoadedRef.current = true
    } catch {
      setEntries([])
      setStatus('network_error')
    } finally {
      setLoading(false)
    }
  }, [user?.email, user?.id])

  useEffect(() => {
    hasLoadedRef.current = false

    const init = async () => {
      if (user?.email) {
        await ensureServerSession()
      }
      await loadLeaderboard(true)
    }

    init()

    const onUpdate = () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
      refreshTimerRef.current = setTimeout(() => {
        loadLeaderboard(false)
      }, 400)
    }

    window.addEventListener('kaqchikel-weaving-updated', onUpdate)
    return () => {
      window.removeEventListener('kaqchikel-weaving-updated', onUpdate)
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
    }
  }, [user?.email, user?.id, loadLeaderboard])

  if (loading && !hasLoadedRef.current) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[200px] flex flex-col justify-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Tabla de líderes
        </h3>
        <p className="text-center text-gray-500">Cargando…</p>
      </div>
    )
  }

  if (status === 'db_error') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[200px]">
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
      <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[200px]">
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

  if (status === 'network_error' && !entries.length) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[200px]">
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
    <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[200px]">
      <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
        Tabla de líderes
      </h3>
      <p className="text-center text-gray-500 mb-6">
        Puntajes de toda la escuela (solo cuentas con sesión iniciada).
      </p>
      {entries.length === 0 ? (
        <p className="text-center text-gray-500">
          Aún no hay puntajes. ¡Sé el primero en practicar!
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={entry.user.id || index}
              className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 shrink-0 text-center font-bold text-gray-700">
                  {index + 1}
                </div>
                {entry.user.picture ? (
                  <img
                    src={entry.user.picture}
                    alt={entry.user.name || 'User'}
                    className="w-10 h-10 shrink-0 rounded-full border border-indigo-200"
                  />
                ) : (
                  <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
                    {(entry.user.name || 'I').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {entry.user.name || 'Estudiante'}
                  </p>
                  {entry.user.email && (
                    <p className="text-xs text-gray-500 truncate">{entry.user.email}</p>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-lg font-bold text-purple-700">
                  {entry.totalStitches}
                </p>
                <p className="text-xs text-gray-500">puntadas</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Leaderboard
