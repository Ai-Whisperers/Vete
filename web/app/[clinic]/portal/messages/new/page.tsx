import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Send, PawPrint, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface Props {
  params: Promise<{ clinic: string }>;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  photo_url: string | null;
}

export default async function NewMessagePage({ params }: Props): Promise<React.ReactElement> {
  const { clinic } = await params;
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${clinic}/portal/login`);
  }

  // Fetch user's pets for context selection
  const { data: pets } = await supabase
    .from('pets')
    .select('id, name, species, photo_url')
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .order('name');

  const typedPets = (pets || []) as Pet[];

  // Get clinic info
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name')
    .eq('id', clinic)
    .single();

  // Server action to create conversation
  async function createConversation(formData: FormData): Promise<void> {
    'use server';

    const supabaseServer = (await import('@/lib/supabase/server')).createClient;
    const supabase = await supabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const petId = formData.get('petId') as string | null;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const priority = formData.get('priority') as string;

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        tenant_id: clinic,
        client_id: user.id,
        pet_id: petId || null,
        channel: 'portal',
        status: 'open',
        subject: subject,
        priority: priority || 'normal',
      })
      .select('id')
      .single();

    if (convError || !conversation) {
      console.error('Error creating conversation:', convError);
      return;
    }

    // Create first message
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      sender_type: 'client',
      content: message,
      status: 'sent',
    });

    // Redirect to conversation
    const { redirect: redirectFn } = await import('next/navigation');
    redirectFn(`/${clinic}/portal/messages/${conversation.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/${clinic}/portal/messages`}
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Mensajes
        </Link>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">Nuevo Mensaje</h1>
            <p className="text-[var(--text-secondary)]">Contacta a {tenant?.name || 'la clínica'}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form action={createConversation} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Pet Selection (Optional) */}
        {typedPets.length > 0 && (
          <div className="p-6 border-b border-gray-100">
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
              Mascota relacionada (opcional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <label className="relative cursor-pointer">
                <input type="radio" name="petId" value="" defaultChecked className="peer sr-only" />
                <div className="p-3 rounded-xl border-2 border-gray-200 peer-checked:border-[var(--primary)] peer-checked:bg-[var(--primary)]/5 transition-all text-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                    <MessageCircle className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Consulta General</p>
                </div>
              </label>
              {typedPets.map((pet) => (
                <label key={pet.id} className="relative cursor-pointer">
                  <input type="radio" name="petId" value={pet.id} className="peer sr-only" />
                  <div className="p-3 rounded-xl border-2 border-gray-200 peer-checked:border-[var(--primary)] peer-checked:bg-[var(--primary)]/5 transition-all text-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden mx-auto mb-2">
                      {pet.photo_url ? (
                        <Image
                          src={pet.photo_url}
                          alt={pet.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <PawPrint className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-600 truncate">{pet.name}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Subject & Priority */}
        <div className="p-6 border-b border-gray-100 grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Asunto *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              placeholder="Ej: Consulta sobre vacunas"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
            />
          </div>
          <div>
            <label htmlFor="priority" className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Prioridad
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue="normal"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
            >
              <option value="low">Baja - Consulta general</option>
              <option value="normal">Normal</option>
              <option value="high">Alta - Necesito respuesta pronto</option>
              <option value="urgent">Urgente - Emergencia</option>
            </select>
          </div>
        </div>

        {/* Message */}
        <div className="p-6 border-b border-gray-100">
          <label htmlFor="message" className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
            Mensaje *
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            placeholder="Escribe tu mensaje aquí..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all resize-none"
          />
        </div>

        {/* Info Box */}
        <div className="px-6 py-4 bg-blue-50 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Recibirás una notificación cuando el equipo responda tu mensaje.
            Para emergencias, por favor llama directamente a la clínica.
          </p>
        </div>

        {/* Submit */}
        <div className="p-6 flex justify-end gap-3">
          <Link
            href={`/${clinic}/portal/messages`}
            className="px-6 py-3 text-[var(--text-secondary)] font-medium hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
            Enviar Mensaje
          </button>
        </div>
      </form>
    </div>
  );
}
