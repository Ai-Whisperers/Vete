import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

interface DataExportProps {
  userId: number;
}

const DataExport: React.FC<DataExportProps> = ({ userId }) => {
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId);

      if (error) {
        console.error(error);
      } else {
        const userData = data[0];
        const exportData = {
          user: userData,
          appointments: await getAppointments(userId),
          invoices: await getInvoices(userId),
          pets: await getPets(userId),
        };

        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-data-${userId}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const getAppointments = async (userId: number) => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error(error);
    }
    return data;
  };

  const getInvoices = async (userId: number) => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error(error);
    }
    return data;
  };

  const getPets = async (userId: number) => {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error(error);
    }
    return data;
  };

  return (
    <button onClick={handleExport} disabled={exporting}>
      {exporting ? 'Exporting...' : 'Export Data'}
    </button>
  );
};

export default DataExport;