"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import type { PetSizeCategory } from "@/lib/utils/pet-size";

export type CartItemType = "service" | "product";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  type: CartItemType;
  quantity: number;
  image_url?: string;
  description?: string;
  stock?: number; // Available stock for validation

  // Product-specific fields (optional)
  sku?: string;
  variant_id?: string;

  // Service-specific fields (optional)
  pet_id?: string;
  pet_name?: string;
  pet_size?: PetSizeCategory;
  service_id?: string;
  variant_name?: string;
  base_price?: number;
}

// (Removed AddToCartButtonProps interface; it belongs in its own component file)

/**
 * Generates a unique cart item ID
 * For services with pets: service_id-pet_id-variant_name
 * For products: product-id
 */
export function generateCartItemId(item: Omit<CartItem, "quantity" | "id"> & { id?: string }): string {
  if (item.type === "service" && item.pet_id && item.service_id) {
    return `${item.service_id}-${item.pet_id}-${item.variant_name || "default"}`;
  }
  return item.id || `unknown-${Date.now()}`;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  discount: number;
  setDiscount: (value: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { readonly children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("vete_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("vete_cart", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addItem = (newItem: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setItems((prev) => {
      // Generate unique ID for the item
      const itemId = generateCartItemId(newItem);
      const itemWithId = { ...newItem, id: itemId };

      // Find existing item by id
      const existing = prev.find((i) => i.id === itemId);

      if (existing) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...itemWithId, quantity }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (!existing) return prev;
      
      const newQuantity = existing.quantity + delta;
      if (newQuantity <= 0) {
        return prev.filter((i) => i.id !== id);
      }
      
      return prev.map((i) => 
        i.id === id ? { ...i, quantity: newQuantity } : i
      );
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // The useMemo hook for contextValue is already present and correct.
  const contextValue = useMemo(() => ({ 
    items, addItem, updateQuantity, removeItem, clearCart, total, itemCount, 
    discount, setDiscount 
  }), [items, total, itemCount, discount]);
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
