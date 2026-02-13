import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// CSV row schema for patient import
const PatientCSVRowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  species: z.enum(['dog', 'cat', 'other']).default('dog'),
  breed: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.enum(['male', 'female', 'unknown']).default('unknown'),
  color: z.string().optional(),
  weight: z.string().optional(),
  microchip: z.string().optional(),
  owner_name: z.string().optional(),
  owner_phone: z.string().optional(),
  owner_email: z.string().optional(),
  notes: z.string().optional(),
})

type PatientCSVRow = z.infer<typeof PatientCSVRowSchema>

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const clinicId = formData.get('clinicId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      )
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are supported' },
        { status: 400 }
      )
    }

    // Read and parse CSV
    const fileContent = await file.text()
    const lines = fileContent.split('\n').filter(line => line.trim() !== '')
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must have at least a header and one data row' },
        { status: 400 }
      )
    }
    
    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim())
    
    // Parse data rows
    const records = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const record: Record<string, string> = {}
      for (let j = 0; j < headers.length; j++) {
        record[headers[j]] = values[j] || ''
      }
      records.push(record)
    }

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      )
    }

    // Validate and transform records
    const patients: PatientCSVRow[] = []
    const errors: { row: number; error: string }[] = []

    for (let i = 0; i < records.length; i++) {
      try {
        const row = records[i]
        
        // Map CSV columns to our schema
        const mappedRow = {
          name: row['Nombre'] || row['Name'] || row['nombre'] || row['name'] || '',
          species: (row['Especie'] || row['Species'] || row['especie'] || row['species'] || 'dog').toLowerCase(),
          breed: row['Raza'] || row['Breed'] || row['raza'] || row['breed'] || '',
          birth_date: row['Fecha de Nacimiento'] || row['Birth Date'] || row['fecha_nacimiento'] || row['birth_date'] || '',
          gender: (row['Género'] || row['Gender'] || row['genero'] || row['gender'] || 'unknown').toLowerCase(),
          color: row['Color'] || row['color'] || '',
          weight: row['Peso'] || row['Weight'] || row['peso'] || row['weight'] || '',
          microchip: row['Microchip'] || row['microchip'] || '',
          owner_name: row['Dueño'] || row['Owner'] || row['dueño'] || row['owner'] || row['Owner Name'] || '',
          owner_phone: row['Teléfono'] || row['Phone'] || row['telefono'] || row['phone'] || '',
          owner_email: row['Email'] || row['email'] || '',
          notes: row['Notas'] || row['Notes'] || row['notas'] || row['notes'] || '',
        }

        // Validate with Zod
        const validatedRow = PatientCSVRowSchema.parse(mappedRow)
        patients.push(validatedRow)
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({
            row: i + 2, // +2 because: 1 for header, 1 for 0-index
            error: error.errors[0].message,
          })
        } else {
          errors.push({
            row: i + 2,
            error: 'Invalid row format',
          })
        }
      }
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation errors',
          errors,
          validCount: patients.length,
          totalCount: records.length,
        },
        { status: 400 }
      )
    }

    // Insert patients into database
    const insertedPatients = []
    const insertionErrors = []

    for (const patient of patients) {
      try {
        // First, find or create owner
        let ownerId = null
        if (patient.owner_name || patient.owner_phone || patient.owner_email) {
          const { data: existingOwner } = await supabase
            .from('owners')
            .select('id')
            .or(`phone.eq.${patient.owner_phone},email.eq.${patient.owner_email}`)
            .single()

          if (existingOwner) {
            ownerId = existingOwner.id
          } else {
            const { data: newOwner, error: ownerError } = await supabase
              .from('owners')
              .insert({
                name: patient.owner_name || null,
                phone: patient.owner_phone || null,
                email: patient.owner_email || null,
                clinic_id: clinicId,
              })
              .select()
              .single()

            if (ownerError) throw ownerError
            ownerId = newOwner.id
          }
        }

        // Create patient
        const { data: newPatient, error: patientError } = await supabase
          .from('pets')
          .insert({
            name: patient.name,
            species: patient.species,
            breed: patient.breed || null,
            birth_date: patient.birth_date || null,
            gender: patient.gender,
            color: patient.color || null,
            weight: patient.weight ? parseFloat(patient.weight) : null,
            microchip: patient.microchip || null,
            owner_id: ownerId,
            clinic_id: clinicId,
            notes: patient.notes || null,
          })
          .select()
          .single()

        if (patientError) throw patientError
        insertedPatients.push(newPatient)
      } catch (error) {
        insertionErrors.push({
          patient: patient.name,
          error: error instanceof Error ? error.message : 'Insertion failed',
        })
      }
    }

    // Return results
    return NextResponse.json({
      success: true,
      summary: {
        total: records.length,
        valid: patients.length,
        inserted: insertedPatients.length,
        failed: insertionErrors.length,
      },
      insertedPatients: insertedPatients.slice(0, 10), // Return first 10 for preview
      errors: insertionErrors,
      message: `Imported ${insertedPatients.length} of ${records.length} patients successfully`,
    })

  } catch (error) {
    console.error('CSV import error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to download CSV template
export async function GET() {
  const template = `Nombre,Especie,Raza,Fecha de Nacimiento,Género,Color,Peso,Microchip,Dueño,Teléfono,Email,Notas
Firulais,perro,Golden Retriever,2023-05-15,macho,Dorado,28.5,1234567890,Juan Pérez,+595981123456,juan@email.com,Paciente regular
Luna,gato,Siames,2022-08-20,hembra,Blanco,4.2,,María González,+595982654321,maria@email.com,Alérgico a ciertos medicamentos
Max,perro,Labrador,2021-11-10,macho,Negro,32.0,0987654321,Carlos López,+595983789012,carlos@email.com,

Instrucciones:
1. Nombre: Nombre de la mascota (requerido)
2. Especie: perro, gato, u otro
3. Raza: Raza de la mascota (opcional)
4. Fecha de Nacimiento: YYYY-MM-DD (opcional)
5. Género: macho, hembra, desconocido
6. Color: Color principal (opcional)
7. Peso: Peso en kg (opcional)
8. Microchip: Número de microchip (opcional)
9. Dueño: Nombre del dueño (opcional)
10. Teléfono: Teléfono del dueño (opcional)
11. Email: Email del dueño (opcional)
12. Notas: Notas adicionales (opcional)

Nota: La primera fila debe contener los encabezados exactamente como se muestran arriba.
Los valores son sensibles a mayúsculas/minúsculas para campos como Especie y Género.`

  return new NextResponse(template, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="plantilla-pacientes-vete.csv"',
    },
  })
}