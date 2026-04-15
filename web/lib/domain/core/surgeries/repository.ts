import { supabase } from '@/lib/supabase/client';
import type { Surgery, CreateSurgeryData, UpdateSurgeryData } from './types';

export class SurgeryRepository {
  async findById(id: string, tenantId: string): Promise<Surgery | null> {
    const { data, error } = await supabase
      .from('surgeries')
      .select('id, tenant_id, type, status, surgeon_id, room_id, equipment_needs, scheduled_start_time, scheduled_end_time, actual_start_time, actual_end_time, created_at, updated_at')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      tenantId: data.tenant_id,
      type: data.type,
      status: data.status,
      surgeonId: data.surgeon_id,
      roomId: data.room_id,
      equipmentNeeds: data.equipment_needs,
      scheduledStartTime: new Date(data.scheduled_start_time),
      scheduledEndTime: new Date(data.scheduled_end_time),
      actualStartTime: data.actual_start_time ? new Date(data.actual_start_time) : null,
      actualEndTime: data.actual_end_time ? new Date(data.actual_end_time) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async findMany(filters: any = {}, tenantId: string): Promise<Surgery[]> {
    const { data, error } = await supabase
      .from('surgeries')
      .select('id, tenant_id, type, status, surgeon_id, room_id, equipment_needs, scheduled_start_time, scheduled_end_time, actual_start_time, actual_end_time, created_at, updated_at')
      .eq('tenant_id', tenantId)
      .order('scheduled_start_time', { ascending: true });

    if (error || !data) return [];

    return data.map((surgery) => ({
      id: surgery.id,
      tenantId: surgery.tenant_id,
      type: surgery.type,
      status: surgery.status,
      surgeonId: surgery.surgeon_id,
      roomId: surgery.room_id,
      equipmentNeeds: surgery.equipment_needs,
      scheduledStartTime: new Date(surgery.scheduled_start_time),
      scheduledEndTime: new Date(surgery.scheduled_end_time),
      actualStartTime: surgery.actual_start_time ? new Date(surgery.actual_start_time) : null,
      actualEndTime: surgery.actual_end_time ? new Date(surgery.actual_end_time) : null,
      createdAt: new Date(surgery.created_at),
      updatedAt: new Date(surgery.updated_at),
    }));
  }

  async create(data: CreateSurgeryData, userId: string, tenantId: string): Promise<Surgery> {
    const { data: createdSurgery, error } = await supabase
      .from('surgeries')
      .insert([{
        type: data.type,
        surgeonId: data.surgeonId,
        roomId: data.roomId,
        equipmentNeeds: data.equipmentNeeds,
        scheduledStartTime: data.scheduledStartTime,
        scheduledEndTime: data.scheduledEndTime,
        tenantId,
        createdById: userId,
      }])
      .select('id, tenant_id, type, status, surgeon_id, room_id, equipment_needs, scheduled_start_time, scheduled_end_time, actual_start_time, actual_end_time, created_at, updated_at')
      .single();

    if (error || !createdSurgery) throw error;

    return {
      id: createdSurgery.id,
      tenantId: createdSurgery.tenant_id,
      type: createdSurgery.type,
      status: createdSurgery.status,
      surgeonId: createdSurgery.surgeon_id,
      roomId: createdSurgery.room_id,
      equipmentNeeds: createdSurgery.equipment_needs,
      scheduledStartTime: new Date(createdSurgery.scheduled_start_time),
      scheduledEndTime: new Date(createdSurgery.scheduled_end_time),
      actualStartTime: createdSurgery.actual_start_time ? new Date(createdSurgery.actual_start_time) : null,
      actualEndTime: createdSurgery.actual_end_time ? new Date(createdSurgery.actual_end_time) : null,
      createdAt: new Date(createdSurgery.created_at),
      updatedAt: new Date(createdSurgery.updated_at),
    };
  }

  async update(id: string, data: UpdateSurgeryData, userId: string, tenantId: string): Promise<Surgery> {
    const { data: updatedSurgery, error } = await supabase
      .from('surgeries')
      .update([{
        id,
        type: data.type,
        surgeonId: data.surgeonId,
        roomId: data.roomId,
        equipmentNeeds: data.equipmentNeeds,
        scheduledStartTime: data.scheduledStartTime,
        scheduledEndTime: data.scheduledEndTime,
        updatedById: userId,
      }])
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('id, tenant_id, type, status, surgeon_id, room_id, equipment_needs, scheduled_start_time, scheduled_end_time, actual_start_time, actual_end_time, created_at, updated_at')
      .single();

    if (error || !updatedSurgery) throw error;

    return {
      id: updatedSurgery.id,
      tenantId: updatedSurgery.tenant_id,
      type: updatedSurgery.type,
      status: updatedSurgery.status,
      surgeonId: updatedSurgery.surgeon_id,
      roomId: updatedSurgery.room_id,
      equipmentNeeds: updatedSurgery.equipment_needs,
      scheduledStartTime: new Date(updatedSurgery.scheduled_start_time),
      scheduledEndTime: new Date(updatedSurgery.scheduled_end_time),
      actualStartTime: updatedSurgery.actual_start_time ? new Date(updatedSurgery.actual_start_time) : null,
      actualEndTime: updatedSurgery.actual_end_time ? new Date(updatedSurgery.actual_end_time) : null,
      createdAt: new Date(updatedSurgery.created_at),
      updatedAt: new Date(updatedSurgery.updated_at),
    };
  }
}