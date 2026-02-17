# 🔧 Correcciones de Arquitectura de Staging

## Fecha: 2025-10-25
## Versión: 1.1.0 - CORRECCIONES APLICADAS

---

## 🚨 Problema Identificado

El flujo inicial implementado era **INCORRECTO**:

```javascript
// ❌ INCORRECTO - VotanteFormModal.js (versión anterior)
await axios.post("/votantes", { ... });          // Iba directo al canónico
await axios.post("/asignaciones", { ... });      // Creaba asignación manualmente
```

**Problema:** Se saltaba la arquitectura de staging completa. No se generaban:
- ❌ Capturas de datos
- ❌ Detección automática de incidencias
- ❌ Variantes de datos
- ❌ Auditoría completa

---

## ✅ Solución Implementada

### 🎯 Concepto Clave: Staging First

**Todo reporte de datos debe pasar por staging:**

```javascript
// ✅ CORRECTO - VotanteFormModal.js (versión corregida)
await axios.post("/capturas", {
  votante_identificacion: "...",
  lider_identificacion: "...",  // OBLIGATORIO
  nombre: "...",
  // ... resto de campos
});

// El backend (trigger) automáticamente:
// ✅ Inserta en capturas_votante
// ✅ Crea/actualiza votante canónico
// ✅ Crea asignación N:M
// ✅ Detecta duplicados → Genera incidencias
// ✅ Crea variantes si hay diferencias
```

---

## 📝 Archivos Corregidos

### 1. **src/components/modals/VotanteFormModal.js** ✅

#### Cambios:
```diff
- await axios.post("/votantes", datosVotante);
- await axios.post("/asignaciones", { ... });

+ await axios.post("/capturas", datosCaptura);
+ // El trigger hace el resto automáticamente
```

#### Validaciones Añadidas:
- ✅ Campo "Líder" es ahora **OBLIGATORIO** (required)
- ✅ No permite guardar sin seleccionar líder
- ✅ Helper text actualizado: "OBLIGATORIO - El líder que reporta este votante debe ser especificado"
- ✅ Visual feedback con error state si no hay líder

#### Notificaciones:
```javascript
// Detecta incidencias en la respuesta
if (response.data.incidencias && response.data.incidencias.length > 0) {
  alert("⚠️ Votante registrado pero se detectaron incidencias...");
} else {
  alert("✅ Votante registrado exitosamente");
}
```

---

### 2. **src/components/UploadVotantes.js** ✅

#### Cambios en Lógica de Reasignación:

**Antes (Incorrecto):**
```javascript
// ❌ Usaba endpoint inexistente /votantes/reasignar
await axios.put("/votantes/reasignar", { ... });
```

**Ahora (Correcto):**
```javascript
// ✅ Usa arquitectura correcta
if (reassignOptions[dup.identificacion] === "new") {
  // Crear nueva asignación N:M
  await axios.post("/asignaciones", {
    votante_identificacion: dup.identificacion,
    lider_identificacion: dup.lider_intentado
  });

  // Si hay diferencias en datos, actualizar canónico
  if (hayDiferencias) {
    await axios.put(`/votantes/${dup.identificacion}`, {
      nombre: dup.nombre_intentado,
      // ... otros campos
    });
  }
}
```

#### Procesamiento de Incidencias:
```javascript
// Clasifica incidencias por tipo
const duplicadosMismoLider = incidencias.filter(i =>
  i.tipo === 'DUPLICIDAD_CON_SI_MISMO' || i.tipo === 'DUPLICIDAD_LIDER'
);
const duplicadosOtroLider = incidencias.filter(i =>
  i.tipo === 'DUPLICIDAD_ENTRE_LIDERES'
);
const conflictos = incidencias.filter(i =>
  i.tipo === 'CONFLICTO_DATOS'
);
```

---

## 🔑 Reglas de Arquitectura

### Cuándo Usar Cada Endpoint:

| Situación | Endpoint | Motivo |
|-----------|----------|--------|
| Líder reporta votante nuevo | `POST /capturas` | Flujo staging completo |
| Upload CSV de votantes | `POST /votantes/upload_csv` | Ya usa capturas internamente |
| Admin edita datos canónicos | `PUT /votantes/:id` | Edición directa validada |
| Asignar líder adicional | `POST /asignaciones` | Relación N:M |
| Desasignar líder | `DELETE /asignaciones` | Relación N:M |

### Endpoints que NO Deberías Usar Normalmente:

| Endpoint | Por Qué Evitarlo |
|----------|------------------|
| `POST /votantes` | Salta staging, no genera incidencias ni variantes |
| `PUT /votantes/reasignar` | No existe en nueva arquitectura |

---

## 📊 Flujo Completo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│  FLUJO CORRECTO CON STAGING                                 │
└─────────────────────────────────────────────────────────────┘

1. Usuario llena formulario
   ├─ Nombre: JUAN PEREZ
   ├─ Identificación: 1234567890
   ├─ Líder: MARIA GOMEZ (ID: 9876543210)
   └─ Submit
   ↓

2. Frontend: POST /capturas
   {
     votante_identificacion: "1234567890",
     lider_identificacion: "9876543210",
     nombre: "JUAN PEREZ",
     ...
   }
   ↓

