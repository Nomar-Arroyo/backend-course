# Autoevaluación asistida por IA — checkpoint 1-7

Guarda aquí la salida COMPLETA y SIN EDITAR de tu única ejecución del
prompt ITSU-CHECKPOINT-01-07-1.0.

> Este reporte es un insumo de la evaluación del curso: el docente lo
> revisa junto con tu evidencia y puede verificarlo oralmente. Si no
> estás de acuerdo con algo, cuestiónalo con argumentos en la
> metacognición.

## Metadata de mi ejecución

* Modelo utilizado: big-pickle (opencode)
* Fecha: 2026-09-29
* Commit evaluado: 131f0fc (class-08-feature)
* ¿Necesité el prompt de reparación?: no

## BLOQUE 1 — RESULT_CODE

```text
ITSU-PROGRESS|V=1.0|R=BACKEND-01-07-R1|STATUS=COMPLETE|C01=3-3-2-3|C02=3-3-2-3|C03=3-3-2-3|C04=3-3-2-3|C05=3-3-2-3|C06=3-3-3-3|C07=3-3-3-4|ACTION=NONE
```

## BLOQUE 2 — JSON

```json
{
  "protocolVersion": "ITSU-CHECKPOINT-01-07-1.0",
  "rubricVersion": "BACKEND-01-07-R1",
  "status": "COMPLETE",
  "action": "NONE",
  "studentId": "nomar.arroyo.itsu@gmail.com",
  "modelReportedByStudent": "big-pickle (opencode)",
  "classes": [
    {
      "classId": "01",
      "title": "Fundamentos de backend",
      "levels": { "knowledge": 3, "practice": 3, "verification": 2, "explanation": 3 },
      "confidence": "high",
      "evidence": [
        { "artifact": "activities/class-01/src/server.js", "reference": "servidor ejecutable con http nativo" },
        { "artifact": "activities/class-01/README.md", "reference": "instrucciones de ejecución, rutas, 404 y health" },
        { "artifact": "course-progress-evidence-01-07.md (Q1)", "reference": "respuesta diagnóstica del flujo petición→respuesta y proceso activo" }
      ],
      "strength": "La respuesta Q1 describe el viaje completo (middlewares en orden, router, service, store, respuesta) y la razón de ser del proceso activo.",
      "gap": "La verificación (V) se apoya en el README y el código; no hay salida guardada de una corrida para esta clase.",
      "nextAction": "Guardar una salida real de ejecución del servidor de clase 01 para subir V."
    },
    {
      "classId": "02",
      "title": "HTTP y contratos",
      "levels": { "knowledge": 3, "practice": 3, "verification": 2, "explanation": 3 },
      "confidence": "high",
      "evidence": [
        { "artifact": "activities/class-02/docs/http-contract.md", "reference": "contrato de cada endpoint documentado" },
        { "artifact": "course-progress-evidence-01-07.md (Q2)", "reference": "respuesta sobre POST /requests: método, ruta, body y status" }
      ],
      "strength": "La respuesta Q2 instrumenta el contrato del POST /requests con códigos concretos (201, 400, 401, 403) y los dos proyectos de clase 02 quedaron FOUND.",
      "gap": "Sin evidencia de verificación automatizada para esta clase (pruebas manuales documentadas, no corridas guardadas).",
      "nextAction": "Elegir una ruta de clase 02 y capturar un intercambio HTTP real (o su prueba) como evidencia de verificación."
    },
    {
      "classId": "03",
      "title": "Recursos, estado y reglas",
      "levels": { "knowledge": 3, "practice": 3, "verification": 2, "explanation": 3 },
      "confidence": "high",
      "evidence": [
        { "artifact": "activities/class-03/resource-model.md", "reference": "modelo de recurso y propiedades" },
        { "artifact": "activities/class-03/project/src/modules/requests/request-status.js", "reference": "máquina de estados y transiciones" },
        { "artifact": "activities/class-03 docs/decisions/001-cancel-instead-of-delete.md", "reference": "decisión cancel vs delete" },
        { "artifact": "course-progress-evidence-01-07.md (Q3)", "reference": "representación vs dato inválido vs transición incompatible" }
      ],
      "strength": "La respuesta Q3 cita la máquina de estados, el 400 vs 409 y la decisión de cancel, con el recurso real del seed.",
      "gap": "La matriz de transiciones se documenta pero la V se apoya en el README; sin salida ejecutada.",
      "nextAction": "Guardar una corrida (prueba o validador) que muestre un 409 por transición inválida."
    },
    {
      "classId": "04",
      "title": "PostgreSQL y persistencia",
      "levels": { "knowledge": 3, "practice": 3, "verification": 2, "explanation": 3 },
      "confidence": "medium",
      "evidence": [
        { "artifact": "activities/class-04/database/migrations/", "reference": "migraciones y seed.sql" },
        { "artifact": "course-progress-evidence-01-07.md (Q4)", "reference": "migración vs seed vs transacción con ejemplo real" }
      ],
      "strength": "La respuesta Q4 distingue migración, seed y transacción y pone ejemplos concretos del proyecto (001-005 y el claim de clase 08).",
      "gap": "La evidencia V del entorno de clase 04 era un check-database grabado (NOT_VERIFIED); la conexión Supabase real se demuestra después (doctores 06/07).",
      "nextAction": "Reutilizar la salida del doctor 06/07 como evidencia de la base real; verificar por qué 001-004 no se editan."
    },
    {
      "classId": "05",
      "title": "Autenticación y autorización",
      "levels": { "knowledge": 3, "practice": 3, "verification": 2, "explanation": 3 },
      "confidence": "medium",
      "evidence": [
        { "artifact": "activities/class-05/src/middleware/authenticate.js", "reference": "middleware JWT y req.auth" },
        { "artifact": "activities/class-05/src/modules/requests/request.policy.js", "reference": "matriz de acceso y ownership" },
        { "artifact": "course-progress-evidence-01-07.md (Q5)", "reference": "autenticación vs autorización y verificación de firma" }
      ],
      "strength": "La respuesta Q5 explica por qué decodificar un JWT no basta (firma + expiración) y separa 401/403 con el middleware.",
      "gap": "La plantilla validation-evidence.md de clase 05 aparece con etapas sin salida; el validador existe (validate-class-05.js) pero su salida no quedó guardada.",
      "nextAction": "Correr y guardar la salida de validate-class-05.js como evidencia de verificación."
    },
    {
      "classId": "06",
      "title": "Onboarding y pruebas",
      "levels": { "knowledge": 3, "practice": 3, "verification": 3, "explanation": 3 },
      "confidence": "high",
      "evidence": [
        { "artifact": "activities/class-06/project/activities/class-06/validation-evidence.txt", "reference": "CLASS 06 FINAL VALIDATION — FINAL RESULT: PASSED (12/12)" },
        { "artifact": "activities/class-06/project/activities/class-06/work-log.md", "reference": "entorno, flujo y errores documentados" },
        { "artifact": "course-progress-evidence-01-07.md (Q6)", "reference": "prueba con preparación/acción/comprobación" }
      ],
      "strength": "Hay validador guardado PASSED y la respuesta Q6 descompone una prueba real de requests-history.test.js y la regresión que protege.",
      "gap": "La salida guardada es texto (NOT_VERIFIED como corrida) aunque el work-log respalda la ejecución del doctor.",
      "nextAction": "Mantener este nivel: adjuntar la salida real de npm test en futuros checkpoints."
    },
    {
      "classId": "07",
      "title": "Diagnóstico y errores",
      "levels": { "knowledge": 3, "practice": 3, "verification": 3, "explanation": 4 },
      "confidence": "high",
      "evidence": [
        { "artifact": "activities/class-07/project/incidents/INC-701-invalid-request-id.md", "reference": "incidente con síntoma, hipótesis y causa" },
        { "artifact": "activities/class-07/project/activities/class-07/incident-report.md", "reference": "reporte completo con reproducción y corrección" },
        { "artifact": "activities/class-07/project/activities/class-07/validation-evidence.txt", "reference": "CLASS 07 INCIDENT VALIDATION — FINAL RESULT: PASSED (12/12)" },
        { "artifact": "course-progress-evidence-01-07.md (Q7)", "reference": "INC-701 + distinción health vs readiness" }
      ],
      "strength": "La respuesta Q7 separa síntoma/hipótesis/causa con INC-701 real, la corrección (parseIdParam) y la diferencia entre /health (liveness) y /ready (readiness, 503 deliberado). Nivel de explicación con consecuencias: E=4.",
      "gap": "La salida guardada de clase 07 aparece con codificación alterada en el extracto automático (artefacto del redactor, no del contenido); se recomienda regenerar ese archivo en UTF-8.",
      "nextAction": "Regenerar activities/class-07 validation-evidence.txt en UTF-8 para que el extracto sea legible."
    }
  ],
  "progressPattern": {
    "label": "improving",
    "explanation": "Los niveles K/P son consistentes en las siete clases, con subida clara en V a partir de la clase 06 (validadores guardados PASSED) y un pico de explicación (E=4) en la clase 07, la más reciente."
  },
  "priorityConceptGaps": [
    "Cómo demostrar verificación con salidas reales ejecutadas, no solo archivos guardados (V de clases 1-5).",
    "La decisión 404-as-missing frente a 403 en recursos ajenos (justificarla y mantenerla en el claim de la clase 08).",
    "Por qué una migración aplicada no se edita y qué se hace cuando la base ya cambió (005 requiere compatibilidad con 001-004)."
  ],
  "studentNextSteps": [
    "Generar y guardar salidas reales (validate-class-05, corridas de clase 01-04) para subir la verificación de las clases iniciales.",
    "En la clase 08, conservar las fronteras: route sin SQL, service sin Express, y el contrato de errores con requestId en el claim.",
    "Regenerar el validation-evidence.txt de clase 07 en UTF-8 y revisar que los secrets nunca entren a los paquetes."
  ],
  "teacherFeedback": {
    "supportPriority": "low",
    "focusClassIds": ["04", "05"],
    "topicsToReinforce": [
      "Verificación de ejecución: diferenciar salida guardada (texto) de corrida ejecutada.",
      "decisiones de visibilidad 404 vs 403 en ownership.",
      "no editar migraciones aplicadas: adicionar 006+ en vez de reescribir 001-005."
    ],
    "oralVerificationRecommended": true,
    "oralQuestions": [
      "¿Por qué una solicitud ajena responde 404 y no 403, y por qué esa decisión también debe aplicarse al claim?  (mínimo: el 403 confirma existencia y filtra información; el 404-as-missing la oculta)",
      "¿Qué provocaría editar la migración 002 después de aplicarla en varias bases y cómo se corrige?  (mínimo: bases con esquemas divergentes; la corrección es una migración nueva, jamás reescribir la aplicada)"
    ],
    "integrityReview": "recommended",
    "integritySignals": ["NONE"],
    "reviewReason": "No se detectaron contradicciones entre evidencia, commits y respuestas; el tipo de cambio clásico de la V (clases 1-5) y una salida guardada con codificación alterada en clase 07 justifican verificación oral y una regeneración del archivo, no una sospecha de fondo.",
    "teacherDigest": "Evidencia completa para las 7 clases: K/P/E sólidos, V real solo desde la 06. Sin contradicciones (NONE). Recomendado: guardar salidas ejecutadas de 1-5, reforzar 404-vs-403 en el claim, regenerar el .txt de clase 07 en UTF-8. Soporte oral bajo."
  }
}
```

