import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { MedicationDispensingWorkflow } from '@/components/MedicationDispensingWorkflow';
import { mockState, resetAllMocks, getSupabaseServerMock } from '@/lib/test-utils';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => getSupabaseServerMock());

// Mock auth wrapper
vi.mock('@/lib/auth', () => ({ getAuth: vi.fn(() => Promise.resolve({})) }));

describe('Medication Dispensing Workflow', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it('should render the medication dispensing workflow component', () => {
    const wrapper = render(<MedicationDispensingWorkflow prescriptionId={1} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should lookup the prescription', async () => {
    const wrapper = render(<MedicationDispensingWorkflow prescriptionId={1} />);
    await act(async () => {
      await wrapper.findByText('Lookup Prescription').click();
    });
    expect(getSupabaseServerMock().from).toHaveBeenCalledTimes(1);
    expect(getSupabaseServerMock().from).toHaveBeenCalledWith('prescriptions');
  });

  it('should check the inventory', async () => {
    const wrapper = render(<MedicationDispensingWorkflow prescriptionId={1} />);
    await act(async () => {
      await wrapper.findByText('Check Inventory').click();
    });
    expect(getSupabaseServerMock().from).toHaveBeenCalledTimes(1);
    expect(getSupabaseServerMock().from).toHaveBeenCalledWith('medications');
  });

  it('should dispense the medication', async () => {
    const wrapper = render(<MedicationDispensingWorkflow prescriptionId={1} />);
    await act(async () => {
      await wrapper.findByText('Dispense Medication').click();
    });
    expect(getSupabaseServerMock().from).toHaveBeenCalledTimes(1);
    expect(getSupabaseServerMock().from).toHaveBeenCalledWith('dispensations');
  });

  it('should print the label', async () => {
    const wrapper = render(<MedicationDispensingWorkflow prescriptionId={1} />);
    await act(async () => {
      await wrapper.findByText('Print Label').click();
    });
    // Implement label printing logic here
  });
});