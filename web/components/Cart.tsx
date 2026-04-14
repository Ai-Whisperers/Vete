import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSession } from '../hooks/useSession';

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    name: string;
    price: number;
  };
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [session] = useSession();

  useEffect(() => {
    if (session) {
      fetchCartItems();
    }
  }, [session]);

  const fetchCartItems = async () => {
    const { data, error } = await supabase
      .from('cart_items')
      .select('id, product_id, quantity, product(name, price)')
      .eq('user_id', session.user.id);

    if (error) {
      console.error(error);
    } else {
      setCartItems(data);
    }
  };

  const handleAddItem = async (productId: number) => {
    const { data, error } = await supabase
      .from('cart_items')
      .insert([{ user_id: session.user.id, product_id: productId, quantity: 1 }]);

    if (error) {
      console.error(error);
    } else {
      fetchCartItems();
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error(error);
    } else {
      fetchCartItems();
    }
  };

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ id: itemId, quantity: quantity });

    if (error) {
      console.error(error);
    } else {
      fetchCartItems();
    }
  };

  const handleCheckout = async () => {
    // Implement checkout logic here
  };

  return (
    <div>
      <h1>Cart</h1>
      <ul>
        {cartItems.map((item) => (
          <li key={item.id}>
            {item.product.name} x {item.quantity}
            <button onClick={() => handleRemoveItem(item.id)}>Remove</button>
            <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>+</button>
            <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>-</button>
          </li>
        ))}
      </ul>
      <button onClick={handleCheckout}>Checkout</button>
    </div>
  );
};

export default Cart;