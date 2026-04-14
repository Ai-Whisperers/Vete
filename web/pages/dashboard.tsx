import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import PaymentHistory from '../components/PaymentHistory';

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <PaymentHistory />
    </div>
  );
};

export default Dashboard;