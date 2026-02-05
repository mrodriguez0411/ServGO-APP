"use client"

import { useEffect, useMemo, useState } from 'react'
import AdminShell from '../../components/AdminShell'
import AdminGuard from '../../components/AdminGuard'
import supabase from '../../lib/supabaseClient'

type Outbox = {
  id: string
  user_id: string
  channel: 'email' | 'whatsapp'
  template: string
  payload: any
  created_at: string
  processed_at: string | null
}

const channels: Array<Outbox['channel'] | 'all'> = ['all','email','whatsapp']
const states: Array<'all' | 'pending' | 'processed'> = ['all','pending','processed']

export default function OutboxPage() {
  const [rows, setRows] = useState<Outbox[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<typeof channels[number]>('all')
  const [state, setState] = useState<typeof states[number]>('pending')
  const [q, setQ] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    let query = supabase.from('notifications_outbox').select('*').order('created_at', { ascending: false })
    if (channel !== 'all') query = query.eq('channel', channel)
    if (state !== 'all') query = state === 'pending' ? query.is('processed_at', null) : query.not('processed_at', 'is', null)
    const { data, error } = await query
    if (error) setError(error.message)
    setRows((data || []) as any)
    setLoading(false)
  }

  useEffect(() => { load() }, [channel, state])

  const filtered = useMemo(() => {
    if (!q.trim()) return rows
    const s = q.toLowerCase()
    return rows.filter(r => r.id.toLowerCase().includes(s) || r.user_id.toLowerCase().includes(s) || r.template.toLowerCase().includes(s))
  }, [rows, q])

  const markProcessed = async (row: Outbox) => {
    const { error } = await supabase
      .from('notifications_outbox')
      .update({ processed_at: new Date().toISOString() })
      .eq('id', row.id)
    if (error) { alert(error.message); return }
    setRows(prev => prev.map(r => r.id === row.id ? { ...r, processed_at: new Date().toISOString() } : r))
  }

  return (
    <AdminGuard>
      <AdminShell>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Outbox</h1>
          <div className="flex flex-wrap gap-2 items-center">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Buscar por id/user/template" className="px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-sm" />
            <select value={channel} onChange={(e)=>setChannel(e.target.value as any)} className="px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-sm">
              {channels.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={state} onChange={(e)=>setState(e.target.value as any)} className="px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-sm">
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50">
              <tr>
                <Th>ID</Th>
                <Th>User</Th>
                <Th>Channel</Th>
                <Th>Template</Th>
                <Th>Payload</Th>
                <Th>Created</Th>
                <Th>Processed</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-4 text-center text-slate-400">Cargando...</td></tr>
              ) : error ? (
                <tr><td colSpan={8} className="p-4 text-center text-red-400">{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-4 text-center text-slate-400">Sin resultados</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="border-t border-slate-800">
                  <Td><code className="text-xs bg-slate-800 px-2 py-1 rounded">{r.id}</code></Td>
                  <Td><code className="text-xs bg-slate-800 px-2 py-1 rounded">{r.user_id}</code></Td>
                  <Td className="capitalize">{r.channel}</Td>
                  <Td>{r.template}</Td>
                  <Td><pre className="text-xs whitespace-pre-wrap max-w-xs">{JSON.stringify(r.payload, null, 2)}</pre></Td>
                  <Td>{new Date(r.created_at).toLocaleString()}</Td>
                  <Td>{r.processed_at ? new Date(r.processed_at).toLocaleString() : '—'}</Td>
                  <Td>
                    {!r.processed_at && (
                      <button onClick={()=>markProcessed(r)} className="px-2 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-700">Marcar procesado</button>
                    )}
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
