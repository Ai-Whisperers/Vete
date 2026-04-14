import { LocaleSwitcher } from '@/components/ui/locale-switcher'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between p-4">
        <LocaleSwitcher />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}