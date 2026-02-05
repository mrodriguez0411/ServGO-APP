"use client"

import { useEffect, useMemo, useState } from 'react'
import AdminShell from '../../components/AdminShell'
import AdminGuard from '../../components/AdminGuard'
import supabase from '../../lib/supabaseClient'

type Pago = {
  id: string
  turno_id: string
  monto: number | null
  metodo: 'mercadopago' | 'efectivo' | 'transferencia'
  estado: 'pendiente' | 'pagado' | 'fallido'
  fecha_pago: string
}

const estados: Array<Pago['estado'] | 'all'> = ['all','pendiente','pagado','fallido']
const metodos: Array<Pago['metodo'] | 'all'> = ['all','mercadopago','efectivo','transferencia']

export default function PagosPage() {
  const [rows, setRows] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estado, setEstado] = useState<typeof estados[number]>('all')
  const [metodo, setMetodo] = useState<typeof metodos[number]>('all')
  const [q, setQ] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    let query = supabase.from('pagos').select('*').order('fecha_pago', { ascending: false })
    if (estado !== 'all') query = query.eq('estado', estado)
    if (metodo !== 'all') query = query.eq('metodo', metodo)
    const { data, error } = await query
    if (error) setError(error.message)
    setRows((data || []) as any)
    setLoading(false)
  }

  useEffect(() => { load() }, [estado, metodo])

  const filtered = useMemo(() => {
    if (!q.trim()) return rows
    const s = q.toLowerCase()
    return rows.filter(r => r.id.toLowerCase().includes(s) || r.turno_id.toLowerCase().includes(s))
  }, [rows, q])

  const totalPagado = useMemo(() => {
    return filtered.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + (Number(p.monto) || 0), 0)
  }, [filtered])

  return (
    <AdminGuard>
      <AdminShell>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Pagos</h1>
          <div className="flex flex-wrap gap-2 items-center">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Buscar por id/turno" className="px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-sm" />
            <select value={estado} onChange={(e)=>setEstado(e.target.value as any)} className="px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-sm">
              {estados.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <select value={metodo} onChange={(e)=>setMetodo(e.target.value as any)} className="px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-sm">
              {metodos.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-4 text-sm text-slate-300">Total pagado (filtrado): <span className="font-semibold">$ {totalPagado.toFixed(2)}</span></div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50">
              <tr>
                <Th>Turno</Th>
                <Th>Monto</Th>
                <Th>Método</Th>
                <Th>Estado</Th>
                <Th>Fecha de pago</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-400">Cargando...</td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="p-4 text-center text-red-400">{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-400">Sin resultados</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-t border-slate-800">
                  <Td><code className="text-xs bg-slate-800 px-2 py-1 rounded">{p.turno_id}</code></Td>
                  <Td>{p.monto != null ? `$ ${p.monto.toFixed(2)}` : '—'}</Td>
                  <Td className="capitalize">{p.metodo}</Td>
                  <Td className="capitalize">{p.estado}</Td>
                  <Td>{new Date(p.fecha_pago).toLocaleString()}</Td>
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
