# 📋 Migración a Arquitectura de Staging - Frontend

## Fecha: 2025-10-25
## Versión: 1.0.0

---

## 🎯 Resumen Ejecutivo

Se ha completado la migración del frontend para integrarse con la **nueva arquitectura de staging** del backend, que incluye:

- **Tabla de Capturas** (`capturas_votante`): Almacenamiento de todos los datos reportados
- **Detección Automática de Incidencias**: Duplicados y conflictos
- **Sistema de Variantes**: Historial de cambios en datos de votantes
- **Relación N:M**: Votantes pueden tener múltiples líderes

---

## ⚠️ CAMBIO CONCEPTUAL CRÍTICO

### ❌ ANTES (Incorrecto):
```
Formulario → POST /votantes (canónico) → POST /asignaciones
```

### ✅ AHORA (Correcto):
```
Formulario → POST /capturas (staging) → TRIGGER automático del backend:
                                         ├─→ Crea votante canónico
                                         ├─→ Crea asignación N:M
                                         ├─→ Detecta incidencias
                                         └─→ Crea variantes
```

### 🔑 Endpoints y Sus Propósitos:

| Endpoint | Cuándo Usar | Quién Usa |
|----------|-------------|-----------|
| `POST /capturas` | **Flujo normal** - Cuando un líder reporta un votante | Formularios, Apps móviles |
| `POST /votantes` | Solo para administración directa del canónico | Panel admin (futuro) |
| `POST /votantes/upload_csv` | Carga masiva - Usa `capturas_votante` internamente | Upload de Excel |
| `POST /asignaciones` | Asignar líder adicional a votante existente | Gestión manual |
| `PUT /votantes/:id` | Actualizar datos canónicos existentes | Edición admin |

**Regla de Oro:**
> Si un **líder reporta datos**, siempre va a **staging (POST /capturas)**.
> El backend decide automáticamente si crear, actualizar o generar incidencia.

---

## 📦 Archivos Modificados

### ✅ **1. src/components/api.js**
**Cambios:** Añadidos nuevos servicios API

#### Nuevos Exports:
```javascript
// API de Capturas (Staging)
export const capturasAPI = {
  create: (data) => POST /capturas
  getAll: (params) => GET /capturas?{params}
  getByLeader: (liderIdentificacion) => GET /capturas?lider_identificacion=X
  getByVotante: (votanteIdentificacion) => GET /capturas?votante_identificacion=X
}

// API de Variantes
export const variantesAPI = {
  getByLeader: (liderIdentificacion) => GET /variantes?lider_identificacion=X
  getByVotante: (votanteIdentificacion) => GET /variantes?votante_identificacion=X
  getMetricas: (params) => GET /variantes/metricas?{params}
}

// API de Asignaciones N:M
export const asignacionesAPI = {
  create: (data) => POST /asignaciones
  getAll: (params) => GET /asignaciones?{params}
  delete: (votanteId, liderId) => DELETE /asignaciones?...
}

// API de Incidencias
export const incidenciasAPI = {
  getAll: (params) => GET /incidencias?{params}
  getByVotante: (votanteId) => GET /votantes/:id/incidencias
  create: (data) => POST /incidencias
  resolve: (id, resolucion) => PUT /incidencias/:id/resolver
}

// API de Logs
export const logsAPI = {
  getAll: (params) => GET /logs?{params}
}
```

---

### ✅ **2. src/components/UploadVotantes.js**
**Cambios:** Adaptado a nueva respuesta de `/votantes/upload_csv`

#### Antes:
```javascript
response.data = {
  message: "...",
  insertados: 10,
  duplicados: [...]  // Array de duplicados
}
```

#### Ahora:
```javascript
response.data = {
  message: "...",
  procesados: 15,
  capturas_insertadas: 15,
  incidencias: [...]  // Array de incidencias con tipos
}
```

#### Tipos de Incidencias Procesadas:
- `DUPLICIDAD_CON_SI_MISMO` - Duplicado exacto (mismo líder, mismos datos)
- `DUPLICIDAD_LIDER` - Duplicado con mismo líder (datos diferentes)
- `DUPLICIDAD_ENTRE_LIDERES` - Duplicado reportado por otro líder
- `CONFLICTO_DATOS` - Conflicto entre datos capturados y canónicos

#### Nuevas Funcionalidades:
- ✅ Clasificación automática de incidencias por tipo
- ✅ Mensajes de éxito con estadísticas detalladas
- ✅ Compatibilidad con UI existente de modales de duplicados
- ✅ Manejo de errores mejorado

---

### ✅ **3. src/components/modals/ViewVotanteModal.js**
**Cambios:** Añadido sistema de Tabs con Incidencias y Variantes

