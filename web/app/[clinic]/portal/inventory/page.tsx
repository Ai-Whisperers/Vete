import { Suspense } from 'react';
import InventoryClient from './client';
import { Loader2 } from 'lucide-react';

export default function InventoryPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
                </div>
            }>
                <InventoryClient />
            </Suspense>
        </div>
    );
}
