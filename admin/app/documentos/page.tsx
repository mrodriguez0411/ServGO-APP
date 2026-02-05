"use client"

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import AdminShell from '../../components/AdminShell'
import AdminGuard from '../../components/AdminGuard'
import supabase from '../../lib/supabaseClient'

type Documento = {
  id: string
  user_id: string
  tipo: 'id_front' | 'id_back' | 'selfie' | 'certification' | 'other'
  url: string
  estado: 'pending' | 'approved' | 'rejected'
  subido_en: string
  usuarios?: { nombre: string | null, email: string }
}

export default function DocumentosPage() {
  const [rows, setRows] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectDocTarget, setRejectDocTarget] = useState<Documento | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      let q = supabase
        .from('documentos')
        .select(`
          id,
          user_id,
          tipo,
          url,
          estado,
          subido_en,
          usuarios!documentos_user_id_fkey(nombre, email)
        `)
        .order('subido_en', { ascending: false })
      const userIdFromQuery = searchParams.get('userId')
      if (userIdFromQuery) q = q.eq('user_id', userIdFromQuery)
      if (filtro !== 'all') q = q.eq('estado', filtro)
      const { data, error } = await q
      if (error) setError(error.message)
      setRows((data || []) as any)
      setLoading(false)
    }
    run()
  }, [filtro, searchParams])

  const grouped = useMemo(() => {
    const map = new Map<string, Documento[]>()
    rows.forEach(d => {
      const list = map.get(d.user_id) || []
      list.push(d)
      map.set(d.user_id, list)
    })
    return map
  }, [rows])

  const refreshDoc = async (id: string) => {
    const { data } = await supabase
      .from('documentos')
      .select('id,user_id,tipo,url,estado,subido_en,usuarios(nombre,email)')
      .eq('id', id)
      .maybeSingle()
    if (!data) return
    setRows(prev => prev.map(r => (r.id === id ? (data as any) : r)))
  }

  const approveDoc = async (doc: Documento) => {
    const { data: s } = await supabase.auth.getSession()
    const reviewer = s?.session?.user?.id
    if (!reviewer) return
    const { error } = await supabase
      .from('documentos')
      .update({ estado: 'approved', revisado_por: reviewer, revisado_en: new Date().toISOString() })
      .eq('id', doc.id)
    if (error) {
      alert(error.message)
      return
    }
    await refreshDoc(doc.id)
  }

  const openReject = (doc: Documento) => {
    setRejectDocTarget(doc)
    setRejectReason('')
    setRejectOpen(true)
  }

  const confirmReject = async () => {
    if (!rejectDocTarget) return
    const motivo = rejectReason.trim()
    const { data: s } = await supabase.auth.getSession()
    const reviewer = s?.session?.user?.id
    if (!reviewer) return
    const { error } = await supabase
      .from('documentos')
      .update({ estado: 'rejected', rechazo_motivo: motivo, revisado_por: reviewer, revisado_en: new Date().toISOString() })
      .eq('id', rejectDocTarget.id)
    if (error) {
      alert(error.message)
      return
    }
    await refreshDoc(rejectDocTarget.id)
    setRejectOpen(false)
    setRejectDocTarget(null)
    setRejectReason('')
  }

  const approveUser = async (userId: string) => {
    const { data: s } = await supabase.auth.getSession()
    const reviewer = s?.session?.user?.id
    if (!reviewer) return
    const { error } = await supabase.rpc('approve_user', { p_user_id: userId, p_reviewer: reviewer })
    if (error) {
      alert(error.message)
      return
    }
    alert('Usuario aprobado y notificaciones encoladas')
  }

  return (
    <AdminGuard>
      <AdminShell>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Documentos</h1>
          <select value={filtro} onChange={(e)=>setFiltro(e.target.value as any)} className="px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-sm">
            {['all','pending','approved','rejected'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {searchParams.get('userId') && (
          <div className="mb-4 text-sm text-slate-300 flex items-center gap-2">
            Filtrado por usuario: <code className="bg-slate-800 px-2 py-1 rounded">{searchParams.get('userId')}</code>
            <button
              className="ml-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
              onClick={() => router.push('/documentos')}
            >
              Quitar filtro
            </button>
          </div>
        )}

        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-slate-400">Cargando...</div>
        ) : error ? (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-red-400">{error}</div>
        ) : rows.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-slate-400">Sin documentos</div>
        ) : (
          <div className="grid gap-6">
            {Array.from(grouped.entries()).map(([userId, docs]) => (
              <section key={userId} className="bg-slate-900 border border-slate-800 rounded-lg">
                <header className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{docs[0]?.usuarios?.nombre || '—'}</div>
                    <div className="text-sm text-slate-400">{docs[0]?.usuarios?.email}</div>
                  </div>
                  <div className="flex gap-2">
                    {(() => {
                      const types = Object.fromEntries(docs.map(d => [d.tipo, d.estado])) as Record<string,string>
                      const hasFront = types['id_front'] === 'approved'
                      const hasBack = types['id_back'] === 'approved'
                      const hasSelfie = types['selfie'] === 'approved'
                      const enabled = hasFront && hasBack && hasSelfie
                      return (
                        <button
                          onClick={()=>enabled && approveUser(userId)}
                          disabled={!enabled}
                          className={`px-3 py-2 rounded-md text-sm ${enabled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 text-slate-300 cursor-not-allowed'}`}
                          title={enabled ? '' : 'Requiere id_front, id_back y selfie aprobados'}
                        >
                          Aprobar usuario
                        </button>
                      )
                    })()}
                  </div>
                </header>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {docs.map(doc => (
                    <article key={doc.id} className="border border-slate-800 rounded-lg overflow-hidden">
                      <div className="p-2 text-sm flex items-center justify-between bg-slate-800/40">
                        <span className="capitalize">{doc.tipo.replace('_',' ')}</span>
                        <span className={`text-xs ${doc.estado==='approved'?'text-emerald-400':doc.estado==='rejected'?'text-red-400':'text-amber-300'}`}>{doc.estado}</span>
                      </div>
                      <div className="aspect-video bg-slate-950 flex items-center justify-center">
                        {/* For images, show preview; otherwise show link */}
                        {doc.url.match(/\.(png|jpg|jpeg|webp|gif)$/i) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={doc.url} alt={doc.tipo} className="object-contain max-h-60" />
                        ) : (
                          <a href={doc.url} target="_blank" rel="noreferrer" className="text-emerald-400 underline">Ver archivo</a>
                        )}
                      </div>
                      <div className="p-3 flex items-center gap-2 border-t border-slate-800">
                        <button onClick={()=>approveDoc(doc)} className="px-2 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-700">Aprobar</button>
                        <button onClick={()=>openReject(doc)} className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700">Rechazar</button>
                        <a href={doc.url} target="_blank" rel="noreferrer" className="ml-auto text-xs text-emerald-400 underline">Abrir</a>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {rejectOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md p-4">
              <h2 className="text-lg font-semibold mb-2">Rechazar documento</h2>
              <p className="text-sm text-slate-400 mb-3">Indica el motivo del rechazo para que el usuario pueda corregirlo.</p>
              <textarea
                className="w-full h-28 p-2 rounded bg-slate-950 border border-slate-700 text-sm"
                value={rejectReason}
                onChange={(e)=>setRejectReason(e.target.value)}
                placeholder="Motivo del rechazo..."
              />
              <div className="mt-3 flex items-center justify-end gap-2">
                <button onClick={()=>{setRejectOpen(false); setRejectDocTarget(null); setRejectReason('')}} className="px-3 py-2 rounded bg-slate-700 text-sm">Cancelar</button>
                <button onClick={confirmReject} className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-sm">Confirmar rechazo</button>
              </div>
            </div>
          </div>
        )}
      </AdminShell>
    </AdminGuard>
  )
}
