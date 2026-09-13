# Reflexión — Clase 05

1. **¿Qué diferencia hay entre identidad, autenticación y autorización?**
   La identidad es quién eres: en mi API, `req.auth = { userId, role }` que
   construye el middleware tras verificar el token. La autenticación es la
   prueba de que eres quien dices: presentar un JWT firmado que `verifyToken`
   valida (firma, algoritmo, issuer, audience y expiración). La autorización
   es qué puedes hacer una vez autenticado: el `requester` solo ve sus
   solicitudes y edita sus propias abiertas; el `agent` ve todas y cambia
   prioridad/estado. La matriz de acceso es exactamente la tabla de la
   estación 1 llevada a `request.policy.js`.

2. **¿Por qué `createdBy` y `changedBy` nunca llegan desde el body?**
   Porque el actor lo declara el servidor a partir del token verificado, no el
   cliente. Si el body pudiera setear quién creó o modificó algo, cualquier
   requester podría inyectar `createdBy` de otro usuario y robarle la propiedad,
   o un agente mentir sobre quién hizo cada cambio del historial. Por eso el
   register rechaza `role`/`id`/`createdAt`/`createdBy`/`passwordHash` con
   `400 SERVER_CONTROLLED_FIELD` (D6): rechazo explícito, nunca silencio.

3. **¿Qué diferencia hay entre `401` y `403`? ¿Y por qué a veces `404`?**
   `401` es "no hay identidad confiable": falta el Bearer, token inválido o
   vencido (`AUTHENTICATION_REQUIRED` / `INVALID_TOKEN`), o falló el login
   (`INVALID_CREDENTIALS`). `403` es "estás identificado pero no tienes
   permiso": un requester intentando cambiar prioridad, o un body mixto que
   incluye una acción de agente en su `PATCH` (`FORBIDDEN`). El `404` se usa
   en recursos ajenos: a un requester le respondo `404 REQUEST_NOT_FOUND`
   idéntico al de "no existe", en vez de `403`, para no filtrar la existencia
   de la solicitud y no habilitar enumeración (D2).

4. **¿Por qué decodificar un JWT no permite confiar en él?**
   El payload de un JWT es solo base64url: cualquiera puede leerlo **y
   modificarlo**. La confianza viene de verificar la firma contra el secreto
   (`jwtVerify`), y de validar issuer, audience y expiración. Si solo
   decodificara y usara `payload.role`, bastaría con editar el payload a
   `agent` y firmar con otro algoritmo para saltarme los permisos. El validador
   lo comprobó: tocar el token → `401 INVALID_TOKEN`.

5. **¿Por qué el `agent` sigue sujeto a la máquina de estados?**
   Los permisos por rol deciden *quién* puede operar, pero la máquina de
   estados define *qué operaciones son válidas* en cada momento. Un agente
   puede cambiar el estado, pero no puede ir de `cancelled` a `in_progress`
   ni saltarse `completed` → `resolved`; eso es `409 INVALID_TRANSITION`.
   Las reglas de negocio no son "más permisos = más estados": un rol alto
   ejecuta la transición, pero la transición sigue debiendo ser legal.

6. **¿Qué intentó romper el validador y qué limitación conserva esta solución?**
   El validador atacó registro con `role`, escalación por campos del servidor,
   emails duplicados y sin normalizar, contraseñas cortas, login con
   credenciales falsas, tokens editados/vencidos/ausentes, IDs ajenos (IDOR),
   bodies mixtos y transiciones inválidas; cada intento recibió el código
   esperado (400/401/403/404/409). Limitación conservada: la autorización es
   por rol y propiedad, no hay grupos ni recursos compartidos; un requester
   nunca podría delegar temporalmente una solicitud a otro. Los tokens viven
   3600s y no hay revocación: si algo se filtra, vive hasta que expira. Eso es
   aceptable para el alcance del taller, pero es la primera mejora que haría
   en una versión real.