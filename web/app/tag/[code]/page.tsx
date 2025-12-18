import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PublicPetProfile } from "@/components/public-pet-profile";
import * as Icons from "lucide-react";
import Link from "next/link";
import { assignTag } from "@/app/actions/assign-tag";

// Server Component
export default async function TagPage({ params }: { params: Promise<{ code: string }> }) {
  const supabase =  await createClient();
  const { code } = await params;

  // 1. Check Tag Status
  const { data: tagInfo, error } = await supabase.rpc('get_pet_by_tag', { tag_code: code });

  // Get tag's tenant_id for proper clinic routing
  const { data: tagData } = await supabase
    .from('qr_tags')
    .select('tenant_id')
    .eq('code', code)
    .single();

  const clinicSlug = tagData?.tenant_id || 'adris'; // Fallback to adris if no tenant

  if (error || !tagInfo || tagInfo.status === 'not_found') {
     // Tag doesn't exist. Redirect to home or show 404.
     // Maybe show a "Claim this tag" if we want to allow registering new IDs?
     // For now, assume tags must be pre-created by Admin.
     return (
         <div className="min-h-screen flex items-center justify-center flex-col gap-4">
             <h1 className="text-2xl font-bold">Chip/Tag No Encontrado</h1>
             <p>Este código ({code}) no está registrado en nuestro sistema.</p>
             <Link href="/" className="text-blue-500 underline">Volver al Inicio</Link>
         </div>
     )
  }

  // 2. SCENARIO: ASSIGNED -> SHOW PUBLIC PROFILE
  if (tagInfo.status === 'assigned') {
      return <PublicPetProfile data={tagInfo} />;
  }

  // 3. SCENARIO: UNASSIGNED -> ASSIGN FLOW
  if (tagInfo.status === 'unassigned') {
      // Check Auth
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
          return (
              <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                  <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
                      <div className="w-16 h-16 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto">
                          <Icons.Link className="w-8 h-8" />
                      </div>
                      <div>
                          <h1 className="text-2xl font-black text-gray-800">Activar Identificador</h1>
                          <p className="text-gray-500 mt-2">
                              Escaneaste el código <strong>{code}</strong>. <br/>
                              Inicia sesión para vicularlo a una de tus mascotas.
                          </p>
                      </div>
                      <Link
                        href={`/${clinicSlug}/portal/login?redirect=/tag/${code}`}
                        className="block w-full py-4 bg-[var(--primary)] text-white font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-transform"
                      >
                          Iniciar Sesión / Registrarse
                      </Link>
                  </div>
              </div>
          );
      }

      // Fetch User's (or Clinic's if Staff) Pets to Assign
      // Simplified: Just fetch pets owned by User
      const { data: myPets } = await supabase
        .from('pets')
        .select('id, name, species, photo_url')
        .eq('owner_id', user.id);

      // Simple Action Wrapper
      async function handleAssign(formData: FormData) {
        "use server";
        const petId = formData.get("petId") as string;
        await assignTag(code, petId);
      }

      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
               <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full space-y-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icons.QrCode className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-800">Vincular Identificador</h1>
                        <p className="text-gray-500">
                            Código: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800 font-bold">{code}</span>
                        </p>
                    </div>

                    {!myPets || myPets.length === 0 ? (
                        <div className="text-center py-6 bg-yellow-50 rounded-xl border border-yellow-100">
                            <p className="text-yellow-700 font-bold mb-2">No tienes mascotas registradas</p>
                            <Link href={`/${clinicSlug}/portal/pets/new`} className="text-sm underline text-yellow-800">
                                Registrar mascota primero
                            </Link>
                        </div>
                    ) : (
                        <form action={handleAssign} className="space-y-4">
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider">
                                Selecciona tu Mascota
                            </label>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {myPets.map((pet) => (
                                    <label key={pet.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all">
                                        <input type="radio" name="petId" value={pet.id} required className="w-5 h-5 accent-[var(--primary)]" />
                                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                            {pet.photo_url ? (
                                                <img src={pet.photo_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Icons.PawPrint className="w-5 h-5"/></div>
                                            )}
                                        </div>
                                        <div>
                                            <span className="block font-bold text-gray-800">{pet.name}</span>
                                            <span className="text-xs text-gray-500 uppercase">{pet.species}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <button className="w-full py-4 bg-[var(--primary)] text-white font-bold rounded-xl shadow-lg mt-4 hover:opacity-90">
                                Vincular Ahora
                            </button>
                        </form>
                    )}
               </div>
          </div>
      )
  }

  return <div>Estado desconocido</div>
}
