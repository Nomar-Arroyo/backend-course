# Contrato HTTP — Request API Full

## Recurso

Una **solicitud** (`request`) representa un reporte de mantenimiento enviado por un usuario. Contiene un título, una descripción, un estado de seguimiento y una prioridad. Las solicitudes se almacenan en memoria y se identifican de forma única por un `id` numérico.

### Forma del recurso

| Campo         | Tipo    | Obligatorio | Quién lo asigna | Notas |
| ------------- | ------- | ----------- | --------------- | ----- |
| `id`          | number  | Sí          | El servidor     | Se asigna automáticamente al crear. Incremental. |
| `title`       | string  | Sí          | El cliente      | No puede estar vacío. |
| `description` | string  | No          | El cliente      | Descripción detallada del problema. |
| `status`      | string  | Sí          | El servidor     | Siempre inicia como `"open"` al crear. |
| `priority`    | string  | No          | El cliente      | `"high"`, `"medium"` o `"low"`. |

---

## Endpoint 1 — Listar solicitudes

| Elemento              | Valor |
| --------------------- | ----- |
| Método                | `GET` |
| Ruta                  | `/requests` |
| Entrada               | Ninguna |
| Respuesta de éxito    | `200 OK` con arreglo JSON de solicitudes |
| Respuestas de error   | Ninguna (devuelve arreglo vacío `[]` si no hay datos) |

**Ejemplo de respuesta**

```json
[
  {
    "id": 1,
    "title": "Projector does not turn on",
    "description": "The projector in room 204 shows no image during class.",
    "status": "open",
    "priority": "high"
  }
]
```

---

## Endpoint 2 — Consultar una solicitud

| Elemento              | Valor |
| --------------------- | ----- |
| Método                | `GET` |
| Ruta                  | `/requests/:id` |
| Entrada               | Path parameter `:id` (number) |
| Respuesta de éxito    | `200 OK` con el objeto de la solicitud |
| Respuestas de error   | `404 Not Found` si el `id` no corresponde a ninguna solicitud |

**Ejemplo de respuesta (éxito)**

```json
{
  "id": 2,
  "title": "Broken chair in the lab",
  "description": "One chair in the computer lab has a loose back rest.",
  "status": "in-progress",
  "priority": "medium"
}
```

**Ejemplo de respuesta (error)**

```json
{
  "error": "Request not found"
}
```

---

## Endpoint 3 — Crear una solicitud

| Elemento              | Valor |
| --------------------- | ----- |
| Método                | `POST` |
| Ruta                  | `/requests` |
| Entrada               | Body JSON con `title` (obligatorio), `description` y `priority` |
| Respuesta de éxito    | `201 Created` con la solicitud creada |
| Respuestas de error   | `400 Bad Request` si falta `title` o está vacío |

**Ejemplo de body de la petición**

```json
{
  "title": "Broken door lock",
  "description": "The lock on room 101 does not turn properly.",
  "priority": "high"
}
```

**Ejemplo de respuesta (éxito)**

```json
{
  "id": 4,
  "title": "Broken door lock",
  "description": "The lock on room 101 does not turn properly.",
  "status": "open",
  "priority": "high"
}
```

**Ejemplo de respuesta (error de validación)**

```json
{
  "error": "Title is required"
}
```

---

## Reglas transversales

1. ¿Qué `Content-Type` devuelven todas las respuestas? `application/json; charset=utf-8`
2. ¿Qué estado corresponde a una ruta que no existe en esta API? `404 Not Found`
3. ¿Qué forma tiene siempre un cuerpo de error? `{ "error": "mensaje descriptivo" }`
4. ¿Qué campos ignora el servidor si el cliente los envía en el body? `id` y `status` (el servidor los asigna)

## Decisiones que tomaste y por qué

- Se usa `201` en la creación en lugar de `200` porque se está generando un recurso nuevo, no devolviendo uno existente.
- El filtro por estado se omitió del contrato porque el alcance de esta entrega es solo los tres endpoints básicos.
- `description` y `priority` son opcionales porque una solicitud puede crearse con información mínima y enriquecerse después.
- El campo `status` siempre inicia en `"open"` porque el servidor es quien controla el ciclo de vida del recurso.
