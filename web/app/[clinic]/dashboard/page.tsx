import { redirect } from 'next/navigation';

// Prevent static generation - this page always redirects
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ clinic: string }>;
}

/**
 * Legacy dashboard route - redirects to portal dashboard
 * This route existed as a duplicate and has been consolidated.
 */
export default async function LegacyDashboardRedirect({ params }: Props) {
  const { clinic } = await params;
  redirect(`/${clinic}/portal/dashboard`);
}
