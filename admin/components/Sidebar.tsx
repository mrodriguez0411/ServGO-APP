"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import supabase from '../lib/supabaseClient'

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/usuarios', label: 'Usuarios' },
  { href: '/documentos', label: 'Documentos' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/turnos', label: 'Turnos' },
  { href: '/pagos', label: 'Pagos' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const logout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 min-h-screen p-4 sticky top-0">
      <div className="text-xl font-semibold mb-6">ServGO-App Admin</div>
      <nav className="grid gap-1">
        {nav.map(({ href, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 rounded-md text-sm ${active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60'}`}
            >
              {label}
            </Link>
          )
        })}
      </nav>
      <button onClick={logout} className="mt-6 text-sm text-slate-300 hover:text-white">Cerrar sesión</button>
    </aside>
  )
}
