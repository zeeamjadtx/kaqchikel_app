import { useCallback, useEffect, useState } from 'react'
import { getUser } from '../utils/auth'
import { isAdminUser } from '../utils/admin'

function RegisteredStudents({ user }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const currentUser = user || getUser()
  const isAdmin = isAdminUser(currentUser)

  const load = useCallback(async () => {
    if (!isAdmin || !currentUser?.accessToken) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${currentUser.accessToken}` },
        cache: 'no-store'
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'No se pudo cargar la lista')
        setUsers([])
        return
      }
      setUsers(Array.isArray(data.users) ? data.users : [])
    } catch {
      setError('Error de conexión')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [isAdmin, currentUser?.accessToken])

  useEffect(() => {
    load()
    window.addEventListener('kaqchikel-weaving-updated', load)
    return () => window.removeEventListener('kaqchikel-weaving-updated', load)
  }, [load])

  if (!isAdmin) return null

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mt-8 border border-amber-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Estudiantes registrados
      </h3>
      <p className="text-center text-gray-500 mb-6 text-sm">
        Solo visible para administradores. Todos los que han iniciado sesión con Google de la escuela.
      </p>

      {loading && <p className="text-center text-gray-500">Cargando…</p>}
      {error && <p className="text-center text-red-600 text-sm">{error}</p>}

      {!loading && !error && users.length === 0 && (
        <p className="text-center text-gray-500">
          Nadie ha iniciado sesión en el servidor todavía. Los estudiantes deben usar
          Iniciar sesión (no solo modo invitado).
        </p>
      )}

      {!loading && users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">Correo</th>
                <th className="py-2 pr-4 text-right">Puntadas</th>
                <th className="py-2 text-right">Última actividad</th>
              </tr>
            </thead>
            <tbody>
              {users.map((entry) => (
                <tr key={entry.user.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-medium text-gray-900">
                    {entry.user.name || '—'}
                  </td>
                  <td className="py-2 pr-4 text-gray-600">{entry.user.email}</td>
                  <td className="py-2 pr-4 text-right text-purple-700 font-semibold">
                    {entry.totalStitches}
                  </td>
                  <td className="py-2 text-right text-gray-500 text-xs">
                    {entry.lastSeen
                      ? new Date(entry.lastSeen).toLocaleDateString('es-GT')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-center text-gray-400 text-xs mt-4">
            {users.length} estudiante{users.length === 1 ? '' : 's'}
          </p>
        </div>
      )}
    </div>
  )
}

export default RegisteredStudents
