# Refactor log — Clase 08

Registro del refactor seguro. Un cambio pequeño por fila, SIEMPRE con las
pruebas como red. Regla: si cambió la ruta, el status, el body o el
permiso, no fue solamente un refactor.

## Antes de empezar

* Prueba(s) que protegen la operación: `test/requests-history.test.js`
  (6 pruebas: requiere auth · el owner lee el historial más viejo primero ·
  un requester ajeno recibe el mismo 404 que una request inexistente ·
  un agente lee cualquier historial · historial vacío devuelve 200 [] ·
  los eventos no exponen información sensible).
* Resultado de la suite ANTES del refactor: baseline verde — 39 pass / 0 fail / 13 todo.
* Commit de partida: `4ca0f38` (class-08-baseline).

## Pasos

| # | Qué extraje / moví | ¿A dónde? | Suite después (pass/fail) |
| --- | --- | --- | --- |
| 1 | Orquestación del caso `GET /:id/history`: `getHistory({ actor, id })` que decide leer → autorizar → consultar → representar, reconectando piezas que YA existían (`findById` + `canViewHistory` + `findHistory` + `mapHistoryEventRow`) | `requests.service.js` (nueva export) | 39 / 0 (verde, sin tocar la ruta) |
| 2 | El handler gordo: validación manual del id, los dos `SELECT` con `pool`, la regla de visibilidad escrita a mano y el mapping manual orden combinado caracter por caracter | Route delgada: `parseIdParam` + `getHistory` + `res.json`; SQL a `requests.store.js`, regla a `request.policy.js`, shape a `request.mapper.js` (eliminados los imports de `pool` y `AppError` de la ruta) | 39 / 0 (verde) |

## Verificación final

* Diff revisado: ¿algún cambio observable accidental? No. Misma ruta
  (`GET /requests/:id/history`), mismo 200, mismo body de eventos ordenado
  más viejo primero, mismos permisos (agente: cualquiera · requester: solo
  sus propias, y una ajena se 404 igual que una inexistente). La suite de
  history y el check "Previous behavior preserved" del validador lo
  confirman.
* Suite completa en verde: sí — 39 pass / 0 fail / 13 todo.
* Commit del refactor: `class-08-refactor` — `1412cc5` (la feature quedó en `131f0fc`, class-08-feature, con las pruebas de policy y claim).

## Qué preguntaste a la IA (y qué verificaste)

* Pregunta: ¿conviene consultar el historial antes de autorizar, para
  ahorrarse un query? Respuesta útil: no — la regla de visibilidad debe
  correr igual aunque la request no tenga eventos, y el 404-de-ajena debe
  ser idéntico al 404-de-inexistente; por eso el servicio consulta la
  request, autoriza y solo entonces lee el historial. Lo verifiqué con la
  prueba de "stranger requester": la respuesta de una request ajena y la
  de una inexistente comparten status y código `REQUEST_NOT_FOUND`.

## Qué propuesta de la IA descartaste por sobrearquitectura

* Descarté introducir un patrón de repositorio/QueryHandler (o un módulo
  "views" aparte). El refactor pedido es devolver cada responsabilidad a
  la capa que ya la tenía (store, policy, mapper) y darle al caso un
  nombre en el service. Añadir abstracciones de acceso a datos no cambiaba
  ninguna decisión de negocio y habría aumentado el acoplamiento con
  piezas que hoy no tienen consumidores; la estructura route → service →
  store/policy/mapper alcanza.