3. Backend: Trigger tr_capturas_after_insert
   ├─→ INSERT INTO capturas_votante (...) ✅
   ├─→ ¿Existe en votantes?
   │   ├─ NO → INSERT INTO votantes (...) ✅
   │   └─ SÍ → Comparar datos...
   │           ├─ Iguales → Skip
   │           └─ Diferentes → INSERT INTO votante_variantes ✅
   │                          + INSERT INTO incidencias (CONFLICTO_DATOS) ✅
   ├─→ INSERT INTO votante_lider (N:M) ✅
   └─→ ¿Duplicado?
       ├─ Mismo líder, mismos datos → DUPLICIDAD_CON_SI_MISMO ✅
       ├─ Mismo líder, datos diferentes → DUPLICIDAD_LIDER ✅
       └─ Otro líder → DUPLICIDAD_ENTRE_LIDERES ✅
   ↓

4. Backend: Response
   {
     message: "Captura procesada",
     captura_id: 123,
     incidencias: [
       {
         tipo: "DUPLICIDAD_ENTRE_LIDERES",
         votante_identificacion: "1234567890",
         lider_identificacion: "9876543210",
         detalles: { ... }
       }
     ]
   }
   ↓

5. Frontend: Notifica al usuario
   ⚠️ "Votante registrado pero se detectaron incidencias:
      DUPLICIDAD_ENTRE_LIDERES
      Revisa el historial del votante para más detalles."
```

---

## 🧪 Testing Actualizado

### Test 1: Crear Votante Nuevo (Sin Duplicados)
1. Abrir modal "Nuevo Votante"
2. Llenar todos los campos
3. **Seleccionar un líder** (OBLIGATORIO)
4. Guardar

**Esperado:**
- ✅ Llamada a `POST /capturas`
- ✅ Mensaje: "✅ Votante registrado exitosamente"
- ✅ Votante aparece en lista
- ✅ Asignado al líder seleccionado

---

### Test 2: Crear Votante Duplicado
1. Crear votante con ID: 1234567890, Líder A
2. Intentar crear mismo votante con Líder B

**Esperado:**
- ✅ Llamada a `POST /capturas`
- ✅ Mensaje: "⚠️ Votante registrado pero se detectaron incidencias: DUPLICIDAD_ENTRE_LIDERES"
- ✅ Votante existe con AMBOS líderes asignados
- ✅ Incidencia registrada en tab "Incidencias" del modal de detalle

---

### Test 3: Intentar Guardar Sin Líder
1. Abrir modal "Nuevo Votante"
2. Llenar datos PERO NO seleccionar líder
3. Intentar guardar

**Esperado:**
- ❌ No permite guardar
- ✅ Alert: "Debes seleccionar un líder para reportar el votante"
- ✅ Campo "Líder" muestra error visual (borde rojo)

---

### Test 4: Upload CSV con Duplicados y Reasignación
1. Preparar CSV con votantes duplicados
2. Subir archivo
3. Sistema detecta duplicados entre líderes
4. Modal de reasignación aparece
5. Seleccionar "Asignar al nuevo líder"
6. Confirmar

**Esperado:**
- ✅ Llamada a `POST /asignaciones` para crear nueva relación
- ✅ Llamada a `PUT /votantes/:id` si hay diferencias de datos
- ✅ Mensaje: "✅ Proceso completado: 1 votante(s) reasignado(s)"
- ✅ Votante ahora tiene 2 líderes asignados

---

## ⚠️ Notas Importantes

### Líder Obligatorio
**Antes:** Campo opcional
**Ahora:** Campo OBLIGATORIO

**Motivo:** La arquitectura de staging requiere saber quién reporta cada dato. Si no hay líder, no se puede crear la captura.

**Alternativa futura:** Si se necesita crear votantes sin líder (ej: importación administrativa), usar:
```javascript
POST /votantes  // Directo al canónico (solo admin)
```

---

### Incidencias vs Errores

| Tipo | Comportamiento | Frontend |
|------|---------------|----------|
| **Incidencia** | Captura se guarda, proceso continúa, se registra problema | ⚠️ Warning, permite continuar |
| **Error** | Captura rechazada, proceso falla | ❌ Error, bloquea operación |

**Ejemplo:**
- Duplicado = **Incidencia** (se guarda captura + se crea incidencia)
- ID inválido = **Error** (rechaza request)

---

## 📌 Checklist de Verificación

Antes de hacer commit, verificar:

- [x] VotanteFormModal.js usa `POST /capturas`
- [x] Campo "Líder" es obligatorio en formulario
- [x] UploadVotantes.js procesa incidencias correctamente
- [x] Lógica de reasignación usa `POST /asignaciones` + `PUT /votantes`
- [x] No hay llamadas directas a `POST /votantes` en flujos normales
- [x] Documentación actualizada

---

## 🚀 Próximos Pasos

### Opcional: Panel de Administración
Si se necesita gestión directa del canónico (sin staging):

```javascript
// Componente: AdminVotantesPanel.js
const crearVotanteDirecto = async (datos) => {
  // Solo para administradores
  await axios.post("/votantes", datos);  // Salta staging
  // Usar con precaución
};
```

**Casos de uso:**
- Migración de datos históricos
- Corrección masiva de errores
- Importación desde otros sistemas

---

## ✅ Estado Final

**Versión:** 1.1.0 - CORRECCIONES APLICADAS
**Fecha:** 2025-10-25
**Estado:** ✅ Corregido y Documentado

**Archivos Afectados:**
- [x] VotanteFormModal.js - CORREGIDO
- [x] UploadVotantes.js - CORREGIDO
- [x] MIGRACION_STAGING.md - ACTUALIZADO
- [x] CORRECCIONES_STAGING.md - CREADO

---

**Autor:** Bryan Villanueva
**Asistencia:** Claude Code (Anthropic)
