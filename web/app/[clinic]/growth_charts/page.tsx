// Server component wrapper for Growth Charts page
import GrowthChartsClient from '@/app/[clinic]/growth_charts/client';

export const generateMetadata = async () => ({
  title: 'Growth Charts',
  description: 'Manage growth charts',
  openGraph: { title: 'Growth Charts', description: 'Manage growth charts' },
  twitter: { card: 'summary_large_image' },
});

export default function GrowthChartsPage() {
  return <GrowthChartsClient />;
}
