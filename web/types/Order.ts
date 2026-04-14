interface Order {
  id: number;
  customer_id: number;
  status: string;
  created_at: string;
  total: number;
}

export { Order };