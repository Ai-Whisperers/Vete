import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Invoice } from '../types/Invoice';
import { Appointment } from '../types/Appointment';

const InvoiceGenerator = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoice, setInvoice] = useState<Invoice>({});
  const [manualLineItems, setManualLineItems] = useState<any[]>([]);

  const generateInvoice = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'completed');

    if (error) {
      console.error(error);
    } else {
      setAppointments(data);
    }
  };

  const addManualLineItem = () => {
    setManualLineItems([...manualLineItems, { description: '', quantity: 0, price: 0 }]);
  };

  const removeManualLineItem = (index: number) => {
    setManualLineItems(manualLineItems.filter((item, i) => i !== index));
  };

  const updateManualLineItem = (index: number, item: any) => {
    setManualLineItems(
      manualLineItems.map((existingItem, i) => (i === index ? item : existingItem))
    );
  };

  const generatePdf = async () => {
    // Generate PDF logic here
  };

  const sendViaEmail = async () => {
    // Send via email logic here
  };

  return (
    <div>
      <h1>Invoice Generator</h1>
      <button onClick={generateInvoice}>Generate Invoice</button>
      <ul>
        {appointments.map((appointment) => (
          <li key={appointment.id}>{appointment.client_name}</li>
        ))}
      </ul>
      <h2>Manual Line Items</h2>
      <button onClick={addManualLineItem}>Add Line Item</button>
      <ul>
        {manualLineItems.map((item, index) => (
          <li key={index}>
            <input
              type="text"
              value={item.description}
              onChange={(e) => updateManualLineItem(index, { ...item, description: e.target.value })}
            />
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => updateManualLineItem(index, { ...item, quantity: parseInt(e.target.value) })}
            />
            <input
              type="number"
              value={item.price}
              onChange={(e) => updateManualLineItem(index, { ...item, price: parseFloat(e.target.value) })}
            />
            <button onClick={() => removeManualLineItem(index)}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={generatePdf}>Generate PDF</button>
      <button onClick={sendViaEmail}>Send via Email</button>
    </div>
  );
};

export default InvoiceGenerator;