## BLOQUE 3 — Reporte del estudiante

Panorama: tus respuestas demuestran que entiendes el viaje completo de una petición (clase 01), lees el contrato HTTP y lo instrumentas con códigos reales (clase 02), separas dato inválido de transición inválida citando la máquina de estados (clase 03), distingues migración/seed/transacción con ejemplos del propio proyecto (clase 04), separas 401 de 403 y explicas el porqué de la verificación de firma (clase 05), descompones una prueba en preparación/acción/comprobación y nombras la regresión que protege (clase 06), y en el incidente INC-701 separas síntoma/hipótesis/causa y explicas la corrección con convicción (clase 07). El punto fuerte es la apropiación: citaste rutas y archivos concretos y conectaste consecuencias (404-as-missing, transacciones, health vs readiness).

Temas que necesitan refuerzo: (1) demostrar la VERIFICACIÓN con corridas reales — los validadores de clase 06/07 están guardados y en PASSED, pero de las clases 1-5 no hay una salida ejecutada que acompañe los artefactos; (2) justificar y sostener la decisión de visibilidad 404-vs-403 cuando llegue el claim de la clase 08; (3) el trato a las migraciones aplicadas: nunca editar 001-004, solo adicionar.

Evolución entre clases: notas estables en K/P y una subida real en verificación a partir de la clase 06, con el mejor nivel de explicación en la clase 07. Vas en mejora constante con base sólida.

