# Examen de conocimiento asistido por IA — clases 1-7

Guarda aquí el TRANSCRIPT COMPLETO de tu examen conversacional
(ITSU-KNOWLEDGE-01-07-1.0): todas las preguntas, todas tus respuestas,
todas las repreguntas y los cuatro bloques del cierre. Sin editar.

> Este examen complementa la evaluación de evidencia: mide lo que puedes
> explicar SIN el repositorio delante. El docente cruza ambos resultados
> y puede verificar cualquier respuesta oralmente.

## Metadata de mi examen

* studentId: nomar.arroyo.itsu@gmail.com
* Modelo utilizado: big-pickle (opencode)
* Fecha: 2026-09-29
* ¿Formato inválido y reparado una vez?: no

## TRANSCRIPT COMPLETO (desde COMENZAR hasta el BLOQUE 4)

```text
EXAMINADOR (big-pickle / opencode): Voy a conducir un examen oral de las
clases 1 a 7. Serán siete preguntas, una por clase y en orden, cada una
con una repregunta. Responde de memoria, con tus palabras y sin material.
Los resultados llegan al final en cuatro bloques. Escribe COMENZAR para
arrancar.

ESTUDIANTE (nomar.arroyo.itsu@gmail.com): COMENZAR

EXAMINADOR — P1 (clase 1): El servidor del proyecto está apagado y el
navegador pide GET /requests. ¿Qué observa el usuario y por qué?

ESTUDIANTE: No recibe una respuesta HTTP del backend: el navegador
muestra un error de conexión (tipo ERR_CONNECTION_REFUSED). Ocurre
porque el backend es un proceso que tiene que estar activo escuchando el
puerto; si el proceso no corre, nadie atiende la conexión y el socket se
rechaza. La petición ni siquiera llega a ser decidida.

REPREGUNTA (clase 1): Ese error de conexión, ¿es una respuesta HTTP como
un 500?

ESTUDIANTE: No. Un 500 es una respuesta que el servidor SÍ logró emitir
(el proceso estaba vivo) pero que reporta un fallo interno. El error de
conexión es del lado del cliente/protocolo: el navegador ni logró
establecer la conexión. La distinción sirve para no confundir "el
servicio falló" (HTTP 5xx) con "no hay servicio que atienda" (falla de
red, fuera del contrato).

EXAMINADOR — P2 (clase 2): Un cliente quiere "marcar como en progreso"
una solicitud existente. ¿Qué método y ruta usas, y qué status espera el
cliente si no está autenticado?

ESTUDIANTE: PATCH /requests/:id — es una actualización parcial de una
transición de estado sobre un recurso existente, no una creación (POST)
ni un borrado (DELETE). Sin token, el middleware de autenticación
responde 401 Unauthorized antes de entrar a la lógica, y con requestId en
el cuerpo del error.

REPREGUNTA (clase 2): El mismo PATCH, autenticado, lo hace un requester
que no es agente. ¿Qué status recibe y cómo se distingue del anterior?

ESTUDIANTE: Recibe 403 Forbidden: el 401 significa "no sé quién eres"
(faltó o falló la credencial), y el 403 "ya sé quién eres pero no puedes
hacer eso". En el proyecto esa regla la decide la policy: canChangeStatus
la tiene solo el agente. Y si el recurso ni siquiera existe o no le
pertenece, la API usa 404-as-missing para no revelar existencia.

EXAMINADOR — P3 (clase 3): ¿Por qué PATCH status: "cancelled" sobre una
request "open" es válido, pero sobre una "closed" termina en 409?

ESTUDIANTE: Porque "open" está en el conjunto de estados desde donde se
puede transicionar a "cancelled", y "closed" no. El dato es perfectamente
válido y el recurso existe: lo que falla es la compatibilidad con el
ESTADO ACTUAL. Por eso es 409 Conflict y no 400: 400 sería un dato que
viola el contrato (ej. priority "urgent"), 404 sería recurso inexistente.

REPREGUNTA (clase 3): En el mismo PATCH llegan status: "closed" y
priority: "urgent". ¿Qué responde primero y por qué el orden importa?

ESTUDIANTE: Primero 400 INVALID_PRIORITY, porque la validación del
contrato ocurre antes de consultar la máquina de estados. El orden
importa para no revelar información del recurso (ni de su estado actual)
cuando el pedido ni siquiera es válido: valido primero, autorizo después
y por último evalúo la transición sobre el estado real.

EXAMINADOR — P4 (clase 4): El esquema ya está migrado y sembrado. Mañana
cada solicitud debe pertenecer a un agente. ¿Qué herramienta usas y qué
jamás haces con lo que ya está aplicado?

ESTUDIANTE: Una migración nueva (la 006 con la columna assigned_to y su
constraint o índice). Jamás edito las migraciones aplicadas (001-005):
están registradas en schema_migrations y ya corrieron en las bases; si
las reescribo, las bases divergen y el checksum se rompe. Si hace falta
cambio sobre lo ya migrado, agrego una migración que evolucione.

REPREGUNTA (clase 4): ¿Y la cadena de conexión de esa base, dónde vive y
qué pasa si entra al repositorio?

ESTUDIANTE: Vive en .env, que está en .gitignore: el secreto se inyecta
por variable de entorno y jamás se comitea. Si entrara al repo, quedaría
expuesto en el historial de git aunque después lo borres: habría que
rotar la credencial, no solo quitar la línea.

EXAMINADOR — P5 (clase 5): El payload del token dice role: "agent".
¿Por qué confías en ese claim y qué ocurre si el cliente manda
role: "agent" en el body?

ESTUDIANTE: Confío porque el servidor verifica la firma del JWT con el
secreto y su expiración EN CADA petición: el payload es solo JSON
firmado, no alcanza con decodificarlo — cualquiera puede decodificarlo.
La identidad y el rol se derivan del token verificado (req.auth), jamás
del body: si el cliente manda role en el body, es un campo controlado por
el servidor y se rechaza (400 SERVER_CONTROLLED_FIELD) sin dejarse
engañar.

REPREGUNTA (clase 5): ¿Qué pasaría si el backend verificara la firma solo
la primera vez y guardara req.auth en una variable global?

ESTUDIANTE: Permitiría escalar y falsear identidades: la verificación
tiene que ser por petición porque el token puede expirar o ser revocado,
y una variable global la comparten todos los clientes. Además las
contraseñas se guardan hasheadas, nunca en claro: un robo de la base no
debe exponer credenciales originales.

EXAMINADOR — P6 (clase 6): Llegás a un repo ajeno del curso. En qué
orden levantás el entorno y qué harías para tocar una regla de
autorización con seguridad?

ESTUDIANTE: 1) configurar .env, 2) npm install, 3) migrar (db:migrate),
4) sembrar (db:seed), 5) correr la suite/validator para verificar el
punto de partida. Para tocar una regla de autorización: primero escribo
la prueba que falla con el comportamiento viejo, luego cambio la policy,
y al final la suite completa debe quedar verde — la regresión se
demuestra con la prueba que falla ANTES de corregir.

REPREGUNTA (clase 6): Para filtrar quién ve una solicitud, ¿qué capa
tocás: route, service, store o policy?

ESTUDIANTE: La policy: ahí vive canViewRequest y canViewHistory, es pura
(sin Express y sin SQL), recibe actor + recurso y devuelve si puede. La
route solo parsea y responde, el service coordina y traduce el permiso en
el status HTTP, y el store solo persiste/consulta. Cambiar la regla en la
policy no toca SQL ni HTTP.

EXAMINADOR — P7 (clase 7): Un cliente reporta que GET /requests/abc
devuelve 500. Separá síntoma, hipótesis y causa, y decime qué hacés
antes de corregir.

ESTUDIANTE: Síntoma: un id no numérico devuelve 500 en vez de un 4xx.
Hipótesis: el id inválido llega sin validar hasta la consulta SQL.
Causa (confirmada reproduciéndolo ANTES de corregir): sin parseIdParam,
el valor entra como parámetro y PostgreSQL lo rechaza al convertirlo a
bigint, y el error técnico sube hasta el error-handler que responde el
500 genérico. Corrección: validar el id COMPLETO en la frontera HTTP y
responder 400 INVALID_REQUEST_ID con requestId; el detalle técnico queda
en el log, no en la respuesta.

REPREGUNTA (clase 7): /ready responde 503 cuando la base no alcanza.
¿Es un error o un contrato? ¿Y el 500 del error-handler?

ESTUDIANTE: Es un contrato, no un fallo: readiness dice "aún no me
mandes tráfico, la dependencia no responde" (un 503 deliberado), mientras
/health responde 200 si el PROCESO vive aunque la base caiga. El 500 del
error-handler es para errores inesperados: oculta el detalle interno al
cliente, responde en formato consistente (código + requestId) y registra
en el log solo lo que está en la allowlist, jamás secretos.

EXAMINADOR: Examen terminado. Estas son tus cuatro bloques.

BLOQUE 1 — RESULT_CODE

ITSU-KNOWLEDGE|V=1.0|R=BACKEND-01-07-K1|C01=4|C02=3|C03=4|C04=3|C05=4|C06=3|C07=4|ACTION=NONE

BLOQUE 2 — JSON

{
  "resultCode": "ITSU-KNOWLEDGE|V=1.0|R=BACKEND-01-07-K1|C01=4|C02=3|C03=4|C04=3|C05=4|C06=3|C07=4|ACTION=NONE",
  "studentId": "nomar.arroyo.itsu@gmail.com",
  "action": "NONE",
  "signals": ["NONE"],
  "classes": [
    { "classId": "01", "level": 4, "question": "Qué observa el usuario cuando el servidor está apagado", "evidence": "distingue falla de red (ERR_CONNECTION_REFUSED) de un 500; la repregunta revela que comprende la consecuencia, no solo la definición." },
    { "classId": "02", "level": 3, "question": "Método y ruta para una transición de estado y el status sin autenticación", "evidence": "PATCH /requests/:id y separa 401 de 403 anclando en canChangeStatus; sostiene la repregunta con la decision de visibilidad." },
    { "classId": "03", "level": 4, "question": "Por qué 'cancelled' se permite desde open pero no desde closed", "evidence": "explica el 409 por estado actual y la repregunta revela que domina el orden validación-autorización-transición (consecuencia)." },
    { "classId": "04", "level": 3, "question": "Qué herramienta para evolucionar el esquema y qué jamás se edita", "evidence": "migración nueva y no reescritura de aplicadas (schema_migrations, bases divergentes); repregunta sobre secretos correcta." },
    { "classId": "05", "level": 4, "question": "Por qué confiar en el claim del token y qué pasa con role en el body", "evidence": "firma+expiración por petición, identidad del token jamás del body; la repregunta revela la consecuencia de verificar una sola vez." },
    { "classId": "06", "level": 3, "question": "Orden para levantar un repo ajeno y prueba que falla antes de corregir", "evidence": "configurar→instalar→migrar→sembrar→verificar y ubica la regla de autorización en la policy; sostiene la repregunta." },
    { "classId": "07", "level": 4, "question": "Síntoma, hipótesis y causa de un 500 con id inválido", "evidence": "separa síntoma/hipótesis/causa con reproducción previa y la repregunta deslinda 503 deliberado (readiness) de 500 interno." }
  ],
  "reviewTopics": [
    "Orden de validación: contrato (400) antes que ownership y máquina de estados (403/404/409) — objetivo 3",
    "Diferencia entre 5xx por falla interna y 503 deliberado de readiness — objetivo 7",
    "404-as-missing vs 403 en la política de ownership — objetivo 5"
  ],
  "teacherDigest": "Respuestas correctas, de memoria y con consecuencias reales en 4 de 7 clases. Sin señales (NONE). Refuerzo opcional: orden de validaciones y 404 vs 403. La clase 8 (claim) debería sostener estas reglas. Confianza alta en la autonomía."
}

BLOQUE 3 — REPORTE DEL ESTUDIANTE

Qué explicó bien: distinguiste el error de conexión (el proceso no está,
fuera del contrato HTTP) del 500 (el proceso vive y falló), con el
ERR_CONNECTION_REFUSED como ancla. En tu PATCH separaste 401 de 403 con
la policy real y hasta mencionaste el 404-as-missing. En los estados
respondiste por qué open→cancelled vale y closed→cancelled no, y en la
repregunta desplegaste el orden correcto: validar contrato antes de
autorizar y antes de evaluar la transición. En contraseñas/datos del
token sostuviste la firma por petición, el rechazo del role por body
(SERVER_CONTROLLED_FIELD) y el hashing. En el incidente separaste
síntoma, hipótesis y causa exigiendo reproducción previa, y deslindaste
el 503 deliberado de readiness del 500 interno del error-handler.

Qué revelaron las repreguntas: ninguna se te cayó; en las cuatro donde
subiste a nivel 4 mostraste consecuencias (falsificar la identidad si la
firma se verifica una sola vez; filtrar por no validar primero; mezclar
503 con 500; confundir falla de red con 5xx). Donde te quedaste en 3 fue
por respuestas correctas pero más descriptivas que demostrativas: en el
orden de levantamiento de un proyecto ajeno y en el 401/403.

Tres temas concretos de repaso (y dónde están en el proyecto):
1) Orden validación→autorización→transición — src/modules/requests/
   requests.service.js (valida contrato antes de policy).
2) 404-as-missing vs 403 — src/modules/requests/request.policy.js y la
   decisión registrada en docs decisions de la clase 05.
3) 503 deliberado de readiness vs 500 interno — src/routes/health.routes.js
   y src/middleware/error-handler.js.

BLOQUE 4 — FEEDBACK DOCENTE

Prioridades transversales: el dominio del orden entre capas y de los
códigos por estado (400/403/404/409/503) es sólido y se mantiene en la
clase 8 — el claim debe conservarlo (validar id en la frontera, policy de
rol antes de transición, 409 por estado/ya asignada). Sin señales
registradas: las respuestas fueron propias, de memoria y con lenguaje del
proyecto (NONE).

Pregunta oral sugerida 1: "En el flujo de claim, qué responde si quien
llama es un agente autenticado pero la solicitud ya tiene otro agente, y
por qué ese código y no otro?" Respuesta mínima: 409 Conflict (código de
dominio), porque la identidad y el permiso están OK y lo que falla es el
estado del recurso (incompatible: ya asignada).

Pregunta oral sugerida 2: "¿Qué responde /health con la base caída, y
qué respondería /ready, y para qué sirve esa diferencia?" Respuesta
mínima: /health 200 (proceso vivo, no depende de la base) y /ready 503
deliberado (dependencia no lista; señala que no conviene mandar tráfico).

Nivel de confianza del examen: alto — siete respuestas correctas y
ancladas, cuatro repreguntas sostenidas con consecuencias; nada que
sugiera lectura o material durante el examen.
```

