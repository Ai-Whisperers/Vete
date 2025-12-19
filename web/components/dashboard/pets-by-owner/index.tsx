"use client";

import { useState } from "react";
import type { PetsByOwnerProps } from "./types";
import { useOwnerFiltering } from "./useOwnerFiltering";
import { SearchHeader } from "./SearchHeader";
import { OwnerList } from "./OwnerList";
import { OwnerDetailsCard } from "./OwnerDetailsCard";
import { PetsSection } from "./PetsSection";
import { EmptyState } from "./EmptyState";

export function PetsByOwner({ clinic, owners }: PetsByOwnerProps): React.ReactElement {
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(
    owners.length > 0 ? owners[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOwners = useOwnerFiltering(owners, searchQuery);
  const selectedOwner = filteredOwners.find((o) => o.id === selectedOwnerId) || filteredOwners[0] || null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
      {/* Left Panel - Owner List */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <SearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          resultCount={filteredOwners.length}
        />

        <div className="flex-1 overflow-y-auto">
          <OwnerList
            owners={filteredOwners}
            selectedOwnerId={selectedOwnerId}
            onSelectOwner={setSelectedOwnerId}
            searchQuery={searchQuery}
          />
        </div>
      </div>

      {/* Right Panel - Owner Details & Pets */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
        {selectedOwner ? (
          <>
            <OwnerDetailsCard owner={selectedOwner} clinic={clinic} />
            <PetsSection owner={selectedOwner} clinic={clinic} />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
