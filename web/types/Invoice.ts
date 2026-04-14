interface Invoice {
  id: number;
  client_id: number;
  appointment_id: number;
  date: string;
  total: number;
  line_items: any[];
}

export default Invoice;