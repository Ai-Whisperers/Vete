// Server component wrapper for Loyalty Points page
import LoyaltyPointsClient from '@/app/[clinic]/loyalty_points/client';

export const generateMetadata = async () => ({
  title: 'Loyalty Points',
  description: 'Manage loyalty points',
  openGraph: { title: 'Loyalty Points', description: 'Manage loyalty points' },
  twitter: { card: 'summary_large_image' }
});

export default function LoyaltyPointsPage() {
  return <LoyaltyPointsClient />;
}
