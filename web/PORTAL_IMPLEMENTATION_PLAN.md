# Plan de Implementación - Portal de Mascotas

## Resumen de Decisiones

| Aspecto | Decisión |
|---------|----------|
| Objetivo portal | Info completa + gestión citas/vacunas + historial médico |
| Historial médico | Completo con diagnósticos, tratamientos y documentos |
| Rediseño | Layout, cards y navegación (confías en mi criterio) |
| DB Tables | Solo diseño ahora, crear después |
| Campos nuevos | Todos opcionales |
| Timeline | Desarrollo completo, sin prisa |

---

## FASE 1: Esquemas de Base de Datos (Solo Diseño)

### 1.1 Tabla `medical_records`
```sql
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  pet_id UUID NOT NULL REFERENCES pets(id),
  vet_id UUID REFERENCES profiles(id),
  appointment_id UUID REFERENCES appointments(id),

  -- Tipo y fecha
  record_type TEXT NOT NULL, -- 'consultation', 'surgery', 'emergency', 'checkup', 'vaccination'
  record_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Contenido clínico
  chief_complaint TEXT,           -- Motivo de consulta
  diagnosis TEXT,                 -- Diagnóstico
  diagnosis_code TEXT,            -- Código VeNom/SNOMED
  treatment TEXT,                 -- Tratamiento indicado
  prognosis TEXT,                 -- Pronóstico

  -- Signos vitales (JSONB)
  vital_signs JSONB,              -- {weight_kg, temperature_c, heart_rate, respiratory_rate, pain_score}

  -- Notas
  clinical_notes TEXT,            -- Notas del veterinario
  internal_notes TEXT,            -- Notas internas (no visibles para owner)

  -- Archivos
  attachments TEXT[],             -- URLs de archivos adjuntos

  -- Seguimiento
  follow_up_date DATE,
  follow_up_notes TEXT,

  -- Metadata
  is_visible_to_owner BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.2 Tabla `prescriptions`
```sql
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  pet_id UUID NOT NULL REFERENCES pets(id),
  vet_id UUID NOT NULL REFERENCES profiles(id),
  medical_record_id UUID REFERENCES medical_records(id),

  -- Número de receta
  prescription_number TEXT UNIQUE,

  -- Medicamentos (JSONB array)
  medications JSONB NOT NULL,     -- [{name, dose, frequency, duration, route, instructions, quantity}]

  -- Validez
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,

  -- Estado
  status TEXT DEFAULT 'active',   -- 'active', 'dispensed', 'expired', 'cancelled'

  -- Firma digital
  vet_signature_url TEXT,
  vet_license_number TEXT,

  -- Notas
  general_instructions TEXT,
  warnings TEXT,

  -- PDF generado
  pdf_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.3 Tabla `pet_documents`
```sql
CREATE TABLE pet_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  pet_id UUID NOT NULL REFERENCES pets(id),
  uploaded_by UUID NOT NULL REFERENCES profiles(id),

  -- Archivo
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,                 -- 'image', 'pdf', 'other'
  file_size_bytes INTEGER,

  -- Categoría
  category TEXT,                  -- 'xray', 'lab_result', 'certificate', 'other'
  description TEXT,

  -- Relaciones opcionales
  medical_record_id UUID REFERENCES medical_records(id),

  -- Metadata
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.4 Nuevos campos para `pets`
```sql
ALTER TABLE pets ADD COLUMN IF NOT EXISTS
  adoption_date DATE,
  breeder_name TEXT,
  breeder_contact TEXT,
  pedigree_number TEXT,
  primary_vet_name TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT;
