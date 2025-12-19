export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  date_of_birth: string | null;
  photo_url: string | null;
  sex: string | null;
  neutered: boolean | null;
  microchip_id: string | null;
}

export interface Owner {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  last_visit: string | null;
  pets: Pet[];
}

export interface PetsByOwnerProps {
  clinic: string;
  owners: Owner[];
}