Tres prioridades: 1) guarda una salida real (validator o comando) de las clases 1-5; 2) regenera en UTF-8 el validation-evidence.txt de clase 07; 3) lleva la disciplina de capas y el contrato de errores (requestId) al claim de la clase 08.

Preguntas para comprobar comprensión: ¿por qué un ajeno recibe 404 y no 403 en tu API? ¿qué pasaría si editas la migración 002 ya aplicada? ¿cuál es la diferencia de propósito entre /health y /ready?

Evidencia faltante: salidas ejecutadas de las clases 1-5.

## BLOQUE 4 — Feedback docente

Temas con mayor riesgo conceptual: las decisiones finas de autorización (404 vs 403) y el manejo evolutivo de migraciones en bases compartidas. Ambos se explican bien en el papel; la verificación oral confirmará el dominio.

Evidencia contradictoria o insuficiente: ninguna contradicción detectada. La única irregularidad es un archivo de salida de clase 07 que el redactor automático muestra con codificación alterada (artefacto del utf-16, no contenido); se recomienda regenerarlo en UTF-8.

Clases que conviene reforzar: 04 y 05 (más por evidencia de verificación que por contenido conceptual).

Verificación oral recomendada: sí, breve, centrada en 404-vs-403 y migraciones.

Preguntas priorizadas y respuesta mínima esperada: (1) "¿Por qué una solicitud ajena responde 404 y no 403?" → el 403 confirma existencia y filtra; el 404-as-missing la oculta. (2) "¿Qué provoca editar la migración 002 aplicada?" → bases divergentes; la corrección es una migración nueva. 

