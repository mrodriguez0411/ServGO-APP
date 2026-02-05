"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../lib/supabaseClient'
import AdminShell from '../../components/AdminShell'

type Counts = {
  usuariosTotal: number
  usuariosByStatus: Record<string, number>
  serviciosTotal: number
  serviciosActivos: number
  turnosByEstado: Record<string, number>
  pagosByEstado: Record<string, number>
  pagosTotalPagado: number
  documentosPendientes: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState<Counts | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)

      // Check session
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session
      if (!session) {
        router.replace('/login')
        return
      }

      // Check admin flag
      const { data: userRow, error: uErr } = await supabase
        .from('usuarios')
        .select('is_admin')
        .eq('id', session.user.id)
        .maybeSingle()

      if (uErr || !userRow?.is_admin) {
        router.replace('/login')
        return
      }

      try {
        // Usuarios: total y por status
        const usuariosTotal = await countTable('usuarios')
        const usuariosByStatus = await countGrouped('usuarios', 'verification_status')
        // Servicios
        const serviciosTotal = await countTable('servicios')
        const serviciosActivos = await countFiltered('servicios', ['activo', 'eq', true])
        // Turnos por estado
        const turnosByEstado = await countGrouped('turnos', 'estado')
        // Pagos por estado y total pagado
        const pagosByEstado = await countGrouped('pagos', 'estado')
        const pagosTotalPagado = await sumFiltered('pagos', 'monto', ['estado', 'eq', 'pagado'])
        // Documentos pendientes
        const documentosPendientes = await countFiltered('documentos', ['estado', 'eq', 'pending'])

        setCounts({
          usuariosTotal,
          usuariosByStatus,
          serviciosTotal,
          serviciosActivos,
          turnosByEstado,
          pagosByEstado,
          pagosTotalPagado,
          documentosPendientes,
        })
      } catch (e: any) {
        setError(e?.message || 'Error al cargar métricas')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [router])

  if (loading) return <AdminShell><ScreenWrap><h1 className="text-xl">Cargando...</h1></ScreenWrap></AdminShell>
  if (error) return <AdminShell><ScreenWrap><p className="text-red-400">{error}</p></ScreenWrap></AdminShell>
  if (!counts) return <AdminShell><ScreenWrap><div /></ScreenWrap></AdminShell>

  const card = (title: string, value: string | number) => (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
      <div className="text-slate-400 text-sm">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
    </div>
  )

  const renderGroup = (title: string, grp: Record<string, number>) => (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
      <div className="text-slate-400 text-sm mb-2">{title}</div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(grp).map(([k,v]) => (
          <div key={k} className="flex items-center justify-between text-sm">
            <span className="text-slate-300">{k || '—'}</span>
            <span className="font-semibold">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <AdminShell>
    <ScreenWrap>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {card('Usuarios (total)', counts.usuariosTotal)}
        {card('Servicios (total)', counts.serviciosTotal)}
        {card('Servicios activos', counts.serviciosActivos)}
        {card('Documentos pendientes', counts.documentosPendientes)}
        {card('Pagos (total pagado)', `$ ${counts.pagosTotalPagado.toFixed(2)}`)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {renderGroup('Usuarios por estado', counts.usuariosByStatus)}
        {renderGroup('Turnos por estado', counts.turnosByEstado)}
        {renderGroup('Pagos por estado', counts.pagosByEstado)}
      </div>
    </ScreenWrap>
    </AdminShell>
  )
}

function ScreenWrap({ children }: { children: React.ReactNode }) {
  return (
    <main className="p-6 max-w-7xl mx-auto">
      {children}
    </main>
  )
}

async function countTable(table: string): Promise<number> {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
  if (error) throw error
  return count || 0
}

async function countFiltered(table: string, filter: [string, 'eq' | 'neq', any]): Promise<number> {
  const [col, op, val] = filter
  let q = supabase.from(table).select('*', { count: 'exact', head: true })
  // @ts-ignore
  q = q[op](col, val)
  const { count, error } = await q
  if (error) throw error
  return count || 0
}

async function sumFiltered(table: string, sumCol: string, filter: [string, 'eq' | 'neq', any]): Promise<number> {
  const [col, op, val] = filter
  let q = supabase.from(table).select(`${sumCol}`)
  // @ts-ignore
  q = q[op](col, val)
  const { data, error } = await q
  if (error) throw error
  const total = (data || []).reduce((acc: number, row: any) => acc + (Number(row[sumCol]) || 0), 0)
  return total
}

async function countGrouped(table: string, groupCol: string): Promise<Record<string, number>> {
  const { data, error } = await supabase.from(table).select(`${groupCol}`)
  if (error) throw error
  const out: Record<string, number> = {}
  ;(data || []).forEach((row: any) => {
    const key = row[groupCol] ?? 'unknown'
    out[key] = (out[key] || 0) + 1
  })
  return out
}
