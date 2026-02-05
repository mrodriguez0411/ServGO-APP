"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard')
      }
    })
  }, [router])

  const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError(null)
  
  try {
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos')
    }
    
    // 1. Iniciar sesión con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
      email: email.trim().toLowerCase(),  // Convertir a minúsculas
      password 
    })
    
    if (authError) throw authError
    
    // 2. Obtener el usuario autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No se pudo obtener la información del usuario')
    
    // 3. Buscar en la tabla usuarios usando el ID
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (userError || !userData) {
      console.error('Error al buscar usuario:', userError)
      await supabase.auth.signOut()
      throw new Error('Usuario no encontrado en la base de datos')
    }
    
    // 4. Verificar si el usuario está activo
    if (userData.is_active === false) {
      await supabase.auth.signOut()
      throw new Error('Su cuenta no está activa. Por favor, contacte al administrador.')
    }
    
    // 5. Verificar si es administrador
    if (userData.is_admin !== true) {
      await supabase.auth.signOut()
      throw new Error('No tiene permisos para acceder al panel de administración')
    }
    
    // 6. Redirigir al dashboard si todo está bien
    window.location.href = '/dashboard'
    
  } catch (err: any) {
    console.error('Error de autenticación:', err)
    setError(
      err.message.includes('Invalid login credentials') || 
      err.message.includes('No se pudo iniciar sesión') ||
      err.message.includes('No tiene permisos')
        ? err.message  // Mostrar el mensaje de error específico
        : 'Ocurrió un error al iniciar sesión. Por favor, intente más tarde.'
    )
  } finally {
    setLoading(false)
  }
}

  return (
    <main style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '1rem'
    }}>
      <form 
        onSubmit={onSubmit} 
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>Panel de Administración ServGO-App</h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Ingrese sus credenciales para continuar</p>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label 
            htmlFor="email" 
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}
          >
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              color: '#111827',
              backgroundColor: loading ? '#f3f4f6' : 'white',
              transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label 
              htmlFor="password" 
              style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151'
              }}
            >
              Contraseña
            </label>
            <a 
              href="/forgot-password" 
              style={{
                fontSize: '0.75rem',
                color: '#059669',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              ¿Olvidó su contraseña?
            </a>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              color: '#111827',
              backgroundColor: loading ? '#f3f4f6' : 'white',
              transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
            }}
          />
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: '#fef2f2',
            borderLeft: '4px solid #dc2626',
            borderRadius: '0.25rem',
            color: '#b91c1c',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.625rem',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'background-color 0.2s ease-in-out, opacity 0.2s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          {loading ? (
            <>
              <svg 
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ingresando...
            </>
          ) : 'Iniciar sesión'}
        </button>
      </form>
    </main>
  )
}