Nivel de confianza del reporte: alto para las clases 06-07 (validadores PASSED y respuestas precisas); medio-alto para el resto, en espera de la verificación oral.

---

## Mi lectura del reporte (metacognición — esto SÍ lo escribes tú)

* ¿Estoy de acuerdo con el reporte?

  Sí, en lo esencial. Las respuestas diagnósticas citan archivos y códigos reales del repositorio, y el reporte reconoce el punto fuerte que yo mismo detecté: la apropiación (citar rutas y consecuencias concretas). También coincide en la debilidad honesta: la verificación de las clases 1-5 descansa en archivos guardados y en el README, no en una corrida ejecutada, a diferencia de las clases 06-07 donde sí hay validador PASSED.

* ¿Qué criterio considero incorrecto?

  Ninguno incorrecto de fondo. Matizaría solo la lectura de la clase 05: el reporte la marca como refuerzo, pero `authenticate.js`, `request.policy.js` y el 404-as-missing están implementados, probados y aplicados en la feature de la clase 08; la debilidad ahí es de EVIDENCIA (falta salida del validate-class-05), no de comprensión.

* ¿Qué evidencia adicional aportaría?

  Una salida de `npm run validate:class-05`, y las pensé además para 1-4 (corridas reales de cada entorno). También regenerar en UTF-8 el validation-evidence.txt de clase 07 que el redactor automático muestra ilegible.

* ¿Qué recomendación voy a seguir?

  Las tres del reporte, en orden: 1) guardar salidas reales de validación para las clases 1-5; 2) regenerar el archivo de clase 07 en UTF-8; 3) mantener en el claim de la clase 08 la disciplina de capas y el contrato de errores (códigos con requestId, 401/403/404/409 correctos). La verificación oral de 404-vs-403 y de migraciones la tomo como repaso previo al cierre.