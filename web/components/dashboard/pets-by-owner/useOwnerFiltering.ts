import { useMemo } from "react";
import type { Owner } from "./types";

export function useOwnerFiltering(owners: Owner[], searchQuery: string) {
  const filteredOwners = useMemo(() => {
    if (!searchQuery.trim()) return owners;
    const query = searchQuery.toLowerCase();
    return owners.filter(
      (owner) =>
        owner.full_name.toLowerCase().includes(query) ||
        owner.email.toLowerCase().includes(query) ||
        owner.phone?.toLowerCase().includes(query) ||
        owner.pets.some(
          (pet) =>
            pet.name.toLowerCase().includes(query) ||
            pet.species.toLowerCase().includes(query) ||
            pet.breed?.toLowerCase().includes(query)
        )
    );
  }, [owners, searchQuery]);

  return filteredOwners;
}
