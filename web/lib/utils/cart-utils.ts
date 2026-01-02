import type { CartItem } from "@/context/cart-context";
import type { PetSizeCategory } from "./pet-size";

/**
 * Pet with associated services
 */
export interface PetServiceGroup {
  pet_id: string;
  pet_name: string;
  pet_size: PetSizeCategory;
  services: CartItem[];
  subtotal: number;
}

/**
 * Pet with associated products
 */
export interface PetProductGroup {
  pet_id: string;
  pet_name: string;
  products: CartItem[];
  subtotal: number;
}

/**
 * Organized cart structure
 * Display order: Services by pet → Products by pet → Unassigned products
 */
export interface OrganizedCart {
  /** Services grouped by pet (displayed first) */
  petGroups: PetServiceGroup[];
  servicesSubtotal: number;
  /** Services without pet assignment */
  ungroupedServices: CartItem[];
  /** Products grouped by pet */
  petProducts: PetProductGroup[];
  /** Products without pet assignment (displayed last) */
  unassignedProducts: CartItem[];
  productsSubtotal: number;
  /** Total items count */
  totalItems: number;
  /** Grand total */
  grandTotal: number;
}

/**
 * Organizes cart items into a structured format:
 * - Services grouped by pet (top)
 * - Products grouped by pet (if pet_id is assigned)
 * - Unassigned products (bottom)
 */
export function organizeCart(items: CartItem[]): OrganizedCart {
  const servicesByPet: Map<string, PetServiceGroup> = new Map();
  const productsByPet: Map<string, PetProductGroup> = new Map();
  const ungroupedServices: CartItem[] = [];
  const unassignedProducts: CartItem[] = [];

  let productsSubtotal = 0;
  let servicesSubtotal = 0;

  for (const item of items) {
    if (item.type === "product") {
      productsSubtotal += item.price * item.quantity;

      if (item.pet_id && item.pet_name) {
        // Group product by pet
        const existing = productsByPet.get(item.pet_id);
        if (existing) {
          existing.products.push(item);
          existing.subtotal += item.price * item.quantity;
        } else {
          productsByPet.set(item.pet_id, {
            pet_id: item.pet_id,
            pet_name: item.pet_name,
            products: [item],
            subtotal: item.price * item.quantity
          });
        }
      } else {
        // Product without pet assignment (displayed at bottom)
        unassignedProducts.push(item);
      }
    } else if (item.type === "service") {
      servicesSubtotal += item.price * item.quantity;

      if (item.pet_id && item.pet_name && item.pet_size) {
        // Group service by pet
        const existing = servicesByPet.get(item.pet_id);
        if (existing) {
          existing.services.push(item);
          existing.subtotal += item.price * item.quantity;
        } else {
          servicesByPet.set(item.pet_id, {
            pet_id: item.pet_id,
            pet_name: item.pet_name,
            pet_size: item.pet_size as PetSizeCategory,
            services: [item],
            subtotal: item.price * item.quantity
          });
        }
      } else {
        // Service without pet assignment
        ungroupedServices.push(item);
      }
    }
  }

  // Convert maps to arrays sorted by pet name
  const petGroups = Array.from(servicesByPet.values()).sort((a, b) =>
    a.pet_name.localeCompare(b.pet_name)
  );

  const petProducts = Array.from(productsByPet.values()).sort((a, b) =>
    a.pet_name.localeCompare(b.pet_name)
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    petGroups,
    servicesSubtotal,
    ungroupedServices,
    petProducts,
    unassignedProducts,
    productsSubtotal,
    totalItems,
    grandTotal: productsSubtotal + servicesSubtotal
  };
}
