# Guía Rápida - CavillPet
## Referencia para Administradores

---

### Navegación del Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR IZQUIERDO                                      │
│                                                         │
│  📅 AGENDA                                              │
│     Dashboard (inicio)                                  │
│     Calendario                                          │
│     Citas Hoy                                           │
│     Vacunas                                             │
│     Hospital *                                          │
│     Laboratorio *                                       │
│                                                         │
│  👥 CLIENTES                                            │
│     Directorio                                          │
│     Mensajes                                            │
│     Consentimientos                                     │
│                                                         │
│  💰 FINANZAS                                            │
│     Analytics                                           │
│     Comisiones                                          │
│     Facturas                                            │
│     Inventario                                          │
│     Seguros                                             │
│                                                         │
│  ⚙️ ADMINISTRACIÓN (solo admins)                        │
│     Ajustes                                             │
│     Pasarelas de Pago                                   │
│     Equipo                                              │
│     Horarios                                            │
│     Ausencias                                           │
│     Auditoría                                           │
│                                                         │
│  🔧 HERRAMIENTAS                                        │
│     Calculadora de Dosis                                │
│     Códigos de Diagnóstico                              │
│     Gráficos de Crecimiento                             │
└─────────────────────────────────────────────────────────┘

* = requiere módulo activo
```

---

### Flujos de Trabajo Principales

#### Nueva Cita
```
Clientes → Directorio → [Cliente] → Nueva Cita
        ↓
Agenda → Citas Hoy → Nueva Cita (Ctrl+N)
        ↓
Calendario → Clic en slot vacío
```

#### Nueva Factura
```
Finanzas → Facturas → Nueva Factura
        ↓
Agregar ítems (servicio/producto/medicamento)
        ↓
Aplicar descuento (opcional)
        ↓
Crear → Registrar Pago
```

#### Nuevo Cliente + Mascota
```
Clientes → Directorio → Invitar Cliente
        ↓
Cliente se registra (o lo registras tú)
        ↓
Perfil del Cliente → Agregar Mascota
        ↓
Nombre + Especie + Raza (mínimo)
```

#### Agregar Producto al Inventario
```
Finanzas → Inventario → Agregar Producto
        ↓
Nombre + SKU + Precio + Stock
        ↓
Asignar Proveedor + Categoría
```

---

### Roles y Permisos

| Acción | Veterinario | Administrador |
|--------|:-----------:|:-------------:|
| Ver agenda y citas | ✅ | ✅ |
| Gestionar pacientes | ✅ | ✅ |
| Crear facturas | ✅ | ✅ |
| Ver inventario | ✅ | ✅ |
| Enviar mensajes | ✅ | ✅ |
| Configurar ajustes | ❌ | ✅ |
| Invitar equipo | ❌ | ✅ |
| Configurar horarios | ❌ | ✅ |
| Aprobar ausencias | ❌ | ✅ |
| Ver auditoría | ❌ | ✅ |
| Configurar pagos | ❌ | ✅ |

---

### Estados de Citas

```
[Programada] → [Confirmada] → [En Espera] → [En Consulta] → [Completada]
                                                            ↘ [No Asistió]
                                                            
En cualquier momento → [Cancelada]
```

---

### Estados de Facturas

```
[Pendiente] → [Pagada]
           ↘ [Parcialmente Pagada] → [Pagada]
           ↘ [Vencida]
           ↘ [Anulada]
```

---

### Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| `Ctrl+K` | Búsqueda global |
| `Ctrl+N` | Nueva cita |
| `?` | Ver atajos |
| `Esc` | Cerrar modal |

---

### Datos Mínimos Requeridos

| Entidad | Campos Obligatorios |
|---------|-------------------|
| Cliente | Nombre, Email, Teléfono |
| Mascota | Nombre, Especie, Raza |
| Cita | Cliente, Mascota, Veterinario, Fecha/Hora, Servicio |
| Producto | Nombre, SKU, Precio, Stock |
| Servicio | Nombre, Categoría, Precio, Duración |
| Factura | Cliente, al menos 1 ítem |
| Proveedor | Nombre, Contacto |

---

### Checklist Primer Día

1. [ ] Ajustes → General: Nombre, contacto, horarios
2. [ ] Ajustes → Marca: Logo y colores
3. [ ] Ajustes → Módulos: Activar funciones necesarias
4. [ ] Ajustes → Servicios: Configurar servicios y precios
5. [ ] Administración → Equipo: Invitar veterinarios
6. [ ] Administración → Horarios: Configurar turnos
7. [ ] Finanzas → Inventario: Cargar productos iniciales
8. [ ] Registrar primeros clientes y mascotas
9. [ ] Crear primera cita de prueba
10. [ ] Crear factura de prueba y registrar pago
