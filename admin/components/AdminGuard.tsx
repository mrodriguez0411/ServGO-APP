"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../lib/supabaseClient'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data?.session
      if (!session) {
        router.replace('/login')
        return
      }
      const { data: row } = await supabase
        .from('usuarios')
        .select('is_admin')
        .eq('id', session.user.id)
        .maybeSingle()
      if (!row?.is_admin) {
        router.replace('/login')
        return
      }
      setOk(true)
    }
    run()
  }, [router])

  if (!ok) return null
  return <>{children}</>
}
