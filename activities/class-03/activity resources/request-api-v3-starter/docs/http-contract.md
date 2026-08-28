# Contrato HTTP — Request API (estado al cerrar la clase 02)

> Este es el contrato de los tres endpoints existentes. En la clase 03 se amplía: filtros,
> actualización parcial, máquina de estados y formato de error unificado. **Escribe la nueva
> versión del contrato antes de implementarla** (plantilla en `activities/class-03/http-contract.md`).

## Recurso

Una **solicitud de mantenimiento** (`request`): un problema reportado que el equipo debe
atender.

### Forma del recurso

| Campo         | Tipo   | Obligatorio | Quién lo asigna | Notas                                  |
| ------------- | ------ | ----------- | --------------- | -------------------------------------- |
| `id`          | number | sí          | servidor        | secuencial, generado con `generateId()` |
| `title`       | string | sí          | cliente         | no puede estar vacío                   |
| `description` | string | no          | cliente         | `""` si no se envía                    |
| `status`      | string | sí          | servidor        | siempre `open` al crear                |
| `priority`    | string | no          | cliente         | `medium` si no se envía                |

## Endpoint 1 — Listar solicitudes

| Elemento            | Valor                                  |
| ------------------- | -------------------------------------- |
| Método              | `GET`                                  |
| Ruta                | `/requests`                            |
| Entrada             | ninguna                                |
| Respuesta de éxito  | `200` con el arreglo (puede ser `[]`)  |
| Respuestas de error | ninguna prevista                       |

## Endpoint 2 — Consultar una solicitud

| Elemento            | Valor                                   |
| ------------------- | --------------------------------------- |
| Método              | `GET`                                   |
| Ruta                | `/requests/:id`                         |
| Entrada             | `id` numérico en el path                |
| Respuesta de éxito  | `200` con la solicitud                  |
| Respuestas de error | `404` si no existe                      |

## Endpoint 3 — Crear una solicitud

| Elemento            | Valor                                              |
| ------------------- | -------------------------------------------------- |
| Método              | `POST`                                             |
| Ruta                | `/requests`                                        |
| Entrada             | body JSON con `title` (obligatorio), `description`, `priority` |
| Respuesta de éxito  | `201` con la solicitud creada                      |
| Respuestas de error | `400` si falta el `title` o está vacío             |

## Reglas transversales

1. Todas las respuestas devuelven `Content-Type: application/json`.
2. Una ruta que no existe responde `404`.
3. El cuerpo de error actual es `{ "error": "mensaje" }` — **en la clase 03 evoluciona** a
   `{ "error": { "code": "...", "message": "..." } }`; documenta ese cambio en tu contrato.
4. El servidor ignora los campos que el cliente no controla (`id`, `status` al crear).