```

---

## FASE 2: Rediseño de Lista de Mascotas

### Cambios en `/portal/pets`

**Card de mascota mejorada:**
```
┌─────────────────────────────────────────────────────────┐
│  [FOTO]   Nombre                    🔴 2 vacunas vencidas│
│           Raza • 3 años, 2 meses                        │
│           ─────────────────────────                     │
│           📅 Última visita: 15 dic 2024                 │
│           📌 Próxima cita: 20 ene 2025 - Consulta       │
│           ⚠️ Condición: Alergia alimentaria             │
│                                        [Ver perfil →]   │
└─────────────────────────────────────────────────────────┘
```

**Indicadores a agregar:**
- Edad calculada (años, meses)
- Badge de vacunas (verde/amarillo/rojo)
- Última visita con fecha
- Próxima cita (si existe)
- Alerta de condiciones crónicas

---

## FASE 3: Rediseño de Detalle de Mascota

### Nuevo layout `/portal/pets/[id]`

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER - Foto grande + Info básica + Acciones               │
│ [Foto]  NOMBRE  |  Raza • Edad  |  [Editar] [Agendar] [PDF] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐  ┌────────────────────────────────┐│
│  │ NAVEGACIÓN TABS     │  │                                ││
│  │ • Resumen           │  │     CONTENIDO DEL TAB          ││
│  │ • Historial Médico  │  │                                ││
│  │ • Vacunas           │  │                                ││
│  │ • Documentos        │  │                                ││
│  │ • Citas             │  │                                ││
│  │ • Finanzas          │  │                                ││
│  └─────────────────────┘  └────────────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Tabs propuestos:

1. **Resumen** - Vista general con widgets
2. **Historial Médico** - Timeline de consultas y tratamientos
3. **Vacunas** - Calendario de vacunas con estados
4. **Documentos** - Galería de archivos subidos
5. **Citas** - Historial completo de citas
6. **Finanzas** - Pagos, facturas, puntos

---

## FASE 4: Componentes a Crear/Modificar

### Nuevos Componentes
```
components/
├── pets/
│   ├── pet-card-enhanced.tsx      # Card mejorada para lista
│   ├── pet-detail-tabs.tsx        # Sistema de tabs
│   ├── pet-summary-tab.tsx        # Tab resumen
│   ├── pet-medical-history.tsx    # Tab historial
│   ├── pet-vaccines-tab.tsx       # Tab vacunas
│   ├── pet-documents-tab.tsx      # Tab documentos
│   ├── pet-appointments-tab.tsx   # Tab citas
│   ├── pet-finances-tab.tsx       # Tab finanzas
│   ├── document-upload.tsx        # Subida de archivos
│   └── pet-pdf-generator.tsx      # Generador de ficha PDF
```

### Componentes a Modificar
- `pet-profile-header.tsx` - Agregar botones de acción
- `pet-sidebar-info.tsx` - Mover contenido a tabs
- Lista de mascotas `page.tsx` - Usar nueva card

---

## FASE 5: APIs y Actions

### Nuevas APIs
```
app/api/
├── pets/[id]/
│   ├── medical-records/route.ts
│   ├── documents/route.ts
│   └── pdf/route.ts
├── medical-records/
│   └── route.ts
├── prescriptions/
│   ├── route.ts
│   └── [id]/pdf/route.ts
```

### Nuevas Actions
```
app/actions/
├── medical-records.ts
├── prescriptions.ts
└── pet-documents.ts
```

---

## FASE 6: Orden de Implementación

| # | Tarea | Dependencias | Estimado |
|---|-------|--------------|----------|
| 1 | Diseñar esquemas DB (este doc) | - | ✅ Hecho |
| 2 | Agregar campos nuevos a pets | - | 30 min |
| 3 | Mejorar card de lista | - | 1 hora |
| 4 | Crear sistema de tabs en detalle | - | 2 horas |
| 5 | Tab Resumen (refactor actual) | #4 | 1 hora |
| 6 | Tab Vacunas mejorado | #4 | 1 hora |
| 7 | Tab Citas (historial) | #4 | 1 hora |
| 8 | Tab Documentos + Upload | #4 | 2 horas |
| 9 | Crear tablas DB | - | 30 min |
| 10 | Tab Historial Médico | #9 | 2 horas |
| 11 | Tab Finanzas | - | 1 hora |
| 12 | Generador PDF ficha | #9 | 2 horas |
| 13 | Pulir diseño responsive | Todo | 2 horas |

**Total estimado: ~16 horas de desarrollo**

---

## Próximos Pasos

1. ¿Apruebas este plan?
2. ¿Empiezo con Fase 2 (mejorar card de lista) o Fase 3 (tabs en detalle)?
3. ¿Algún ajuste al esquema de DB propuesto?

---

*Plan creado: Enero 2025*
