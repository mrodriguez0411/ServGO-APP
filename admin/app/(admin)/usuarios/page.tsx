'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminShell from '../../components/AdminShell'
import AdminGuard from '../../components/AdminGuard'
import supabase from '../../lib/supabaseClient'

type Usuario = {
  id: string
  nombre: string
  email: string
  telefono: string | null
  tipo: 'client' | 'provider'
  verification_status: 'pending' | 'in_review' | 'verified' | 'rejected' | 'banned'
  is_active: boolean
}

const statusOptions: Array<Usuario['verification_status'] | 'all'> = ['all','pending','in_review','verified','rejected','banned']

export default function UsuariosPage() {
  const [rows, setRows] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<typeof statusOptions[number]>('pending')
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      let q = supabase.from('usuarios').select('*').order('fecha_creacion', { ascending: false })
      if (status !== 'all') q = q.eq('verification_status', status)
      const { data, error } = await q
      if (error) setError(error.message)
      setRows((data || []) as any)
      setLoading(false)
    }
    run()
  }, [status])

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const s = search.toLowerCase()
    return rows.filter(r => r.email.toLowerCase().includes(s) || (r.nombre||'').toLowerCase().includes(s))
  }, [rows, search])

  const approve = async (userId: string) => {
    const { data: s } = await supabase.auth.getSession()
    const reviewer = s?.session?.user?.id
    if (!reviewer) return
    const { error } = await supabase.rpc('approve_user', { p_user_id: userId, p_reviewer: reviewer })
    if (error) {
      alert(error.message)
      return
    }
    // refresh current filter
    const { data } = await supabase.from('usuarios').select('*').eq('id', userId).maybeSingle()
    if (data) setRows(prev => prev.map(r => r.id === userId ? (data as any) : r))
  }

  return (
    <AdminGuard>
      <AdminShell>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Usuarios</h1>
          <div className="flex gap-2">
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Buscar por nombre/email" className="px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-sm" />
            <select value={status} onChange={(e)=>setStatus(e.target.value as any)} className="px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-sm">
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50">
              <tr>
                <Th>Nombre</Th>
                <Th>Email</Th>
                <Th>Teléfono</Th>
                <Th>Tipo</Th>
                <Th>Estado</Th>
                <Th>Activo</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-4 text-center text-slate-400">Cargando...</td></tr>
              ) : error ? (
                <tr><td colSpan={7} className="p-4 text-center text-red-400">{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-4 text-center text-slate-400">Sin resultados</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="border-t border-slate-800">
                  <Td>{u.nombre || '—'}</Td>
                  <Td>{u.email}</Td>
                  <Td>{u.telefono || '—'}</Td>
                  <Td className="capitalize">{u.tipo}</Td>
                  <Td>
                    <span
                      className={
                        `px-2 py-1 rounded text-xs capitalize ` +
                        (u.verification_status === 'verified' ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800' :
                         u.verification_status === 'in_review' ? 'bg-amber-900/30 text-amber-300 border border-amber-800' :
                         u.verification_status === 'rejected' ? 'bg-red-900/30 text-red-300 border border-red-800' :
                         u.verification_status === 'banned' ? 'bg-red-950/60 text-red-300 border border-red-900' :
                         'bg-slate-800 text-slate-300 border border-slate-700')
                      }
                    >
                      {u.verification_status}
                    </span>
                  </Td>
                  <Td>{u.is_active ? 'Sí' : 'No'}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <Link 
                        href={`/admin/usuarios/edit/${u.id}`}
                        className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Editar
                      </Link>
                      {u.verification_status !== 'verified' && (
                        <button onClick={()=>approve(u.id)} className="px-2 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-700">Aprobar</button>
                      )}
                      <Link 
                        href={{ pathname: '/documentos', query: { userId: u.id } }} 
                        className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-white"
                      >
                        Ver docs
                      </Link>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminShell>
    </AdminGuard>
  )
}

function Th({ children, className }: { children: React.ReactNode, className?: string }) { 
  return <th className={`text-left p-3 font-medium text-slate-300 ${className||''}`}>{children}</th> 
}

function Td({ children, className }: { children: React.ReactNode, className?: string }) { 
  return <td className={`p-3 ${className||''}`}>{children}</td> 
}
