// Server component wrapper for Prescriptions page
import PrescriptionsClient from '@/app/[clinic]/prescriptions/client';

export const generateMetadata = async () => ({
  title: 'Prescriptions',
  description: 'Manage prescriptions',
  openGraph: { title: 'Prescriptions', description: 'Manage prescriptions' },
  twitter: { card: 'summary_large_image' },
});

export default function PrescriptionsPage() {
  return <PrescriptionsClient />;
}
