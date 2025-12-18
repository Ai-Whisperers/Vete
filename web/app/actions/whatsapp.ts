'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendWhatsAppMessage } from '@/lib/whatsapp/client'
import { 
  fillTemplateVariables, 
  formatParaguayPhone,
  type WhatsAppMessage, 
  type WhatsAppTemplate, 
  type WhatsAppConversation 
} from '@/lib/types/whatsapp'

// Get conversations (grouped by phone number)
export async function getConversations(clinic: string): Promise<{ data: WhatsAppConversation[] } | { error: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role) || profile.tenant_id !== clinic) {
    return { error: 'No autorizado' }
  }

  try {
    // Get latest message per phone number
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select(`
        phone_number,
        client_id,
        content,
        direction,
        created_at,
        client:profiles!whatsapp_messages_client_id_fkey(id, full_name)
      `)
      .eq('tenant_id', clinic)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Group by phone number
    const conversationMap = new Map<string, WhatsAppConversation>()

    for (const msg of messages || []) {
      if (!conversationMap.has(msg.phone_number)) {
        const client = Array.isArray(msg.client) ? msg.client[0] : msg.client
        conversationMap.set(msg.phone_number, {
          phone_number: msg.phone_number,
          client_id: msg.client_id,
          client_name: client?.full_name,
          last_message: msg.content,
          last_message_at: msg.created_at,
          direction: msg.direction,
          unread_count: 0 // Could track this with a separate field
        })
      }
    }

    return { data: Array.from(conversationMap.values()) }
  } catch (e) {
    console.error('Error loading conversations:', e)
    return { error: 'Error al cargar conversaciones' }
  }
}

// Get messages for a conversation
export async function getMessages(clinic: string, phoneNumber: string): Promise<{ data: WhatsAppMessage[] } | { error: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role) || profile.tenant_id !== clinic) {
    return { error: 'No autorizado' }
  }

  try {
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select(`
        *,
        client:profiles!whatsapp_messages_client_id_fkey(id, full_name, phone)
      `)
      .eq('tenant_id', clinic)
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: true })
      .limit(100)

    if (error) throw error

    // Transform client arrays
    const transformed = messages?.map(msg => ({
      ...msg,
      client: Array.isArray(msg.client) ? msg.client[0] : msg.client
    })) || []

    return { data: transformed as WhatsAppMessage[] }
  } catch (e) {
    console.error('Error loading messages:', e)
    return { error: 'Error al cargar mensajes' }
  }
}

// Send a WhatsApp message
export async function sendMessage(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return { success: false, error: 'Solo el personal puede enviar mensajes' }
  }

  const phone = formData.get('phone') as string
  const message = formData.get('message') as string
  const clientId = formData.get('client_id') as string
  const templateId = formData.get('template_id') as string
  const variablesJson = formData.get('variables') as string

  if (!phone || !message) {
    return { success: false, error: 'Número y mensaje son requeridos' }
  }

  let finalMessage = message

  // If using template, fill variables
  if (templateId && variablesJson) {
    try {
      const variables = JSON.parse(variablesJson)
      finalMessage = fillTemplateVariables(message, variables)
    } catch (e) {
      // Use message as-is
    }
  }

  // Send via Twilio
  const result = await sendWhatsAppMessage({
    to: phone,
    body: finalMessage
  })

  // Log message to database
  const { error: dbError } = await supabase.from('whatsapp_messages').insert({
    tenant_id: profile.tenant_id,
    client_id: clientId || null,
    phone_number: formatParaguayPhone(phone),
    direction: 'outbound',
    content: finalMessage,
    status: result.success ? 'sent' : 'failed',
    twilio_sid: result.sid,
    error_message: result.error,
    sent_at: result.success ? new Date().toISOString() : null
  })

  if (dbError) {
    console.error('Error logging message:', dbError)
  }

  if (!result.success) {
    return { success: false, error: result.error }
  }

  revalidatePath(`/${profile.tenant_id}/dashboard/whatsapp`)
  return { success: true }
}

