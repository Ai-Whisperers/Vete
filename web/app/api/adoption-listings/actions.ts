import { useServer } from 'next/server';
import { AdoptionListingService } from '@/lib/domain/core/adoption-listings/service';
import { createClient } from '@/lib/supabase/client';

export async function POST({ request }) {
  const supabase = createClient();
  const service = new AdoptionListingService(supabase);

  const data = await request.json();
  const userId = 'current-user-id'; // Replace with actual user ID
  const tenantId = 'current-tenant-id'; // Replace with actual tenant ID

  try {
    const listing = await service.createAdoptionListing(data, userId, tenantId);
    return new Response(JSON.stringify(listing), { status: 201 });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}

export async function PATCH({ request, params }) {
  const supabase = createClient();
  const service = new AdoptionListingService(supabase);

  const id = params.id;
  const data = await request.json();
  const userId = 'current-user-id'; // Replace with actual user ID
  const tenantId = 'current-tenant-id'; // Replace with actual tenant ID

  try {
    const listing = await service.updateAdoptionListing(id, data, userId, tenantId);
    return new Response(JSON.stringify(listing), { status: 200 });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}

export async function GET({ request, params }) {
  const supabase = createClient();
  const service = new AdoptionListingService(supabase);

  const filters: any = request.url.searchParams;
  const tenantId = 'current-tenant-id'; // Replace with actual tenant ID

  try {
    const listings = await service.getAdoptionListings(filters, tenantId);
    return new Response(JSON.stringify(listings), { status: 200 });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}

### Database Schema

CREATE TABLE adoption_listings (
  id UUID PRIMARY KEY,
  pet_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tenant_id UUID NOT NULL,
  FOREIGN KEY (pet_id) REFERENCES pets (id),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id)
);