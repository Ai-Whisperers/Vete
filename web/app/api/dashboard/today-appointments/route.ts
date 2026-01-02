import { NextResponse } from 'next/server';
import { getTodayAppointmentsForClinic } from '@/lib/appointments';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get('clinic');

  if (!clinic) {
    return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
      details: { field: 'clinic' }
    });
  }

  try {
    const data = await getTodayAppointmentsForClinic(clinic);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in /api/dashboard/today-appointments:", error);
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: error instanceof Error ? error.message : 'Unknown error' }
    });
  }
}