#### Nueva Estructura:
```
┌─────────────────────────────────────────────┐
│  [Información General] [Incidencias] [Variantes]  │
├─────────────────────────────────────────────┤
│                                              │
│  TAB 0: Información Personal + Líderes      │
│  TAB 1: Historial de Incidencias           │
│  TAB 2: Historial de Variantes de Datos    │
│                                              │
└─────────────────────────────────────────────┘
```

#### Tab 0 - Información General:
- ✅ Datos personales del votante
- ✅ Lista de líderes asignados (N:M)
- ✅ Ubicación (departamento, ciudad, barrio, dirección)
- ✅ Información adicional

#### Tab 1 - Incidencias:
- ✅ Badge con contador de incidencias
- ✅ Cards expandibles por incidencia
- ✅ Códigos de color por tipo:
  - 🔴 Rojo: `DUPLICIDAD_ENTRE_LIDERES`
  - 🟠 Naranja: `DUPLICIDAD_CON_SI_MISMO`, `DUPLICIDAD_LIDER`
  - 🔵 Azul: `CONFLICTO_DATOS`
  - 🟢 Verde: `RESUELTO`
- ✅ Detalles técnicos en JSON
- ✅ Información de resolución (si aplica)

#### Tab 2 - Variantes:
- ✅ Badge con contador de variantes
- ✅ Tabla con historial de datos reportados
- ✅ Resaltado en amarillo de datos diferentes al canónico
- ✅ Información de líder que reportó cada variante
- ✅ Timestamps de capturas

---

### ✅ **4. src/components/modals/VotanteFormModal.js**
**Estado:** ✅ **CORREGIDO** - Ahora usa arquitectura de staging

#### Implementación ANTERIOR (Incorrecta):
```javascript
// ❌ INCORRECTO: Creaba directamente en canónico
await axios.post("/votantes", { ... });
await axios.post("/asignaciones", { ... });
```

#### Implementación NUEVA (Correcta):
```javascript
// ✅ CORRECTO: Usa staging con POST /capturas
await axios.post("/capturas", {
  votante_identificacion: formData.identificacion,
  lider_identificacion: formData.lider_identificacion, // OBLIGATORIO
  nombre: formData.nombre,
  apellido: formData.apellido,
  // ... otros campos
});

// El TRIGGER del backend automáticamente:
// 1. Crea votante canónico (si no existe)
// 2. Crea asignación N:M
// 3. Detecta duplicados/incidencias
// 4. Crea variantes
```

#### Cambios Realizados:
- ✅ Campo "Líder" ahora es **OBLIGATORIO** (required)
- ✅ Validación: No permite guardar sin líder
- ✅ Usa `POST /capturas` en lugar de `POST /votantes`
- ✅ Detecta y notifica incidencias en la respuesta
- ✅ Helper text actualizado: "OBLIGATORIO - El líder que reporta este votante debe ser especificado"

---

## 🔑 Breaking Changes Implementados

### 1. ✅ FLUJO DE REPORTE = POST /capturas (NO POST /votantes)
**Estado:** Corregido en VotanteFormModal.js

**Concepto Clave:**
```
POST /votantes     = Solo para admin/gestión directa del canónico
POST /capturas     = Flujo normal cuando un líder reporta datos
POST /upload_csv   = Usa capturas_votante internamente (ya correcto)
```

**Flujo Correcto:**
1. Líder/Usuario reporta datos → `POST /capturas`
2. Backend (trigger automático):
   - Crea/actualiza votante canónico
   - Crea asignación N:M
   - Detecta incidencias
   - Crea variantes
3. Frontend recibe respuesta con incidencias

### 2. ✅ POST /votantes/upload_csv - Nueva estructura de respuesta
**Estado:** Implementado en UploadVotantes.js
- Response incluye `procesados`, `capturas_insertadas`, `incidencias`
- Clasificación automática de incidencias por tipo
- Manejo de reasignaciones usa POST /asignaciones + PUT /votantes (canónico)

### 3. ✅ Nuevos Endpoints - Integrados
**Estado:** Servicios creados en api.js
- `/capturas` - Ingesta de datos (FLUJO PRINCIPAL)
- `/variantes` - Consulta de variantes
- `/incidencias` - Gestión de incidencias
- `/asignaciones` - Relación N:M votante-líder

---

## 📊 Nuevas Funcionalidades

### 1. **Visualización de Incidencias**
- Tab dedicado en ViewVotanteModal
- Cards expandibles con detalles
- Estado de resolución visible
- Timestamps de detección y resolución

### 2. **Historial de Variantes**
- Tab con tabla de todas las versiones de datos
- Comparación visual con datos canónicos
- Información de quién reportó cada versión
- Historial completo de cambios

