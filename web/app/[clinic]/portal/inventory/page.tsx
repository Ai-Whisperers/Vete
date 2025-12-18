import { Suspense } from 'react';
import InventoryClient from './client';
import { Loader2 } from 'lucide-react';
import { getClinicData } from '@/lib/clinics';

interface Props {
    params: Promise<{ clinic: string }>;
}

export default async function InventoryPage({ params }: Props) {
    const { clinic } = await params;
    const clinicData = await getClinicData(clinic);

    const googleSheetUrl = clinicData?.config?.settings?.inventory_template_google_sheet_url || null;

    return (
        <div className="container mx-auto px-4 py-8">
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
                </div>
            }>
                <InventoryClient googleSheetUrl={googleSheetUrl} />
            </Suspense>
        </div>
    );
}
