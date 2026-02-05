"use client"

import { useEffect, useMemo, useState } from 'react'
import AdminShell from '../../components/AdminShell'
import AdminGuard from '../../components/AdminGuard'
import supabase from '../../lib/supabaseClient'

type Servicio = {
  id: string
  titulo: string
  descripcion: string | null
  precio: number | null
  activo: boolean
  profesional_id: string
  usuarios?: { nombre: string | null, email: string }
}

export default function ServiciosPage() {
  const [rows, setRows] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [only, setOnly] = useState<'all'|'active'|'inactive'>('all')

  const load = async () => {
    setLoading(true)
    setError(null)
    let query = supabase
      .from('servicios')
      .select('id,titulo,descripcion,precio,activo,profesional_id,usuarios!servicios_profesional_id_fkey(nombre,email)')
      .order('fecha_creacion', { ascending: false })
    if (only !== 'all') query = query.eq('activo', only === 'active')
    const { data, error } = await query
    if (error) setError(error.message)
    setRows((data || []) as any)
    setLoading(false)
  }

  useEffect(() => { load() }, [only])

  const filtered = useMemo(() => {
    if (!q.trim()) return rows
    const s = q.toLowerCase()
    return rows.filter(r => r.titulo.toLowerCase().includes(s) || (r.usuarios?.email||'').toLowerCase().includes(s))
  }, [rows, q])

  const toggleActivo = async (svc: Servicio) => {
    const { error } = await supabase
      .from('servicios')
      .update({ activo: !svc.activo })
      .eq('id', svc.id)
    if (error) {
      alert(error.message)
      return
    }
    setRows(prev => prev.map(r => r.id === svc.id ? { ...r, activo: !svc.activo } : r))
  }

  return (
    <AdminGuard>
      <AdminShell>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Servicios</h1>
          <div className="flex gap-2">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Buscar por título/email profesional" className="px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-sm" />
            <select value={only} onChange={(e)=>setOnly(e.target.value as any)} className="px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-sm">
              <option value="all">all</option>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50">
              <tr>
                <Th>Título</Th>
                <Th>Profesional</Th>
                <Th>Precio</Th>
                <Th>Activo</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-400">Cargando...</td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="p-4 text-center text-red-400">{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-400">Sin resultados</td></tr>
              ) : filtered.map(svc => (
                <tr key={svc.id} className="border-t border-slate-800">
                  <Td>
                    <div className="font-medium">{svc.titulo}</div>
                    <div className="text-xs text-slate-400 line-clamp-1 max-w-lg">{svc.descripcion}</div>
                  </Td>
                  <Td>
                    <div>{svc.usuarios?.nombre || '—'}</div>
                    <div className="text-xs text-slate-400">{svc.usuarios?.email}</div>
                  </Td>
                    <Td>{svc.precio != null ? `$ ${svc.precio.toFixed(2)}` : '—'}</Td>
                  <Td>{svc.activo ? 'Sí' : 'No'}</Td>
                  <Td>
                    <button onClick={()=>toggleActivo(svc)} className={`px-2 py-1 text-xs rounded ${svc.activo ? 'bg-slate-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                      {svc.activo ? 'Desactivar' : 'Activar'}
                    </button>
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

function Th({ children }: { children: React.ReactNode }) { return <th className="text-left p-3 font-medium text-slate-300">{children}</th> }
function Td({ children }: { children: React.ReactNode }) { return <td className="p-3 align-top">{children}</td> }
