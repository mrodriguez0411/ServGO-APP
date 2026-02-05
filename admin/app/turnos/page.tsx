"use client"

import { useEffect, useMemo, useState } from 'react'
import AdminShell from '../../components/AdminShell'
import AdminGuard from '../../components/AdminGuard'
import supabase from '../../lib/supabaseClient'

type Turno = {
  id: string
  servicio_id: string
  cliente_id: string
  fecha: string
  hora: string
  estado: 'pendiente' | 'aceptado' | 'completado' | 'cancelado'
  observaciones: string | null
}

const estados: Array<Turno['estado'] | 'all'> = ['all','pendiente','aceptado','completado','cancelado']

export default function TurnosPage() {
  const [rows, setRows] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estado, setEstado] = useState<typeof estados[number]>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [q, setQ] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    let query = supabase.from('turnos').select('*').order('fecha', { ascending: false }).order('hora', { ascending: false })
    if (estado !== 'all') query = query.eq('estado', estado)
    if (from) query = query.gte('fecha', from)
    if (to) query = query.lte('fecha', to)
    const { data, error } = await query
    if (error) setError(error.message)
    setRows((data || []) as any)
    setLoading(false)
  }

  useEffect(() => { load() }, [estado, from, to])

  const filtered = useMemo(() => {
    if (!q.trim()) return rows
    const s = q.toLowerCase()
    return rows.filter(r => r.id.toLowerCase().includes(s) || r.servicio_id.toLowerCase().includes(s) || r.cliente_id.toLowerCase().includes(s))
  }, [rows, q])

  return (
    <AdminGuard>
      <AdminShell>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Turnos</h1>
          <div className="flex flex-wrap gap-2 items-center">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Buscar por id/servicio/cliente" className="px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-sm" />
            <select value={estado} onChange={(e)=>setEstado(e.target.value as any)} className="px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-sm">
              {estados.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} className="px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-sm" />
            <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} className="px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-sm" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50">
              <tr>
                <Th>Servicio</Th>
                <Th>Cliente</Th>
                <Th>Fecha</Th>
                <Th>Hora</Th>
                <Th>Estado</Th>
                <Th>Obs.</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center text-slate-400">Cargando...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="p-4 text-center text-red-400">{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-slate-400">Sin resultados</td></tr>
              ) : filtered.map(t => (
                <tr key={t.id} className="border-t border-slate-800">
                  <Td><code className="text-xs bg-slate-800 px-2 py-1 rounded">{t.servicio_id}</code></Td>
                  <Td><code className="text-xs bg-slate-800 px-2 py-1 rounded">{t.cliente_id}</code></Td>
                  <Td>{t.fecha}</Td>
                  <Td>{t.hora}</Td>
                  <Td className="capitalize">{t.estado}</Td>
                  <Td><span className="line-clamp-1 max-w-lg inline-block align-top">{t.observaciones || '—'}</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminShell>
    </AdminGuard>
  )
}

function Th({ children, className }: { children: React.ReactNode, className?: string }) { return <th className={`text-left p-3 font-medium text-slate-300 ${className||''}`}>{children}</th> }
function Td({ children, className }: { children: React.ReactNode, className?: string }) { return <td className={`p-3 align-top ${className||''}`}>{children}</td> }
