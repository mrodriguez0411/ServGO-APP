import './globals.css'

export const metadata = { title: 'ServGO-App Admin' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  )
}
