import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { redirect } from 'next/navigation';
import { removeInvite } from '@/app/actions/invite-staff';
import { InviteStaffForm } from './invite-form';

export default async function TeamPage({ params }: { params: Promise<{ clinic: string }> }) {
    const supabase = await createClient();
    const { clinic } = await params;
    
    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(`/${clinic}/portal/login`);

    // 2. Admin Check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') redirect(`/${clinic}/portal/dashboard`);

    // 3. Fetch Invites - IMPORTANT: Filter by tenant_id for security
    const { data: invites } = await supabase
        .from('clinic_invites')
        .select('*')
        .eq('tenant_id', clinic)
        .order('created_at', { ascending: false });

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Link href={`/${clinic}/portal/dashboard`} className="p-2 rounded-xl hover:bg-white transition-colors">
                    <Icons.ArrowLeft className="w-6 h-6 text-gray-500" />
                </Link>
                <div>
                     <h1 className="text-3xl font-black font-heading text-[var(--text-primary)]">Gestión de Equipo</h1>
                     <p className="text-gray-500">Administra quién tiene acceso al portal veterinario.</p>
                </div>
            </div>

            {/* Invite Form */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 mb-8">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Icons.UserPlus className="w-5 h-5 text-[var(--primary)]" />
                    Invitar Nuevo Miembro
                </h2>
                <InviteStaffForm clinic={clinic} />
            </div>

            {/* List */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wider ml-2">Miembros Autorizados</h3>
                
                {invites?.length === 0 ? (
                    <p className="text-center text-gray-400 py-8 italic">No hay invitaciones aún.</p>
                ) : (
                    invites?.map((invite) => (
                        <div key={invite.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${invite.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                    {invite.role === 'admin' ? <Icons.Shield className="w-5 h-5" /> : <Icons.Stethoscope className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-bold text-[var(--text-primary)]">{invite.email}</p>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{invite.role}</p>
                                </div>
                            </div>
                            <form action={async () => {
                                "use server";
                                await removeInvite(invite.email, clinic);
                            }}>
                                <button type="submit" className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                    <Icons.Trash2 className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
