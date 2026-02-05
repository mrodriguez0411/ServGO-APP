export default function Health() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Admin Health</h1>
      <ul>
        <li>NEXT_PUBLIC_SUPABASE_URL length: {process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0}</li>
        <li>NEXT_PUBLIC_SUPABASE_ANON_KEY length: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0}</li>
      </ul>
      <p>Si ves este texto, Next.js está sirviendo páginas correctamente.</p>
    </main>
  )
}
