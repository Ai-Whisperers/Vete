import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import { ProfileForm } from './profile-form';

export default async function ProfilePage({ params, searchParams }: { params: Promise<{ clinic: string }>, searchParams: Promise<{ success?: string }> }) {
  const supabase = await createClient();
  const { clinic } = await params;
  const { success } = await searchParams;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${clinic}/portal/login`);

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return (
    <div className="max-w-3xl mx-auto px-4 pb-20">
      <div className="flex items-center gap-4 mb-8">
            <Link href={`/${clinic}/portal/dashboard`} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-white transition-colors">
                <Icons.ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" />
            </Link>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)]">Mi Perfil</h1>
            <p className="text-[var(--text-secondary)] font-medium">Gestiona tu información personal y de contacto</p>
          </div>
      </div>

      <ProfileForm clinic={clinic} profile={profile} success={!!success} />
    </div>
  );
}

