import * as Icons from "lucide-react";
import Link from "next/link";

interface PublicPetProfileProps {
  data: {
    status: string;
    pet: {
      name: string;
      species: string;
      breed: string;
      photo_url: string | null;
      diet_notes: string | null;
    };
    owner: {
      name: string;
      phone: string;
    };
    vaccine_status: 'up_to_date' | 'needs_check' | 'unknown';
  };
}

export function PublicPetProfile({ data }: PublicPetProfileProps) {
  const { pet, owner, vaccine_status } = data;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Status */}
        <div className={`p-4 text-center font-bold text-white uppercase tracking-widest text-sm flex items-center justify-center gap-2 ${
            vaccine_status === 'up_to_date' ? 'bg-green-500' : 'bg-red-500'
        }`}>
            {vaccine_status === 'up_to_date' ? (
                <><Icons.CheckCircle2 className="w-5 h-5" /> Vacunas al Día</>
            ) : (
                <><Icons.AlertTriangle className="w-5 h-5" /> Verificar Vacunas</>
            )}
        </div>

        {/* Pet Photo */}
        <div className="relative pt-8 pb-4 flex justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                {pet.photo_url ? (
                    <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Icons.PawPrint className="w-16 h-16" />
                    </div>
                )}
            </div>
        </div>

        {/* Pet Info */}
        <div className="text-center px-6 pb-6 border-b border-gray-100">
            <h1 className="text-3xl font-black text-gray-800 mb-1">{pet.name}</h1>
            <p className="text-gray-500 font-medium uppercase tracking-wider text-sm flex justify-center items-center gap-2">
                 {pet.species === 'dog' ? <Icons.Dog className="w-4 h-4"/> : <Icons.Cat className="w-4 h-4"/>}
                 {pet.breed || 'Mestizo'}
            </p>
        </div>

        {/* Owner Info */}
        <div className="p-6 bg-gray-50/50 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Icons.User className="w-5 h-5" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase">Propietario</label>
                    <span className="font-bold text-gray-800">{owner.name}</span>
                </div>
            </div>

            <a href={`tel:${owner.phone}`} className="block w-full">
                <div className="bg-green-500 p-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:bg-green-600 transition-all cursor-pointer text-white">
                    <Icons.Phone className="w-6 h-6" />
                    <div className="text-left">
                         <span className="block text-xs font-bold opacity-80 uppercase">Llamar Ahora</span>
                         <span className="font-black text-lg">{owner.phone}</span>
                    </div>
                </div>
            </a>
            
            <a href={`https://wa.me/${owner.phone?.replace(/\+/g, '')}`} target="_blank" className="block w-full">
                <div className="bg-[#25D366] p-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:opacity-90 transition-all cursor-pointer text-white">
                    <Icons.MessageCircle className="w-6 h-6" />
                    <span className="font-black text-lg">WhatsApp</span>
                </div>
            </a>
        </div>

        {/* Diet / Notes */}
        {pet.diet_notes && (
             <div className="p-6 border-t border-gray-100">
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Icons.Utensils className="w-3 h-3"/> Dieta / Cuidados
                </h3>
                <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                    {pet.diet_notes}
                </p>
             </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-gray-50 text-center">
            <Link href="/" className="text-xs font-bold text-gray-400 hover:text-[var(--primary)] flex items-center justify-center gap-1">
                <Icons.ShieldCheck className="w-3 h-3" /> Identificado con Adris
            </Link>
        </div>
      </div>
    </div>
  );
}
