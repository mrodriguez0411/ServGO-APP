'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AdminShell from '../../../../components/AdminShell'
import AdminGuard from '../../../../components/AdminGuard'
import supabase from '../../../../lib/supabaseClient'

type Usuario = {
  id: string
  nombre: string
  email: string
  telefono: string | null
  tipo: 'client' | 'provider'
  verification_status: 'pending' | 'in_review' | 'verified' | 'rejected' | 'banned'
  is_active: boolean
}

export default function EditarUsuarioPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('id')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usuario, setUsuario] = useState<Partial<Usuario>>({
    nombre: '',
    email: '',
    telefono: '',
    tipo: 'client',
    verification_status: 'pending',
    is_active: true
  })

  useEffect(() => {
    if (!userId) {
      setError('No se proporcionó un ID de usuario')
      setLoading(false)
      return
    }

    const cargarUsuario = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) throw error
        if (data) {
          setUsuario(data)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    cargarUsuario()
  }, [userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    
    setSaving(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre: usuario.nombre,
          telefono: usuario.telefono,
          tipo: usuario.tipo,
          verification_status: usuario.verification_status,
          is_active: usuario.is_active
        })
        .eq('id', userId)

      if (error) throw error
      
      // Redirect to users list
      window.location.href = '/usuarios'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setUsuario(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  if (loading) {
    return (
      <AdminGuard>
        <AdminShell>
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Cargando...</div>
          </div>
        </AdminShell>
      </AdminGuard>
    )
  }

  if (!userId) {
    return (
      <AdminGuard>
        <AdminShell>
          <div className="flex items-center justify-center h-64">
            <div className="text-red-400">Error: No se proporcionó un ID de usuario</div>
          </div>
        </AdminShell>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <AdminShell>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Editar Usuario</h1>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white bg-slate-800 rounded-md hover:bg-slate-700"
            >
              Volver
            </button>
          </div>

          {error && (
            <div className="p-4 mb-6 text-red-500 bg-red-500/10 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={usuario.nombre || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={usuario.email || ''}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white opacity-70 cursor-not-allowed"
                disabled
              />
              <p className="mt-1 text-xs text-slate-400">El email no se puede modificar</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={usuario.telefono || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Tipo de Usuario
              </label>
              <select
                name="tipo"
                value={usuario.tipo}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="client">Cliente</option>
                <option value="provider">Proveedor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Estado de Verificación
              </label>
              <select
                name="verification_status"
                value={usuario.verification_status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pendiente</option>
                <option value="in_review">En Revisión</option>
                <option value="verified">Verificado</option>
                <option value="rejected">Rechazado</option>
                <option value="banned">Baneado</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={usuario.is_active || false}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded border-slate-700 bg-slate-800 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-slate-300">
                Usuario Activo
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </AdminShell>
    </AdminGuard>
  )
}
