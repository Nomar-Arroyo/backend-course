# Error map — categorías de error sin filtrar secretos

> Fase 1 · se completa **antes de usar IA y antes de tocar código**.
> Clasifica cada error según su categoría para traducirlo a HTTP de forma consistente y
> **sin filtrar** secretos ni detalles internos (`pg` puede exponer la cadena de conexión o
> esquema interno si se reenvía crudo).

## Formato de error (se mantiene de clase 3)

```json
{
  "error": {
    "code": "CODE_NAME",
    "message": "Human readable message"
  }
}
```

## Categorías y su traducción HTTP

La capa de servicio lanza errores **típados** (`AppError` con `category`) y las rutas los
traducen. La base de datos apenas lanza errores crudos; la capa los captura y **nunca** los
envía al cliente.

| Categoría | Significado | HTTP | Ejemplos de `code` |
| --------- | ----------- | ---- | ------------------ |
| `contract` | La petición no tiene la forma esperada (validación de entrada). Problema del cliente. | `400` | `MISSING_TITLE`, `INVALID_PRIORITY`, `INVALID_STATUS`, `NO_UPDATABLE_FIELDS` |
| `resource` | El recurso pedido no existe. | `404` | `REQUEST_NOT_FOUND` |
| `domain` | La petición está bien formada pero viola una regla de negocio (depende del estado actual). | `409` | `INVALID_STATUS_TRANSITION`, `REQUEST_IN_TERMINAL_STATUS` |
| `persistence` | Problema al leer/escribir en la base (conexión, query) **controlado**. | `500` | `DB_ERROR` |
| `infrastructure` | La base de datos no está disponible (falla de conexión al pool). | `503` | `DATABASE_UNAVAILABLE` |
| `internal` | Error inesperado/todo lo demás. | `500` | `INTERNAL_ERROR` |

## Regla de oro: nunca filtrar secretos

* El cliente **nunca** debe recibir el mensaje crudo de `pg` (puede contener la cadena de
  conexión, el host, el rol o el esquema interno).
* Ante un error de persistencia/infraestructura se responde un `message` genérico y seguro
  (p. ej. `"Database unavailable"`), y el **detalle real se registra en la consola del
  servidor** (`console.error`) para diagnóstico, no en el cuerpo de la respuesta.

## Mapa código → categoría

| Código | Categoría |
| ------ | --------- |
| `MISSING_TITLE` | contract → `400` |
| `INVALID_PRIORITY` | contract → `400` |
| `INVALID_STATUS` | contract → `400` |
| `NO_UPDATABLE_FIELDS` | contract → `400` |
| `REQUEST_NOT_FOUND` | resource → `404` |
| `INVALID_STATUS_TRANSITION` | domain → `409` |
| `REQUEST_IN_TERMINAL_STATUS` | domain → `409` |
| `DATABASE_UNAVAILABLE` | infrastructure → `503` |
| `DB_ERROR` | persistence → `500` |
| `INTERNAL_ERROR` | internal → `500` |

> Se conservan los códigos de clase 3 (`MISSING_TITLE`, `INVALID_PRIORITY`, `INVALID_STATUS`,
> `REQUEST_NOT_FOUND`, `INVALID_STATUS_TRANSITION`, `REQUEST_IN_TERMINAL_STATUS`) que el
> contrato ya publicó, y se añaden los de infraestructura/persistencia/interno. El contrato
> externo de los cuatro endpoints NO cambia.
