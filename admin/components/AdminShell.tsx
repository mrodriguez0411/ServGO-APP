import Sidebar from './Sidebar'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[16rem_1fr] min-h-screen">
      <Sidebar />
      <main className="p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
