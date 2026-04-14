import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Order } from '../types/Order';

const OrderDetails = ({ orderId }: { orderId: number }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId);
    if (error) {
      console.error(error);
    } else {
      setOrder(data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        order && (
          <div>
            <h2>Order {order.id}</h2>
            <p>Status: {order.status}</p>
            <p>Date: {order.created_at}</p>
            <p>Total: {order.total}</p>
            <button onClick={() => handleReorder(order)}>Reorder</button>
          </div>
        )
      )}
    </div>
  );
};

const handleReorder = async (order: Order) => {
  // Implement reorder logic here
};

export default OrderDetails;