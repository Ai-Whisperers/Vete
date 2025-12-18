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
 * Organized cart structure
 */
export interface OrganizedCart {
  /** Products being purchased (for the owner) */
  products: CartItem[];
  productsSubtotal: number;
  /** Services grouped by pet */
  petGroups: PetServiceGroup[];
  servicesSubtotal: number;
  /** Services without pet assignment */
  ungroupedServices: CartItem[];
  /** Total items count */
  totalItems: number;
  /** Grand total */
  grandTotal: number;
}

/**
 * Organizes cart items into a structured format:
 * - Products (for owner)
 * - Services grouped by pet
 */
export function organizeCart(items: CartItem[]): OrganizedCart {
  const products: CartItem[] = [];
  const servicesByPet: Map<string, PetServiceGroup> = new Map();
  const ungroupedServices: CartItem[] = [];

  let productsSubtotal = 0;
  let servicesSubtotal = 0;

  for (const item of items) {
    if (item.type === "product") {
      products.push(item);
      productsSubtotal += item.price * item.quantity;
    } else if (item.type === "service") {
      servicesSubtotal += item.price * item.quantity;

      if (item.pet_id && item.pet_name && item.pet_size) {
        // Group by pet
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

  // Convert map to array sorted by pet name
  const petGroups = Array.from(servicesByPet.values()).sort((a, b) =>
    a.pet_name.localeCompare(b.pet_name)
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    products,
    productsSubtotal,
    petGroups,
    servicesSubtotal,
    ungroupedServices,
    totalItems,
    grandTotal: productsSubtotal + servicesSubtotal
  };
}
