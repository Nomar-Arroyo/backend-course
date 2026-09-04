# Entrega 04 — De SQL al backend persistente

## Objetivo

Llevar la API de solicitudes que vivía en memoria a una base de datos real. El estado deja
de ser un array en el proceso Node: pasa a **PostgreSQL** (Supabase), se conserva el
historial de cada cambio de estado (estado → antecedentes) y las escrituras que tocan dos
tablas se protegen con **transacciones**. Además se exige conectar, consultar y evidenciar
el trabajo contra la base, sin filtraciones de secretos.

## Estructura

```
activities/class-04/
├── README.md
├── data-model.md             (fase 1 · diseño sin IA)
├── persistence-contract.md   (fase 1 · diseño sin IA)
├── query-matrix.md           (fase 1 · diseño sin IA)
├── transaction-plan.md       (fase 1 · diseño sin IA)
├── error-map.md              (fase 1 · diseño sin IA)
├── test-matrix.md            (fase 1: esperados · fase 6: observados)
├── ai-usage.md               (fase 4 · uso de IA con contrato)
└── reflection.md             (fase 6 · reflexión)
```

El proyecto de esta entrega vive en `activities/class-04/project/`. La base de referencia
(no modificada) está en `activity resources/request-api-v4-starter/`.

## Fases

1. **Diseño sin IA** — las seis decisiones (modelo, contrato de persistencia, queries,
   transacción, errores y casos) se documentan **antes** de escribir código o consultar IA.
   Se marca con el commit y tag `class-04-design`.
2. **Configuración de la base** — proyecto individual en Supabase, `Session pooler`,
   `DATABASE_URL` en `.env` (nunca commiteado), `npm run db:check`, migraciones 001 y 002
   vía SQL Editor y datos semilla.
3. **Implementación** — `pool.js`, `transaction.js`, servicios y mappers; el store pasa a
   SQL parametrizado con las mismas 5 rutas (incluida `GET /requests/:id/history`),
   transacciones con rollback y errores sin secretos.
4. **IA con contrato** — la IA solo revisa luego de la marca de diseño; no puede cambiar en
   silencio tablas, columnas, rutas, estados ni transiciones. Todo queda registrado en
   `ai-usage.md`.
5. **Decisión documentada** — `002-preserve-status-history.md` (conservar el historial de
   estados).
6. **Evidencia y reflexión** — ejecutar la matriz (12 casos: persistencia tras reinicio y
   rollback incluidos) y responder las doce preguntas de reflexión. Se cierra con el tag
   `class-04-submission`.

## Estado

| Fase | Estado |
| ---- | ------ |
| 1 · Diseño sin IA | 🔨 Documentos en construcción |
| 2 · Configuración de la base | Pendiente |
| 3 · Implementación | Pendiente |
| 4 · IA con contrato | Pendiente |
| 5 · Decisión | Pendiente |
| 6 · Evidencia y reflexión | Pendiente |