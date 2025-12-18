"use client";

import { useActionState } from 'react';
import * as Icons from 'lucide-react';
import { inviteStaff } from '@/app/actions/invite-staff';

export function InviteStaffForm({ clinic }: { clinic: string }) {
  const [state, formAction, isPending] = useActionState(inviteStaff, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="clinic" value={clinic} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase text-gray-400 mb-1 ml-2">Email</label>
          <input 
            required 
            type="email" 
            name="email" 
            placeholder="doctor@veterinaria.com" 
            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[var(--primary)] rounded-xl px-4 py-3 outline-none transition-all font-medium"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-400 mb-1 ml-2">Cargo</label>
          <select 
            name="role" 
            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[var(--primary)] rounded-xl px-4 py-3 outline-none transition-all font-bold text-[var(--text-primary)] appearance-none"
          >
            <option value="vet">Veterinario</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      
      {state?.error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <Icons.AlertCircle className="w-4 h-4" />
            {state.error}
        </div>
      )}
      
      {state?.success && (
        <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2">
            <Icons.CheckCircle className="w-4 h-4" />
            Invitación enviada correctamente
        </div>
      )}

      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-[var(--primary)] text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2"
      >
        {isPending ? <Icons.Loader2 className="animate-spin w-5 h-5"/> : "Enviar Invitación"}
      </button>
    </form>
  );
}
