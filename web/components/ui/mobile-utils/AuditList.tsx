import { cn } from '@/lib/utils'
import { AuditLog } from '@/lib/domain/audit/types'

interface AuditListProps {
  auditLogs: AuditLog[]
  className?: string
}

export function AuditList({ auditLogs, className }: AuditListProps) {
  return (
    <ul className={cn('list-none m-0 p-0', className)}>
      {auditLogs.map((auditLog) => (
        <li key={auditLog.id} className="py-2">
          <span className="text-sm">{auditLog.action}</span>
          <span className="text-xs">{auditLog.created_at}</span>
        </li>
      ))}
    </ul>
  )
}