'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Pet {
  id: string
  name: string
  breed?: string
  age?: number
}

export default function OwnerPetsPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchPets = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/') // back to login if not authenticated
        return
      }
      const { data, error } = await supabase
        .from('pets')
        .select('id, name, breed, age')
        .eq('owner_id', session.user.id)
      if (error) {
        console.error('Error loading pets', error)
      } else {
        setPets(data as Pet[])
      }
      setLoading(false)
    }
    fetchPets()
  }, [])

  if (loading) return <p className="p-4">Loading...</p>

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">My Pets</h1>
      {pets.length === 0 ? (
        <p>No pets found.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <li key={pet.id} className="rounded border bg-white p-4 shadow">
              <h2 className="text-xl font-semibold">{pet.name}</h2>
              {pet.breed && <p>Breed: {pet.breed}</p>}
              {pet.age && <p>Age: {pet.age} years</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
