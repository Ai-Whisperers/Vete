# Guía de Onboarding para Administradores - CavillPet

## Bienvenido a CavillPet

CavillPet es la plataforma de gestión integral para clínicas veterinarias. Esta guía te acompañará paso a paso para configurar tu clínica y aprender a usar todas las funcionalidades.

---

## Índice

1. [Primer Acceso](#1-primer-acceso)
2. [Configuración Inicial](#2-configuración-inicial)
3. [Gestión de Equipo](#3-gestión-de-equipo)
4. [Registro de Clientes y Mascotas](#4-registro-de-clientes-y-mascotas)
5. [Gestión de Citas](#5-gestión-de-citas)
6. [Catálogo de Servicios y Precios](#6-catálogo-de-servicios-y-precios)
7. [Inventario y Productos](#7-inventario-y-productos)
8. [Facturación y Pagos](#8-facturación-y-pagos)
9. [Vacunas y Control Sanitario](#9-vacunas-y-control-sanitario)
10. [Comunicación con Clientes](#10-comunicación-con-clientes)
11. [Reportes y Analytics](#11-reportes-y-analytics)
12. [Atajos de Teclado](#12-atajos-de-teclado)

---

## 1. Primer Acceso

### Iniciar Sesión

1. Abre tu navegador y ve a `https://tudominio.com/nombre-clinica/portal/login`
2. Ingresa tu **email** y **contraseña**
3. Haz clic en **Iniciar Sesión**
4. Serás redirigido al Dashboard (panel principal)

### Navegación Básica

El dashboard tiene un menú lateral organizado en 4 secciones:

| Sección | Contenido | Visible para |
|---------|-----------|-------------|
| **AGENDA** | Dashboard, Calendario, Citas, Vacunas, Hospital, Laboratorio | Veterinarios y Admins |
| **CLIENTES** | Directorio, Mensajes, Consentimientos | Veterinarios y Admins |
| **FINANZAS** | Analytics, Comisiones, Facturas, Inventario, Seguros | Veterinarios y Admins |
| **ADMINISTRACIÓN** | Ajustes, Pasarelas, Equipo, Horarios, Ausencias, Auditoría | Solo Admins |

> **Tip:** En dispositivos móviles, usa el menú inferior para navegar rápidamente.

---

## 2. Configuración Inicial

### 2.1 Datos Generales

**Ruta:** `Dashboard → Administración → Ajustes → General`

Configura los datos básicos de tu clínica:

1. **Nombre de la Clínica** - Como aparecerá en el sitio público
2. **Eslogan** - Frase corta descriptiva
3. **Contacto** - Teléfono, email, dirección
4. **Horarios de Atención** - Lunes a Viernes, Sábados, Domingos

### 2.2 Marca y Colores

**Ruta:** `Dashboard → Administración → Ajustes → Marca`

Personaliza la identidad visual:

1. **Logo** - Sube el logo de tu clínica (PNG recomendado, 200x200px mínimo)
2. **Favicon** - Ícono que aparece en la pestaña del navegador
3. **Imagen Hero** - Foto principal del sitio público
4. **Colores** - Elige entre 6 presets:
   - Esmeralda (verde)
   - Azul Océano
   - Púrpura Real
   - Rosa Coral
   - Naranja Cálido
   - Índigo
   - O personaliza los colores primario, secundario, fondo y texto

### 2.3 Activar/Desactivar Módulos

**Ruta:** `Dashboard → Administración → Ajustes → Módulos`

Activa solo las funcionalidades que tu clínica necesita:

| Categoría | Módulo | Descripción |
|-----------|--------|-------------|
| **Clínico** | Alimentos Tóxicos | Buscador de alimentos peligrosos para mascotas |
| **Clínico** | Calculadora de Dosis | Dosificación de medicamentos por peso |
| **Clínico** | Gráficos de Crecimiento | Seguimiento de peso y talla |
| **Clínico** | Seguimiento de Vacunas | Control de vacunación automático |
| **Funciones** | Código QR | Generación de QR para mascotas |
| **Funciones** | Programa de Referidos | Sistema de recomendaciones |
| **Comercio** | Tienda Online | Venta de productos por internet |
| **Comercio** | Reservas Online | Citas desde el sitio público |
| **Comercio** | Telemedicina | Consultas virtuales |
| **Comercio** | Tienda Física | Punto de venta presencial |

### 2.4 Pasarelas de Pago

**Ruta:** `Dashboard → Administración → Pasarelas`

Configura los métodos de pago aceptados:

1. Selecciona el proveedor (Stripe, Bancard, Tigo Money, etc.)
2. Ingresa las credenciales API proporcionadas por el proveedor
3. Configura el modo (pruebas/producción)
4. Guarda los cambios

---

## 3. Gestión de Equipo

### 3.1 Invitar Miembros del Equipo

**Ruta:** `Dashboard → Administración → Equipo`

Para agregar veterinarios o administradores:

1. Haz clic en **Invitar Miembro**
2. Completa el formulario:
   - **Nombre completo**
   - **Email**
   - **Rol:**
     - `veterinario` - Acceso a agenda, pacientes, historial médico
     - `administrador` - Acceso completo + configuración + equipo
3. El invitado recibirá un email con instrucciones para crear su cuenta

### 3.2 Configurar Horarios

**Ruta:** `Dashboard → Administración → Horarios`

Define los horarios de trabajo de cada miembro:

1. Selecciona el miembro del equipo
2. Para cada día de la semana, configura:
   - **Hora de inicio** (ej: 08:00)
   - **Hora de fin** (ej: 18:00)
   - **Día libre** - marca los días que no trabaja
3. Los horarios se reflejan en el calendario de citas

### 3.3 Gestión de Ausencias

**Ruta:** `Dashboard → Administración → Ausencias`

**Para solicitar una ausencia (veterinario):**

1. Clic en **Nueva Solicitud**
2. Selecciona el tipo de ausencia (vacaciones, enfermedad, personal)
3. Define las fechas (inicio y fin)
4. Agrega un motivo
5. Espera la aprobación del administrador

**Para aprobar/rechazar (administrador):**

1. Ve a la lista de solicitudes pendientes
2. Revisa las fechas solicitadas
3. Aprueba o rechaza con un comentario

---

## 4. Registro de Clientes y Mascotas

### 4.1 Agregar un Nuevo Cliente

**Ruta:** `Dashboard → Clientes → Directorio → Invitar Cliente`

O usa el acceso rápido: `Ctrl+N` → Nuevo Cliente

1. Ingresa los datos del propietario:
   - **Nombre completo**
   - **Email**
   - **Teléfono**
   - **Dirección** (opcional)
2. El cliente recibirá un email para crear su cuenta en el portal

**Alternativa:** El cliente puede registrarse directamente en `tusitio.com/clinica/portal/signup`

### 4.2 Registrar una Mascota

**Opción A - Desde el Dashboard:**

**Ruta:** `Dashboard → Clientes → Directorio → [Seleccionar Cliente]`

1. En el perfil del cliente, busca la sección **Mascotas**
2. Clic en **Agregar Mascota**
3. Completa los datos:
   - **Nombre**
   - **Especie** (Perro, Gato, Ave, Roedor, Reptil, Otro)
   - **Raza**
   - **Fecha de nacimiento** (aproximada si no se conoce)
   - **Sexo** (Macho/Hembra)
   - **Peso actual**
   - **Color/Pelaje**
   - **Microchip** (si tiene)
   - **¿Castrado/Esterilizado?**
   - **Alergias conocidas**
   - **Condiciones crónicas**
   - **Foto** (opcional)

**Opción B - Registro Rápido (Mínimo):**

Solo se necesita: Nombre, Especie y Raza. Los demás datos se completan después.

**Opción C - El cliente la registra:**

El cliente puede agregar mascotas desde su portal en `Portal → Mis Mascotas → Agregar`

### 4.3 Ver Perfil Completo del Paciente

**Ruta:** `Dashboard → Agenda → Pacientes → [Seleccionar Mascota]`

El perfil incluye:
- **Datos generales** con foto
- **Alertas de vacunas** y reacciones alérgicas
- **Timeline médico** - historial cronológico de consultas y tratamientos
- **Documentos** - archivos adjuntos (radiografías, laboratorios, etc.)
- **Recetas médicas** emitidas

---

## 5. Gestión de Citas

### 5.1 Crear una Cita

**Ruta:** `Dashboard → Agenda → Citas Hoy → Nueva Cita` o `Ctrl+N`

1. **Seleccionar Cliente** - Busca por nombre o email
2. **Seleccionar Mascota** - Se filtran las mascotas del cliente elegido
3. **Seleccionar Veterinario** - Solo aparecen los disponibles en el horario
4. **Seleccionar Servicio** - Del catálogo configurado
5. **Fecha y Hora** - Elige el día y slot disponible
6. **Motivo de la consulta:**
   - Consulta General
   - Vacunación
   - Control
   - Desparasitación
   - Cirugía
   - Emergencia
   - Grooming/Estética
   - Laboratorio
   - Otro
7. **Notas adicionales** (opcional)
8. Clic en **Crear Cita**

### 5.2 Vista del Calendario

**Ruta:** `Dashboard → Agenda → Calendario`

- Cambia entre vistas: **Día**, **Semana**, **Mes**, **Agenda**
- Arrastra y suelta citas para reprogramar
- Los colores indican el veterinario asignado
- Haz clic en una cita para ver detalles o editar

### 5.3 Flujo de Estados de una Cita

```
Programada → Confirmada → En Espera → En Consulta → Completada
                                                      ↓
                                              No Asistió / Cancelada
```

Para cambiar el estado:
1. Ve a `Dashboard → Citas Hoy`
2. Encuentra la cita en la cola
3. Usa los botones de acción: Check-in, Iniciar Consulta, Completar

### 5.4 Solicitudes Pendientes

Cuando un cliente solicita una cita desde el portal:

1. Aparece en el panel **Solicitudes Pendientes** en `Citas Hoy`
2. Revisa la solicitud (cliente, mascota, servicio, horario preferido)
3. **Aprueba** la cita tal cual, o
4. **Sugiere alternativa** con otro horario/veterinario

---

## 6. Catálogo de Servicios y Precios

### 6.1 Configurar Servicios

**Ruta:** `Dashboard → Administración → Ajustes → Servicios/Precios`

Para cada servicio que ofrece tu clínica:

1. Clic en **Agregar Servicio**
2. Completa:
   - **Nombre del servicio** (ej: "Consulta General")
   - **Categoría** (Consulta, Vacuna, Cirugía, Laboratorio, Estética, Otro)
   - **Precio base**
   - **Duración estimada** (en minutos)
   - **Descripción** breve
   - **Variantes de precio por tamaño:**
     - Pequeño (hasta 10kg)
     - Mediano (10-25kg)
     - Grande (25-40kg)
     - Gigante (40kg+)
   - **¿Disponible para reserva online?** - Activa para que los clientes puedan agendar
   - **¿Visible en el sitio público?** - Muestra el servicio en tu página web

### 6.2 Ejemplo de Configuración

| Servicio | Categoría | Precio | Duración | Online |
|----------|-----------|--------|----------|--------|
| Consulta General | Consulta | 80,000 GS | 30 min | ✅ |
| Vacuna Antirrábica | Vacuna | 45,000 GS | 15 min | ✅ |
| Esterilización | Cirugía | 350,000 GS | 120 min | ❌ |
| Baño y Tosa | Estética | 60,000-120,000 GS | 60 min | ✅ |
| Hemograma | Laboratorio | 75,000 GS | 30 min | ❌ |

> **Tip:** Los precios por tamaño se configuran en cada servicio. Si no usas precios por tamaño, deja solo el precio base.

---

## 7. Inventario y Productos

### 7.1 Gestión de Inventario

**Ruta:** `Dashboard → Finanzas → Inventario`

El inventario muestra todos los productos de tu clínica con:
- **Nombre** y **SKU** (código)
- **Stock actual** vs **Stock mínimo**
- **Precio de costo** y **Precio de venta**
- **Categoría**
- **Proveedor**

### 7.2 Agregar Productos

1. Clic en **Agregar Producto**
2. Completa los datos:
   - **Nombre del producto**
   - **SKU/Código** (ej: ALI-001)
   - **Categoría** (Alimentos, Medicamentos, Accesorios, Higiene)
   - **Descripción**
   - **Precio de costo** (lo que pagas al proveedor)
   - **Precio de venta** (lo que cobra al cliente)
   - **Stock actual**
   - **Stock mínimo** (para alertas automáticas)
   - **Proveedor**
   - **Fecha de vencimiento** (si aplica)
   - **Foto del producto**

### 7.3 Importar desde Google Sheets

Para agregar muchos productos de una vez:

1. Descarga la **plantilla** desde la página de inventario
2. Llena los datos en Google Sheets
3. Sube el archivo completado
4. Los productos se importan automáticamente

### 7.4 Gestión de Proveedores

**Ruta:** `Dashboard → Finanzas → Inventario → Proveedores`

1. Clic en **Agregar Proveedor**
2. Completa:
   - **Nombre/Razón social**
   - **RUC/CI**
   - **Contacto** (email, teléfono, dirección, persona de contacto)
   - **Tipo** (Productos, Servicios, Ambos)
   - **Términos de pago** (Contado, 30 días, etc.)
   - **Tiempo de entrega** (en días)
   - **Monto mínimo de pedido**

### 7.5 Alertas de Stock Bajo

**Ruta:** `Dashboard → Administración → Ajustes → Alertas Inventario`

1. Configura el **umbral de stock mínimo** por categoría
2. Cuando un producto cae por debajo del mínimo, recibirás una alerta
3. También encontrarás **Sugerencias de Reorder** en `Inventario → Reorders`

### 7.6 Órdenes de Compra

**Ruta:** `Dashboard → Finanzas → Inventario → Compras`

1. Crea una orden de compra seleccionando productos y cantidades
2. Compara precios entre proveedores
3. Envía la orden al proveedor seleccionado
4. Actualiza el stock al recibir la mercadería

---

## 8. Facturación y Pagos

### 8.1 Crear una Factura

**Ruta:** `Dashboard → Finanzas → Facturas → Nueva Factura`

O usa el acceso rápido: `Ctrl+N` → Facturar

1. **Seleccionar Cliente**
2. **Agregar ítems:**
   - Servicios prestados
   - Productos vendidos
   - Medicamentos recetados
3. Cada ítem tiene: descripción, cantidad, precio unitario
4. **Aplicar descuento** si es necesario (monto fijo o porcentaje)
5. **Total** se calcula automáticamente
6. Clic en **Crear Factura**

### 8.2 Registrar Pagos

1. Abre la factura creada
2. Clic en **Registrar Pago**
3. Selecciona el **método de pago:**
   - Efectivo
   - Tarjeta
   - Transferencia
   - QR/Pago móvil
4. Ingresa el monto pagado
5. Si el pago es parcial, la factura quedará con saldo pendiente

### 8.3 Enviar Facturas

- **Por Email:** Clic en Enviar por Email
- **Por WhatsApp:** Clic en Enviar por WhatsApp (requiere módulo activo)
- **Descargar PDF:** Genera un PDF para imprimir

### 8.4 Ver Estados de Facturas

| Estado | Significado |
|--------|-------------|
| Pendiente | Aún no pagada |
| Parcialmente Pagada | Se recibió un pago parcial |
| Pagada | Saldo cubierto totalmente |
| Vencida | Pasó la fecha de vencimiento sin pago |
| Anulada | Cancelada por error o devolución |

---

## 9. Vacunas y Control Sanitario

### 9.1 Centro de Vacunas

**Ruta:** `Dashboard → Agenda → Vacunas`

El centro muestra:
- **Vacunas Vencidas** (rojo) - Requieren atención inmediata
- **Próximas 30 días** (amarillo) - Programar pronto
- **Todas las vacunas** - Lista completa filtrable por estado

### 9.2 Registrar una Vacuna

1. Desde el perfil del paciente, ve a la pestaña **Vacunas**
2. Clic en **Nueva Vacuna**
3. Completa:
   - **Tipo de vacuna** (Antirrábica, Sextuple, Triple, etc.)
   - **Fecha de aplicación**
   - **Fecha de próxima dosis**
   - **Lote** (número de lote del fabricante)
   - **Veterinario** que aplicó
   - **Observaciones**

### 9.3 Recordatorios Automáticos

El sistema envía recordatorios automáticos a los clientes cuando:
- Una vacuna está próxima a vencer (7 días antes)
- Una vacuna está vencida
- Un desparasitante necesita refuerzo

---

## 10. Comunicación con Clientes

### 10.1 WhatsApp Business

**Ruta:** `Dashboard → Clientes → Mensajes`

> Requiere módulo WhatsApp activo en Ajustes → Módulos

- **Bandeja de entrada** con todas las conversaciones
- **Respuestas rápidas** para mensajes frecuentes
- **Plantillas** para mensajes repetitivos (recordatorios, confirmaciones)
- **Estadísticas** de mensajes enviados y respondidos

### 10.2 Mensajes Internos

**Ruta:** `Portal → Mensajes`

Sistema de mensajería entre equipo y clientes:
1. Clic en **Nuevo Mensaje**
2. Selecciona el destinatario
3. Escribe el mensaje
4. Adjunta archivos si es necesario

### 10.3 Notificaciones

**Ruta:** `Portal → Notificaciones`

El centro de notificaciones muestra alertas de:
- Vacunas por vencer
- Citas programadas
- Facturas pendientes
- Cumpleaños de mascotas
- Consentimientos pendientes
- Mensajes nuevos
- Avisos del sistema

---

## 11. Reportes y Analytics

### 11.1 Panel de Analytics

**Ruta:** `Dashboard → Finanzas → Analytics`

Reportes disponibles:

| Reporte | Qué Muestra |
|---------|-------------|
| **Ingresos** | Tendencia de facturación, comparativa mensual |
| **Citas** | Total de citas, tasa de asistencia, no-shows |
| **Clientes** | Crecimiento de cartera, retención |
| **Servicios** | Distribución por tipo de servicio |
| **Tienda** | Ventas, productos más vendidos, márgenes |
| **Pacientes** | Distribución por especie, raza, edad |
| **Operaciones** | Tiempos de espera, utilización del equipo |
| **Clientes** | Valor de vida del cliente, fidelización |

### 11.2 Exportar Reportes

- Cada reporte tiene un botón **Exportar PDF**
- Los datos se pueden filtrar por rango de fechas

### 11.3 Auditoría

**Ruta:** `Dashboard → Administración → Auditoría`

Registro completo de todas las acciones realizadas en el sistema:
- Quién hizo qué y cuándo
- Cambios en registros
- Accesos al sistema
- Modificaciones de configuración

---

## 12. Atajos de Teclado

El dashboard soporta los siguientes atajos:

| Atajo | Acción |
|-------|--------|
| `Ctrl+K` | Abrir paleta de comandos (búsqueda global) |
| `Ctrl+N` | Nueva cita rápida |
| `?` | Mostrar todos los atajos |
| `Esc` | Cerrar paneles modales |

### Paleta de Comandos (`Ctrl+K`)

Busca rápidamente entre:
- Pacientes (mascotas)
- Clientes (propietarios)
- Citas
- Productos
- Navegación a cualquier página

---

## Resumen Rápido - Checklist de Configuración Inicial

Completa estos pasos en orden para tener tu clínica funcionando:

- [ ] **1.** Iniciar sesión y explorar el Dashboard
- [ ] **2.** Configurar datos generales (Ajustes → General)
- [ ] **3.** Personalizar marca y colores (Ajustes → Marca)
- [ ] **4.** Activar módulos necesarios (Ajustes → Módulos)
- [ ] **5.** Configurar servicios y precios (Ajustes → Servicios/Precios)
- [ ] **6.** Configurar pasarela de pago (Administración → Pasarelas)
- [ ] **7.** Invitar equipo de trabajo (Administración → Equipo)
- [ ] **8.** Configurar horarios del equipo (Administración → Horarios)
- [ ] **9.** Registrar los primeros clientes (Clientes → Directorio)
- [ ] **10.** Registrar las primeras mascotas (desde perfil del cliente)
- [ ] **11.** Cargar inventario inicial (Finanzas → Inventario)
- [ ] **12.** Registrar proveedores (Inventario → Proveedores)
- [ ] **13.** Crear la primera cita (Agenda → Nueva Cita)
- [ ] **14.** Configurar alertas de stock (Ajustes → Alertas)
- [ ] **15.** Probar el flujo completo: cita → consulta → factura → pago

---

## Soporte

Si necesitas ayuda adicional:

- Usa la **paleta de comandos** (`Ctrl+K`) para buscar cualquier función
- Presiona `?` para ver los atajos de teclado disponibles
- Consulta la sección de **Auditoría** para revisar el historial de acciones
- Los mensajes de error siempre incluyen instrucciones en español

---

*CavillPet - Gestión Veterinaria Profesional*
