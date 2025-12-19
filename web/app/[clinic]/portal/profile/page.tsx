import { createClient } from '@/lib/supabase/server';
import { updateProfile } from '@/app/actions/update-profile';
import { redirect } from 'next/navigation';
import * as Icons from 'lucide-react';
import Link from 'next/link';

function SubmitButton() {
  return (
    <button
      type="submit"
      className="bg-[var(--primary)] text-white font-bold py-3 px-6 sm:px-8 min-h-[48px] rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
    >
      <Icons.Save className="w-5 h-5" /> Guardar Cambios
    </button>
  );
}

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

      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-4 sm:p-6 md:p-8">
          {success && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 border border-green-100">
                  <Icons.CheckCircle2 className="w-5 h-5" />
                  <span className="font-bold">¡Perfil actualizado correctamente!</span>
              </div>
          )}

          <form action={updateProfile as unknown as (formData: FormData) => Promise<void>} className="space-y-6">
              <input type="hidden" name="clinic" value={clinic} />
              
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pb-6 border-b border-gray-100">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 font-bold text-2xl sm:text-3xl flex-shrink-0">
                      {profile?.avatar_url ? (
                          <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                      ) : (
                          profile?.full_name?.[0] || <Icons.User className="w-8 h-8 sm:w-10 sm:h-10" />
                      )}
                  </div>
                  <div className="text-center sm:text-left">
                      <h3 className="font-bold text-base sm:text-lg text-gray-800 break-all">{profile?.email}</h3>
                      <span className="inline-block px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold rounded-full uppercase mt-1">
                          {profile?.role === 'owner' ? 'Propietario' : profile?.role}
                      </span>
                  </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-sm font-bold text-gray-500 mb-2">Nombre Completo</label>
                      <input
                          name="full_name"
                          defaultValue={profile?.full_name || ''}
                          className="w-full p-3 min-h-[48px] rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none font-bold text-gray-700"
                      />
                  </div>
                  {/* Empty col for spacing or future use */}
                  <div className="hidden md:block"></div>

                  <div>
                      <label className="block text-sm font-bold text-gray-500 mb-2">Teléfono Principal</label>
                      <input
                          name="phone"
                          defaultValue={profile?.phone || ''}
                          placeholder="+595 9..."
                          className="w-full p-3 min-h-[48px] rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none font-bold text-gray-700"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-500 mb-2">Teléfono Secundario</label>
                      <input
                          name="secondary_phone"
                          defaultValue={profile?.secondary_phone || ''}
                          placeholder="Opcional"
                          className="w-full p-3 min-h-[48px] rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none font-bold text-gray-700"
                      />
                  </div>

                  <div className="md:col-span-2">
                       <label className="block text-sm font-bold text-gray-500 mb-2">Dirección</label>
                       <input
                          name="address"
                          defaultValue={profile?.address || ''}
                          placeholder="Calle Principal 123"
                          className="w-full p-3 min-h-[48px] rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none font-bold text-gray-700"
                      />
                  </div>
                  
                  <div className="md:col-span-2">
                       <label className="block text-sm font-bold text-gray-500 mb-2">Ciudad / Barrio</label>
                       <input
                          name="city"
                          defaultValue={profile?.city || ''}
                          placeholder="Asunción"
                          className="w-full p-3 min-h-[48px] rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none font-bold text-gray-700"
                      />
                  </div>
              </div>

              <div className="pt-4 flex justify-center sm:justify-end">
                  <SubmitButton />
              </div>
          </form>
      </div>
    </div>
  );
}
