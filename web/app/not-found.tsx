import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-slate-400 mb-8">Page not found</p>
        <Link href="/" className="text-amber-400 hover:underline">
          ← Back to paragu.ai
        </Link>
      </div>
    </main>
  )
}
