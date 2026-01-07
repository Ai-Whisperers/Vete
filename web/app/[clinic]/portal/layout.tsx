import { requireOwner } from '@/lib/auth'
import { PortalProviders } from './providers'

interface PortalLayoutProps {
  children: React.ReactNode
  params: Promise<{ clinic: string }>
}

/**
 * Portal Layout - Server component with tenant validation
 *
 * SEC-001: This layout validates that the authenticated user belongs to the
 * clinic specified in the URL. If not, they are redirected to their correct clinic.
 *
 * Also provides command palette functionality via PortalProviders.
 */
export default async function PortalLayout({ children, params }: PortalLayoutProps) {
  const { clinic } = await params

  // SEC-001: Require authenticated user AND validate tenant matches URL
  // This prevents users from clinic A accessing clinic B's portal via URL manipulation
  await requireOwner(clinic)

  return <PortalProviders>{children}</PortalProviders>
}
