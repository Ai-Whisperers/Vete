import { NextResponse } from 'next/server';
import { getTodayAppointmentsForClinic } from '@/lib/appointments';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get('clinic');

  if (!clinic) {
    return NextResponse.json({ error: 'Clinic not provided' }, { status: 400 });
  }

  try {
    const data = await getTodayAppointmentsForClinic(clinic);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in /api/dashboard/today-appointments:", error);
    return NextResponse.json({ error: 'Failed to fetch today\'s appointments' }, { status: 500 });
  }
}