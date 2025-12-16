# Digital Card Portal Content (The App)

## 1. Login Screen

- **Title**: "Ingresa al Portal de tu Mascota"
- **Input**: "Número de Teléfono"
- **Button**: "Enviar Código"

## 2. Dashboard (Pet List)

- **Title**: "Mis Mascotas"
- **Button**: "+ Agregar Mascota"

## 3. Pet Detail View (The "Card")

- **Header**: Photo of Pet, Name, Breed, Age.
- **Verified Badge**: "✅ Verificado por {{Clinic_Name}}" (If all data is robust).

### Vaccination Timeline

- **Status: Up to Date**
  - _Visual_: Green Shield. "¡{{Pet_Name}} está protegido!"
- **Status: Overdue**
  - _Visual_: Red Alert. "Vacuna Sextuple vencida hace 10 días."
  - _Button_: "Agendar Turno Ahora"

### Add External Record (Owner Upload)

- **Button**: "Subir Vacuna Externa"
- **Instruction**: "Si vacunaste a {{Pet_Name}} en otra veterinaria, sube una foto de la etiqueta y la firma del doctor para guardarlo en tu historial."
- **Form**:
  - Select Vaccine Type (Rabies, etc.)
  - Date Administered.
  - **Upload Photo (Required)**.
- **Confirmation**: "Guardado. Esta vacuna aparecerá como 'Reportada por Dueño'."
