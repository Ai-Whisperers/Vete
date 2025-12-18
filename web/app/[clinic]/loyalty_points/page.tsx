// Server component wrapper for Loyalty Points page
import LoyaltyPointsClient from '@/app/[clinic]/loyalty_points/client';

export const generateMetadata = async () => ({
  title: 'Programa de Fidelidad - Puntos de Lealtad',
  description: 'Gestiona los puntos de fidelidad de tus clientes. Recompensa su lealtad.',
  openGraph: { title: 'Puntos de Fidelidad', description: 'Sistema de recompensas para clientes' },
  twitter: { card: 'summary_large_image' }
});

export default function LoyaltyPointsPage() {
  return <LoyaltyPointsClient />;
}
