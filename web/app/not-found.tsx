import Link from 'next/link'

export default function NotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="max-w-md text-center">
            <div className="mb-8">
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-[#1B3A6B]/10">
                <span className="text-5xl font-bold text-[#1B3A6B]">404</span>
              </div>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-[#1B3A6B]">Page Not Found</h1>
            <p className="mb-8 text-gray-500">
              The page you are looking for does not exist or has been moved.
            </p>
            <Link
              href="/lealtis"
              className="inline-flex items-center justify-center rounded-xl bg-[#C9A84C] px-6 py-3 font-bold text-white transition-colors hover:bg-[#a67c2e]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
