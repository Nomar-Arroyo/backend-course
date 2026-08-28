# Entrega 03 — Recursos, estado y reglas

## Objetivo

Pasar de "tres rutas que funcionan" a una API coherente: un modelo de recurso, un contrato
HTTP y reglas que protegen el sistema cuando los datos y las operaciones empiezan a crecer.
Esta entrega cubre diseño previo (sin IA), máquina de estados, `PATCH`, filtros y un formato
de error unificado.

## Estructura

```
activities/class-03/
├── README.md
├── resource-model.md        (fase 1 · diseño sin IA)
├── http-contract.md         (fase 1 · diseño sin IA)
├── transition-map.md        (fase 1 · diseño sin IA)
├── test-matrix.md           (fase 1: esperados · fase 5: observados)
├── ai-usage.md              (fase 3 · uso de IA con contrato)
└── reflection.md            (fase 5 · reflexión)
```

El proyecto transversal de esta entrega vive en `activities/class-03/project/`.

## Fases

1. **Diseño sin IA** — modelo, contrato, máquina de estados y matriz completos antes de
   escribir código ni consultar IA. Se marca con el commit y tag `class-03-design`.
2. **Implementación** — migración a `modules/requests/`, `request-status.js` con la máquina
   de estados, `PATCH /requests/:id` con `409`, filtros combinables y formato de error
   `{ error: { code, message } }`.
3. **IA con contrato** — la IA solo revisa después de la marca de diseño; no puede cambiar
   en silencio el contrato ni las reglas. Todo queda registrado en `ai-usage.md`.
4. **Decisión documentada** — `001-cancel-instead-of-delete.md` (cancelar en vez de borrar).
5. **Evidencia y reflexión** — matriz con resultados observados vía `curl` y las ocho
   preguntas de reflexión. Se cierra con `class-03-submission`.

## Estado

| Fase | Estado |
| ---- | ------ |
| 1 · Diseño sin IA | ✅ Documentos completos |
| 2 · Implementación | ✅ Commits progresivos + verificación curl |
| 3 · IA con contrato | ✅ `ai-usage.md` |
| 4 · Decisión | ✅ `001-cancel-instead-of-delete.md` |
| 5 · Evidencia y reflexión | ✅ Matriz observada + `reflection.md` |