"use client";

import { useState } from "react";
import { useCart, CartItem } from "@/context/cart-context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ShoppingBag, Loader2, Check } from "lucide-react";
import { clsx } from "clsx";

interface AddToCartButtonProps {
  readonly item: Omit<CartItem, "quantity">;
  readonly quantity?: number;
  readonly className?: string;
  readonly iconOnly?: boolean;
  readonly label?: string;
  readonly addedLabel?: string;
}

export function AddToCartButton({ item, quantity = 1, className, iconOnly = false, label = "Agregar", addedLabel = "Agregado" }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    
    // Simulate network delay for effect or just add immediately
    setTimeout(() => {
        addItem(item, quantity);
        setLoading(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
    }, 500);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || success}
      className={clsx(
        "transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2",
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : success ? (
         iconOnly ? <Check className="w-5 h-5" /> : <> <Check className="w-4 h-4" /> <span>{addedLabel}</span> </>
      ) : (
         iconOnly ? <ShoppingBag className="w-5 h-5" /> : <> <ShoppingBag className="w-4 h-4" /> <span>{label}</span> </>
      )}
    </button>
  );
}
