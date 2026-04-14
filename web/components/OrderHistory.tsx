import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Order } from '../types/Order';

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', supabase.auth.user()?.id);
    if (error) {
      console.error(error);
    } else {
      setOrders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <h1>Order History</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id}>
              <OrderDetails order={order} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const OrderDetails = ({ order }: { order: Order }) => {
  return (
    <div>
      <h2>Order {order.id}</h2>
      <p>Status: {order.status}</p>
      <p>Date: {order.created_at}</p>
      <p>Total: {order.total}</p>
      <button onClick={() => handleReorder(order)}>Reorder</button>
    </div>
  );
};

const handleReorder = async (order: Order) => {
  // Implement reorder logic here
};

export default OrderHistory;