# Evaluator report

Guarda aquí los bloques 1, 3 y 4 de tu evaluación:

## BLOQUE 1 — RESULT_CODE

[ITSU-KNOWLEDGE|V=1.0|R=BACKEND-01-08-K1|ID=K09-nomar-arroyo-itsu-405d3ca|Q1=3-3-3-1|Q2=X-X-X-X|Q3=X-X-X-X|Q4=X-X-X-X|Q5=X-X-X-X|ACTION=SUPPORT]

## BLOQUE 3 — Reporte del estudiante

[Reporte de evaluación de conocimientos
Resultado general
La evaluación quedó PARCIAL por tiempo agotado. Solo se evaluó la Pregunta 1.

Desempeño por pregunta
Q1 — Reconstruye el recorrido: Demostró comprensión del contrato, citó archivos y describió el orden real. Vacío: no registró la corrección entre predicción y hallazgos.
Q2 — Protege una invariante: No evaluada.
Q3 — Identidad no equivale a permiso: No evaluada.
Q4 — Diagnostica sin adivinar: No evaluada.
Q5 — Analiza antes de cambiar: No evaluada.
Conceptos demostrados
Contrato de GET /requests/:id (método, path, params, headers, respuestas posibles) con referencias.
Componentes reales: authenticate, token, routes, service, store, policy y mapper.
Orden de ejecución y primera función propia: corsPolicy en src/middleware/cors.js.
Vacíos prioritarios
Verificación (Q1): Falta registrar explícitamente la predicción y qué corrigió al contrastarla con el código.
Rectificaciones valiosas
No registradas en esta sesión.

Tres acciones de estudio
Practica predicción corregida: Antes de leer código, escribe tu predicción y luego anota las correcciones.
Refuerza boundary HTTP/dominio: Identifica dónde termina HTTP y empieza la lógica de dominio en este flujo.
Usa comprobaciones concretas: Propón comandos o pruebas para verificar hipótesis.
Evidencia faltante
Corrección explícita entre predicción y hallazgos para Q1.]

## BLOQUE 4 — Feedback para el docente

[Feedback para el docente
Temas prioritarios: Verificación (predicción registrada y corregida).

Pregunta donde apareció: Q1 — Reconstruye el recorrido.

Evidencia concreta citada: src/http/parse-id.js, src/app.js, test/request-detail.test.js, src/middleware/cors.js, src/middleware/authenticate.js, src/modules/auth/token.js, src/modules/requests/requests.routes.js, requests.service.js, requests.store.js, request.mapper.js, src/modules/requests/request.policy.js.

Nivel de confianza: Medio (Q1 evaluada parcialmente).

Apoyo o verificación: Se recomienda verificación oral breve.

Preguntas orales (máximo 3):

Pregunta: ¿Qué parte de tu predicción inicial corregiste al mirar el código real de GET /requests/:id? Respuesta mínima esperada: Al menos una corrección concreta entre predicción y hallazgos.
Pregunta: ¿Dónde termina la preocupación por HTTP y comienza la lógica de dominio en este flujo? Respuesta mínima esperada: Identificación correcta de archivo/función que marca ese límite.
Pregunta: ¿Por qué no se invocó canViewRequest en getRequest y qué consecuencia tendría eso para requester ajeno? Respuesta mínima esperada: Explicación conectada a política de visibilidad y códigos (404/403) con evidencia.]
