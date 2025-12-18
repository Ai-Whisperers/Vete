import EpidemiologyClient from './client';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ clinic: string }> }) {
    const { clinic } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${clinic}/portal/login`);
    }

    return <EpidemiologyClient params={{ clinic }} />;
}
