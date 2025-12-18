"use client";

import { useState, useEffect } from "react";
import { CartDrawer, FloatingCartButton } from "./cart-drawer";
import { useCart } from "@/context/cart-context";

interface CartLayoutWrapperProps {
  /** Whether user is logged in (from server) */
  isLoggedIn: boolean;
}

/**
 * Cart Layout Wrapper
 *
 * Client component that manages cart drawer state and visibility.
 * Only shows cart UI for logged-in users.
 */
export function CartLayoutWrapper({ isLoggedIn }: CartLayoutWrapperProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything if not logged in or not mounted
  if (!mounted || !isLoggedIn) {
    return null;
  }

  return (
    <>
      {/* Floating Cart Button */}
      <FloatingCartButton onClick={() => setIsDrawerOpen(true)} />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