// Get templates
export async function getTemplates(clinic: string): Promise<{ data: WhatsAppTemplate[] } | { error: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role) || profile.tenant_id !== clinic) {
    return { error: 'No autorizado' }
  }

  try {
    const { data: templates, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('tenant_id', clinic)
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    return { data: templates as WhatsAppTemplate[] }
  } catch (e) {
    console.error('Error loading templates:', e)
    return { error: 'Error al cargar plantillas' }
  }
}

// Create template
export async function createTemplate(formData: FormData): Promise<{ success: boolean; templateId?: string; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Solo administradores pueden crear plantillas' }
  }

  const name = formData.get('name') as string
  const content = formData.get('content') as string
  const category = formData.get('category') as string
  const variablesJson = formData.get('variables') as string

  if (!name || !content) {
    return { success: false, error: 'Nombre y contenido son requeridos' }
  }

  let variables: string[] = []
  try {
    variables = JSON.parse(variablesJson || '[]')
  } catch (e) {
    // Extract variables from content
    const matches = content.match(/{{(\w+)}}/g) || []
    variables = [...new Set(matches.map(m => m.replace(/[{}]/g, '')))]
  }

  try {
    const { data: template, error } = await supabase
      .from('whatsapp_templates')
      .insert({
        tenant_id: profile.tenant_id,
        name,
        content,
        variables,
        category: category || null
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath(`/${profile.tenant_id}/dashboard/whatsapp/templates`)
    return { success: true, templateId: template.id }
  } catch (e) {
    console.error('Error creating template:', e)
    return { success: false, error: 'Error al crear plantilla' }
  }
}

// Update template
export async function updateTemplate(templateId: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Solo administradores pueden editar plantillas' }
  }

  const name = formData.get('name') as string
  const content = formData.get('content') as string
  const category = formData.get('category') as string
  const variablesJson = formData.get('variables') as string

  if (!name || !content) {
    return { success: false, error: 'Nombre y contenido son requeridos' }
  }

  let variables: string[] = []
  try {
    variables = JSON.parse(variablesJson || '[]')
  } catch (e) {
    const matches = content.match(/{{(\w+)}}/g) || []
    variables = [...new Set(matches.map(m => m.replace(/[{}]/g, '')))]
  }

  try {
    const { error } = await supabase
      .from('whatsapp_templates')
      .update({
        name,
        content,
        variables,
        category: category || null
      })
      .eq('id', templateId)
      .eq('tenant_id', profile.tenant_id)

    if (error) throw error

    revalidatePath(`/${profile.tenant_id}/dashboard/whatsapp/templates`)
    return { success: true }
  } catch (e) {
    console.error('Error updating template:', e)
    return { success: false, error: 'Error al actualizar plantilla' }
  }
}

// Delete template (soft delete)
export async function deleteTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Solo administradores pueden eliminar plantillas' }
  }

  try {
    const { error } = await supabase
      .from('whatsapp_templates')
      .update({ is_active: false })
      .eq('id', templateId)
      .eq('tenant_id', profile.tenant_id)

    if (error) throw error

    revalidatePath(`/${profile.tenant_id}/dashboard/whatsapp/templates`)
    return { success: true }
  } catch (e) {
    console.error('Error deleting template:', e)
    return { success: false, error: 'Error al eliminar plantilla' }
  }
}

// TICKET-TYPE-004: Define proper type for client data
interface ClientProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  tenant_id: string;
}

// Find client by phone number
export async function findClientByPhone(phone: string): Promise<{ data: ClientProfile | null } | { error: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  const formattedPhone = formatParaguayPhone(phone)

  try {
    const { data: client, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone, tenant_id')
      .eq('phone', formattedPhone)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return { data: client }
  } catch (e) {
    console.error('Error finding client:', e)
    return { error: 'Error al buscar cliente' }
  }
}
