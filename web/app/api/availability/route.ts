import { NextResponse } from 'next/server';

// This is a placeholder for a real-world database or complex business logic
const MOCK_AVAILABLE_SLOTS = [
  { date: '2025-12-28', time: '09:00' },
  { date: '2025-12-28', time: '10:00' },
  { date: '2025-12-28', time: '11:00' },
  { date: '2025-12-29', time: '14:00' },
  { date: '2025-12-29', time: '15:00' },
  { date: '2025-12-30', time: '09:00' },
  { date: '2025-12-30', time: '10:00' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const serviceId = searchParams.get('serviceId'); // Not used in mock, but for completeness

  console.log('[API/Availability] Request received.');
  console.log('[API/Availability] Filters:', { startDate, endDate, serviceId });

  // Simulate network latency or complex calculations
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100)); // 100-600ms delay

  const filteredSlots = MOCK_AVAILABLE_SLOTS.filter(slot => {
    const slotDate = new Date(slot.date);
    const startFilterDate = startDate ? new Date(startDate) : null;
    const endFilterDate = endDate ? new Date(endDate) : null;

    let pass = true;
    if (startFilterDate && slotDate < startFilterDate) pass = false;
    if (endFilterDate && slotDate > endFilterDate) pass = false;

    return pass;
  });

  console.log(`[API/Availability] Returning ${filteredSlots.length} available slots.`);
  return NextResponse.json(filteredSlots, { status: 200 });
}