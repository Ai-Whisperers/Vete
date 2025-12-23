import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This endpoint is only available in development/testing environments
// It allows seeding data via API without authentication for testing purposes

export async function POST(request: NextRequest) {
  try {
    // Only allow in development/testing
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Setup endpoint not available in production' },
        { status: 403 }
      )
    }

    // Use service role to bypass RLS
    const supabase = await createClient('service_role')

    // Get the request body
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'create_tenant':
        return await createTenant(supabase, data)
      case 'create_profile':
        return await createProfile(supabase, data)
      case 'create_pet':
        return await createPet(supabase, data)
      case 'create_service':
        return await createService(supabase, data)
      case 'create_payment_method':
        return await createPaymentMethod(supabase, data)
      case 'create_kennel':
        return await createKennel(supabase, data)
      case 'create_qr_tag':
        return await createQrTag(supabase, data)
      case 'create_appointment':
        return await createAppointment(supabase, data)
      case 'create_hospitalization':
        return await createHospitalization(supabase, data)
      case 'create_medical_record':
        return await createMedicalRecord(supabase, data)
      case 'create_vaccine':
        return await createVaccine(supabase, data)
      case 'bulk_seed':
        return await bulkSeed(supabase, data)
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Setup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

async function createTenant(supabase: any, data: any) {
  const { data: tenant, error } = await supabase
    .from('tenants')
    .insert([data])
    .select()
    .single()

  if (error) {
    console.error('Error creating tenant:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(tenant)
}

async function createProfile(supabase: any, data: any) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert([data])
    .select()
    .single()

  if (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(profile)
}

async function createPet(supabase: any, data: any) {
  const { data: pet, error } = await supabase
    .from('pets')
    .insert([data])
    .select()
    .single()

  if (error) {
    console.error('Error creating pet:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(pet)
}

async function createService(supabase: any, data: any) {
  const { data: service, error } = await supabase
    .from('services')
    .insert([data])
    .select()
    .single()

  if (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(service)
}

async function createPaymentMethod(supabase: any, data: any) {
  const { data: paymentMethod, error } = await supabase
    .from('payment_methods')
    .insert([data])
    .select()
    .single()

  if (error) {
    console.error('Error creating payment method:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(paymentMethod)
}

async function createKennel(supabase: any, data: any) {
  const { data: kennel, error } = await supabase
    .from('kennels')
    .insert([data])
    .select()
    .single()

  if (error) {
    console.error('Error creating kennel:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(kennel)
}

async function createQrTag(supabase: any, data: any) {
  const { data: qrTag, error } = await supabase
    .from('qr_tags')
    .insert([data])
    .select()
    .single()

  if (error) {
    console.error('Error creating QR tag:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(qrTag)
}

async function createAppointment(supabase: any, data: any) {
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert([data])
    .select()
    .single()

  if (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(appointment)
}

async function createHospitalization(supabase: any, data: any) {
  const { data: hospitalization, error } = await supabase
    .from('hospitalizations')
    .insert([data])
    .select()
    .single()

  if (error) {
    console.error('Error creating hospitalization:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(hospitalization)
}

async function createMedicalRecord(supabase: any, data: any) {
  const { data: record, error } = await supabase
    .from('medical_records')
    .insert([data])
    .select()
    .single()

  if (error) {
    console.error('Error creating medical record:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(record)
}

async function createVaccine(supabase: any, data: any) {
  const { data: vaccine, error } = await supabase
    .from('vaccines')
    .insert([data])
    .select()
    .single()

  if (error) {
    console.error('Error creating vaccine:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(vaccine)
}

async function bulkSeed(supabase: any, data: any) {
  const results = {
    tenants: [],
    profiles: [],
    pets: [],
    services: [],
    appointments: [],
    medical_records: [],
    vaccines: [],
    hospitalizations: [],
    errors: []
  }

  try {
    // Create tenants
    if (data.tenants) {
      for (const tenant of data.tenants) {
        try {
          const result = await createTenant(supabase, tenant)
          if (result.status === 200) {
            results.tenants.push(await result.json())
          } else {
            results.errors.push(`Tenant creation failed: ${tenant.id}`)
          }
        } catch (error) {
          results.errors.push(`Tenant ${tenant.id}: ${error}`)
        }
      }
    }

    // Create profiles
    if (data.profiles) {
      for (const profile of data.profiles) {
        try {
          const result = await createProfile(supabase, profile)
          if (result.status === 200) {
            results.profiles.push(await result.json())
          } else {
            results.errors.push(`Profile creation failed: ${profile.email}`)
          }
        } catch (error) {
          results.errors.push(`Profile ${profile.email}: ${error}`)
        }
      }
    }

    // Create pets
    if (data.pets) {
      for (const pet of data.pets) {
        try {
          const result = await createPet(supabase, pet)
          if (result.status === 200) {
            results.pets.push(await result.json())
          } else {
            results.errors.push(`Pet creation failed: ${pet.name}`)
          }
        } catch (error) {
          results.errors.push(`Pet ${pet.name}: ${error}`)
        }
      }
    }

    // Create services
    if (data.services) {
      for (const service of data.services) {
        try {
          const result = await createService(supabase, service)
          if (result.status === 200) {
            results.services.push(await result.json())
          } else {
            results.errors.push(`Service creation failed: ${service.name}`)
          }
        } catch (error) {
          results.errors.push(`Service ${service.name}: ${error}`)
        }
      }
    }

    // Create appointments
    if (data.appointments) {
      for (const appointment of data.appointments) {
        try {
          const result = await createAppointment(supabase, appointment)
          if (result.status === 200) {
            results.appointments.push(await result.json())
          } else {
            results.errors.push(`Appointment creation failed`)
          }
        } catch (error) {
          results.errors.push(`Appointment: ${error}`)
        }
      }
    }

    // Create medical records
    if (data.medical_records) {
      for (const record of data.medical_records) {
        try {
          const result = await createMedicalRecord(supabase, record)
          if (result.status === 200) {
            results.medical_records.push(await result.json())
          } else {
            results.errors.push(`Medical record creation failed`)
          }
        } catch (error) {
          results.errors.push(`Medical record: ${error}`)
        }
      }
    }

    // Create vaccines
    if (data.vaccines) {
      for (const vaccine of data.vaccines) {
        try {
          const result = await createVaccine(supabase, vaccine)
          if (result.status === 200) {
            results.vaccines.push(await result.json())
          } else {
            results.errors.push(`Vaccine creation failed`)
          }
        } catch (error) {
          results.errors.push(`Vaccine: ${error}`)
        }
      }
    }

    // Create hospitalizations
    if (data.hospitalizations) {
      for (const hospitalization of data.hospitalizations) {
        try {
          const result = await createHospitalization(supabase, hospitalization)
          if (result.status === 200) {
            results.hospitalizations.push(await result.json())
          } else {
            results.errors.push(`Hospitalization creation failed`)
          }
        } catch (error) {
          results.errors.push(`Hospitalization: ${error}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        tenants_created: results.tenants.length,
        profiles_created: results.profiles.length,
        pets_created: results.pets.length,
        services_created: results.services.length,
        appointments_created: results.appointments.length,
        medical_records_created: results.medical_records.length,
        vaccines_created: results.vaccines.length,
        hospitalizations_created: results.hospitalizations.length,
        errors_count: results.errors.length
      }
    })

  } catch (error) {
    console.error('Bulk seed error:', error)
    return NextResponse.json(
      { error: 'Bulk seed failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Only allow in development/testing
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Setup endpoint not available in production' },
        { status: 403 }
      )
    }

    // Use service role to bypass RLS
    const supabase = await createClient('service_role')

    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenant_id parameter is required' },
        { status: 400 }
      )
    }

    return await clearTenantData(supabase, tenantId)

  } catch (error) {
    console.error('Clear tenant data error:', error)
    return NextResponse.json(
      { error: 'Clear tenant data failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE FUNCTIONS (Clear Tenant Data)
// ============================================================================

async function clearTenantData(supabase: any, tenantId: string) {
  console.log(`🧹 Clearing all data for tenant: ${tenantId}`)

  // Delete in reverse dependency order to avoid foreign key violations
  const deleteOperations = [
    // Store data (products, categories, brands can be deleted in any order as they don't reference clinic data)
    { table: 'store_tenant_products', condition: { tenant_id: tenantId } },
    { table: 'store_products', condition: { tenant_id: tenantId } },
    { table: 'store_categories', condition: { tenant_id: tenantId } },
    { table: 'store_brands', condition: { tenant_id: tenantId } },

    // Appointments and related clinical data
    { table: 'appointments', condition: { tenant_id: tenantId } },
    { table: 'hospitalizations', condition: { tenant_id: tenantId } },
    { table: 'vaccines', condition: { tenant_id: tenantId } },
    { table: 'medical_records', condition: { tenant_id: tenantId } },

    // Services and related
    { table: 'services', condition: { tenant_id: tenantId } },
    { table: 'payment_methods', condition: { tenant_id: tenantId } },
    { table: 'kennels', condition: { tenant_id: tenantId } },
    { table: 'qr_tags', condition: { tenant_id: tenantId } },

    // Pets and profiles (clinic-specific data)
    { table: 'clinic_pets', condition: { tenant_id: tenantId } },
    { table: 'clinic_profiles', condition: { tenant_id: tenantId } },

    // Global entities that belong to this tenant (if they reference tenant_id)
    // Note: profiles and pets are global, so we only delete the clinic associations above
  ]

  let totalDeleted = 0

  for (const operation of deleteOperations) {
    try {
      const { data, error } = await supabase
        .from(operation.table)
        .delete()
        .match(operation.condition)
        .select('id')

      if (error) {
        console.error(`❌ Error deleting from ${operation.table}:`, error)
        continue
      }

      const deletedCount = data?.length || 0
      totalDeleted += deletedCount

      if (deletedCount > 0) {
        console.log(`   🗑️  Deleted ${deletedCount} records from ${operation.table}`)
      }

    } catch (error) {
      console.error(`❌ Failed to delete from ${operation.table}:`, error)
    }
  }

  console.log(`✅ Cleared ${totalDeleted} records total for tenant ${tenantId}`)

  return NextResponse.json({
    success: true,
    message: `Cleared ${totalDeleted} records for tenant ${tenantId}`,
    total_deleted: totalDeleted
  })
}
