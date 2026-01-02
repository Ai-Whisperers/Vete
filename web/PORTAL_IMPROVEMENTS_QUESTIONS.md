# Portal de Mascotas - Preguntas de Decisión

Por favor responde estas preguntas para priorizar las mejoras del portal.

---

## SECCIÓN 1: Prioridades Generales

### 1.1 ¿Cuál es el objetivo principal del portal para owners?

- [x] A) Ver información básica de sus mascotas
- [x] B) Gestionar citas y vacunas activamente
- [x] C) Acceso completo a historial médico
- [ ] D) Comunicación directa con la clínica

### 1.2 ¿Qué tan completo debe ser el historial médico visible para el owner?

- [ ] A) Solo vacunas y datos básicos
- [ ] B) Vacunas + últimas consultas (resumen)
- [x] C) Historial completo con diagnósticos y tratamientos
- [x] D) Todo incluyendo documentos y análisis

---

## SECCIÓN 2: Lista de Mascotas (/portal/pets)

### 2.1 ¿Qué indicadores mostrar en cada card de mascota?

- [x] Próxima vacuna pendiente
- [x] Última visita a la clínica
- [x] Próxima cita agendada
- [x] Estado de salud (indicador visual)
- [x] Edad calculada
- [ ] Ninguno adicional (mantener simple)

### 2.2 ¿Agregar filtros a la lista?

- [x] A) No, solo búsqueda por nombre
- [ ] B) Sí, filtrar por especie (perro/gato)
- [ ] C) Sí, filtrar por estado de vacunas
- [ ] D) Sí, múltiples filtros combinables

---

## SECCIÓN 3: Detalle de Mascota (/portal/pets/[id])

### 3.1 ¿Qué acciones rápidas mostrar en el header?

- [x] Editar perfil (ya existe)
- [x] Agendar cita
- [ ] Llamar a la clínica
- [ ] Compartir perfil (emergencias)
- [x] Descargar ficha PDF

### 3.2 ¿Crear sistema de recordatorios?

- [x] A) No por ahora
- [ ] B) Solo recordatorios de vacunas automáticos
- [ ] C) Recordatorios configurables (desparasitación, baños, etc.)
- [ ] D) Sistema completo con notificaciones push/email

### 3.3 ¿Permitir que el owner suba documentos?

- [ ] A) No, solo el staff puede subir
- [ ] B) Sí, pero solo fotos
- [ ] C) Sí, fotos y PDFs (análisis externos)
- [x] D) Sí, cualquier tipo de archivo

### 3.4 ¿Mostrar información financiera?

- [ ] A) No mostrar nada de dinero
- [x] B) Solo puntos de lealtad (ya existe)
- [x] C) Historial de pagos/facturas
- [x] D) Todo incluyendo deudas pendientes

---

## SECCIÓN 4: Historial Médico

### 4.1 ¿Crear las tablas medical_records y prescriptions?

- [x] A) Sí, crear ahora con esquema completo
- [ ] B) Sí, pero esquema básico primero
- [ ] C) No por ahora, solo vacunas
- [ ] D) Evaluar después

### 4.2 Si se crea medical_records, ¿qué debe contener?

- [x] Fecha y tipo de consulta
- [x] Diagnóstico
- [x] Signos vitales (peso, temperatura, etc.)
- [x] Tratamiento indicado
- [x] Notas del veterinario
- [x] Archivos adjuntos (radiografías, etc.)
- [ ] Costo de la consulta

### 4.3 ¿Qué nivel de detalle en prescriptions?

- [ ] A) Solo nombre del medicamento y dosis
- [ ] B) Medicamento, dosis, frecuencia, duración
- [ ] C) Completo con instrucciones y advertencias
- [x] D) Completo + generación de PDF para imprimir

---

## SECCIÓN 5: Vacunas

### 5.1 ¿Cómo manejar vacunas vencidas?

- [x] A) Solo mostrar indicador visual
- [ ] B) Enviar email de recordatorio
- [ ] C) Notificación en el portal
- [ ] D) Email + SMS + notificación

### 5.2 ¿El owner puede registrar vacunas aplicadas externamente?

- [ ] A) No, solo el staff
- [x] B) Sí, pero requiere verificación del staff
- [ ] C) Sí, libremente
- [ ] D) Sí, con opción de subir comprobante

---

## SECCIÓN 6: Citas

### 6.1 ¿Mostrar historial de citas en el perfil de mascota?

- [ ] A) No
- [ ] B) Solo próximas citas
- [ ] C) Próximas + últimas 5
- [x] D) Historial completo

### 6.2 ¿Permitir agendar cita desde el perfil de mascota?

- [x] A) No, ir al flujo normal de booking
- [ ] B) Sí, con mascota pre-seleccionada
- [ ] C) Sí, con servicio sugerido según historial

---

## SECCIÓN 7: Comunicación

### 7.1 ¿Agregar sistema de mensajes en el portal?

- [x] A) No por ahora
- [ ] B) Solo ver mensajes (sin responder)
- [ ] C) Chat bidireccional con la clínica
- [ ] D) Chat + notificaciones

### 7.2 ¿Botón de emergencia/contacto rápido?

- [x] A) No necesario
- [ ] B) Solo número de teléfono visible
- [ ] C) Botón que inicia llamada
- [ ] D) Botón + info de clínica 24h más cercana

---

## SECCIÓN 8: Diseño y UX

### 8.1 ¿El diseño actual es adecuado?

- [ ] A) Sí, mantener como está
- [ ] B) Pequeños ajustes de espaciado/colores
- [ ] C) Reorganizar layout de información
- [x] D) Rediseño significativo

### 8.2 ¿Prioridad móvil vs desktop?

- [ ] A) Desktop primero
- [ ] B) Móvil primero
- [x] C) Ambos igual de importantes
- [ ] D) Ya está bien responsivo

---

## SECCIÓN 9: Datos Adicionales de Mascota

### 9.1 ¿Qué campos adicionales agregar al perfil?

- [x] Fecha de adopción
- [x] Nombre del criador/origen
- [x] Número de registro (pedigree)
- [ ] Seguro médico
- [x] Veterinario de cabecera
- [x] Contacto de emergencia alternativo
- [ ] Ninguno adicional

### 9.2 ¿Tracking de peso histórico?

- [ ] A) No necesario
- [ ] B) Solo último peso
- [ ] C) Gráfico de evolución (ya existe pero vacío)
- [x] D) Gráfico + alertas si sale de rango normal

---

## SECCIÓN 10: Integraciones

### 10.1 ¿Integrar con servicios externos?

- [x] Google Calendar (sincronizar citas)
- [x] WhatsApp (notificaciones)
- [ ] Email automáticos
- [ ] Ninguno por ahora

### 10.2 ¿Generar QR para collar?

- [ ] A) Ya existe, mantener
- [x] B) Mejorar con más info en el QR
- [x] C) Agregar opción de comprar tag físico
- [ ] D) No es prioridad

---

## NOTAS ADICIONALES

Escribe aquí cualquier feature o mejora que quieras agregar que no esté en las preguntas:

```
1.

2.

3.

4.

5.
```

---

## PRIORIZACIÓN FINAL

Ordena del 1 al 5 (1 = más urgente):

| #   | Feature                         |
| --- | ------------------------------- |
|     | Indicadores de vacunas en lista |
|     | Botón agendar cita desde perfil |
|     | Historial médico completo       |
|     | Sistema de recordatorios        |
|     | Subida de documentos            |
|     | Chat con la clínica             |
|     | Mejoras de diseño               |

---

_Responde marcando con [x] las opciones y devuélveme el archivo o pega las respuestas en el chat._
