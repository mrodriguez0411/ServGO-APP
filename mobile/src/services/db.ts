import supabase from '../lib/supabase'

export type UsuarioTipo = 'client' | 'provider'

export async function createUsuario(params: {
  id: string
  nombre: string
  email: string
  telefono?: string
  tipo: UsuarioTipo
  foto?: string
}) {
  const { id, nombre, email, telefono, tipo, foto } = params
  const { error } = await supabase
    .from('usuarios')
    .insert([{ id, nombre, email, telefono: telefono || null, tipo, foto: foto || null }])
  return { error }
}

export async function upsertUsuario(params: {
  id: string
  nombre?: string
  telefono?: string
  tipo?: UsuarioTipo
  foto?: string
}) {
  const { id, ...rest } = params
  const { error } = await supabase
    .from('usuarios')
    .upsert([{ id, ...rest }], { onConflict: 'id' })
  return { error }
}