## Metacognición (responde tú, después del examen)

1. ¿Qué pregunta o repregunta te costó más, y por qué crees que fue esa?

   La repregunta de la clase 6 ("qué capa tocas para filtrar quién ve una
   solicitud") fue la que más me hizo ordenar el razonamiento: lo sabía,
   pero por instinto decía "service". Tuve que sostener el criterio
   capa-por-capa (policy = regla pura; service = coordinación; store =
   SQL; route = HTTP). Creo que fue la más difícil porque en el código
   real el cambio "toca" la ruta y el service al agregar la llamada,
   aunque la regla viva en la policy, y hay que separar "dónde decide" de
   "dónde se llama".

2. Compara este resultado con tu reporte de evidencia: ¿coinciden? ¿Dónde
   difieren y qué te dice esa diferencia?

   Coinciden en lo central: fortalezas en la clase 3 (transiciones),
   clase 5 (auth/ownership) y clase 7 (incidente + health/readiness), que
   es justo donde el checkpoint dio K=3 y E=3-4. Difieren matices: el
   checkpoint calificó la V de las clases 1-5 en 2 (falta evidencia
   ejecutada) y aquí el nivel K salió 3-4 "de memoria" — lo que confirma
   que la brecha no es de comprensión sino de EVIDENCIA guardada. La
   diferencia me dice que debo dejar de tener el conocimiento "adentro" y
   empezar a demostrarlo con salidas reales (validadores de 1-5), porque
   un examinador externo no puede leer lo que no está en el repositorio.