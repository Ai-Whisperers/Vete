import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AuditButtonProps {
  onClick: () => void
  className?: string
}

export function AuditButton({ onClick, className }: AuditButtonProps) {
  return (
    <Button onClick={onClick} className={cn('bg-[var(--primary)] text-white', className)}>
      Audit
    </Button>
  )
}