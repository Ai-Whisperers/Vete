// Server component wrapper for Diagnosis Codes page
import DiagnosisCodesClient from '@/app/[clinic]/diagnosis_codes/client';

export const generateMetadata = async () => ({
  title: 'Diagnosis Codes',
  description: 'Manage diagnosis codes',
  openGraph: { title: 'Diagnosis Codes', description: 'Manage diagnosis codes' },
  twitter: { card: 'summary_large_image' }
});

export default function DiagnosisCodesPage() {
  return <DiagnosisCodesClient />;
}