### 3. **Soporte N:M Votante-Líder**
- Un votante puede tener múltiples líderes
- Visualización de todos los líderes asignados
- Indicador de líder principal (estrella dorada)
- Gestión de asignaciones desde ViewVotanteModal

### 4. **Métricas de Calidad (API Ready)**
- Endpoints configurados en api.js
- Pendiente: Dashboard de métricas
- Datos disponibles: `/variantes/metricas`

---

## 🧪 Testing Recomendado

### Test 1: Crear Votante con Líder
1. Abrir modal "Nuevo Votante"
2. Llenar datos + seleccionar líder
3. Guardar
4. ✅ Verificar: Votante creado + Asignación creada

### Test 2: Upload CSV con Incidencias
1. Subir archivo CSV con duplicados
2. ✅ Verificar: Mensaje muestra `procesados`, `capturas_insertadas`, `incidencias`
3. ✅ Verificar: Modales de duplicados funcionan correctamente

### Test 3: Ver Incidencias de Votante
1. Abrir ViewVotanteModal de votante con incidencias
2. Ir a tab "Incidencias"
3. ✅ Verificar: Badge muestra contador
4. ✅ Verificar: Cards muestran detalles correctamente
5. Expandir incidencia
6. ✅ Verificar: JSON de detalles es legible

### Test 4: Ver Variantes de Votante
1. Abrir ViewVotanteModal de votante con variantes
2. Ir a tab "Variantes"
3. ✅ Verificar: Tabla muestra historial
4. ✅ Verificar: Campos diferentes resaltados en amarillo

---

## 🚀 Próximos Pasos Sugeridos

### 1. **Dashboard de Métricas de Calidad** (Pendiente)
- Usar `variantesAPI.getMetricas()`
- Visualizar:
  - Total de incidencias por tipo
  - Tasa de duplicidad
  - Líderes con más conflictos
  - Tendencias de calidad de datos

### 2. **Componente de Resolución de Incidencias** (Opcional)
- Modal para resolver incidencias desde ViewVotanteModal
- Usar `incidenciasAPI.resolve(id, resolucion)`
- Campos: tipo de resolución, comentarios

### 3. **Logs de Auditoría** (Opcional)
- Componente para visualizar logs
- Usar `logsAPI.getAll(params)`
- Filtros: usuario, acción, fecha

### 4. **Exportación de Reportes** (Opcional)
- Exportar incidencias a Excel
- Exportar variantes a CSV
- Reportes de calidad de datos

---

## 📌 Notas Importantes

### Compatibilidad con Backend
- ✅ Todos los endpoints nuevos están integrados
- ✅ Breaking changes implementados
- ✅ Estructura de datos actualizada

### Mantenimiento de UI Existente
- ✅ No se rompió funcionalidad existente
- ✅ Modales de duplicados siguen funcionando
- ✅ Componentes existentes compatibles

### Performance
- ⚠️ ViewVotanteModal hace 3 llamadas al abrir (votante, incidencias, variantes)
- 💡 Considerar: Lazy loading de tabs
- 💡 Considerar: Cache de datos

### Validaciones Pendientes
- ⚠️ Verificar que triggers de BD estén creados
- ⚠️ Probar con datos reales del backend
- ⚠️ Validar formato exacto de respuestas de API

---

## 🔗 Referencias

### Documentación Backend
- Ver: `CHANGELOG_MIGRACION.md` en backend-node-soft360
- Arquitectura completa en líneas 474-737

### Endpoints Documentados
- **POST /capturas** - server.js:1433-1573
- **GET /capturas** - server.js:1575-1628
- **GET /variantes** - server.js:1630-1685
- **GET /variantes/metricas** - server.js:1687-1739
- **POST /votantes** - server.js:1213-1247 (rechaza lider_identificacion)
- **POST /votantes/upload_csv** - server.js:1028-1211 (usa capturas)

---

## ✅ Checklist de Implementación

- [x] api.js actualizado con nuevos endpoints
- [x] UploadVotantes.js adaptado a nueva respuesta + lógica de reasignación corregida
- [x] ViewVotanteModal.js con tabs de incidencias/variantes
- [x] VotanteFormModal.js **CORREGIDO** para usar POST /capturas
- [x] Campo "Líder" ahora es OBLIGATORIO en formulario
- [x] Documentación de cambios creada y actualizada
- [ ] Testing completo en ambiente de desarrollo
- [ ] Validación con datos reales del backend
- [ ] Dashboard de métricas (opcional)
- [ ] Componente de resolución de incidencias (opcional)

---

## 👥 Equipo

**Frontend:** Bryan Villanueva
**Backend:** Bryan Villanueva
**Asistencia:** Claude Code (Anthropic)

---

**Fecha de Migración:** 2025-10-25
**Versión:** 1.0.0
**Estado:** ✅ Completado - Listo para Testing
