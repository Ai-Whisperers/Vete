import { useState, useEffect } from 'react'
import { useCart } from '@/context/cart-context'
import { CartService } from '@/domain/cart/service'
import { createClient } from '@/lib/supabase/client'

export default function CartPage() {
  const [cart, setCart] = useState(null)
  const { items, addItem, removeItem } = useCart()

  const supabase = createClient()
  const cartService = new CartService(supabase)

  useEffect(() => {
    const fetchCart = async () => {
      const cart = await cartService.getCart('tenant-123', 'user-123')
      setCart(cart)
    }

    fetchCart()
  }, [])

  const handleAddItem = async (item: any) => {
    await cartService.updateCart({ items: [...items, item] }, 'user-123')
    setCart(await cartService.getCart('tenant-123', 'user-123'))
  }

  const handleRemoveItem = async (itemId: string) => {
    await cartService.updateCart({ items: items.filter((item) => item.id !== itemId) }, 'user-123')
    setCart(await cartService.getCart('tenant-123', 'user-123'))
  }

  return (
    <div>
      <h1>Cart</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} x {item.quantity}
            <button onClick={() => handleRemoveItem(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={() => handleAddItem({ id: 'new-item', name: 'New Item', quantity: 1 })}>
        Add Item
      </button>
    </div>
  )
}