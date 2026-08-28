# Reflexión — Entrega 03

> Ocho preguntas para comprobar lo esencial de la clase 3. Respuestas concretas, con
> evidencia del proyecto.

### 1. ¿Qué diferencia hay entre el recurso y su representación JSON?

El recurso es la entidad conceptual: una solicitud de mantenimiento con un ciclo de vida.
El JSON es **una representación** de su estado en un momento dado: la forma de comunicarla
por HTTP. El mismo recurso puede representarse de distintas maneras (aquí como objeto JS
que Express serializa a JSON), y la representación cambia en cada respuesta mientras el
recurso sigue siendo el mismo.

### 2. ¿Qué diferencia hay entre PUT y PATCH?

Son intenciones distintas, no tamaños distintos. `PUT` reemplaza la representación
completa: el cliente manda todos los campos. `PATCH` modifica una parte: solo viajan los
campos que cambian. En esta API usamos `PATCH` para la actualización parcial, y los campos
del servidor (`id`, `createdAt`, `updatedAt`) se ignoran en el body.

### 3. ¿Qué significa que una operación sea idempotente?

Que repetirla deja el mismo estado final que ejecutarla una sola vez. En nuestro diseño,
`PATCH` lo es en la práctica para los campos: pedir `priority: "low"` dos veces produce el
mismo resultado que pedirlo una vez. No se trata de que "devuelva siempre lo mismo", sino
de que el estado resultante tras N ejecuciones sea idéntico al de una ejecución.

### 4. "HTTP no recuerda nada": ¿hasta dónde llega esa afirmación?

Llega al **protocolo**: HTTP es stateless, no recuerda interacciones anteriores entre
cliente y servidor. No quiere decir que el backend no pueda guardar estado: al contrario,
los datos viven en memoria en `requests.store.js`, y por eso podemos consultar mañana la
solicitud que creamos hoy. Recordar es trabajo del backend, no del protocolo.

### 5. ¿Por qué una transición inválida es 409 y no 400?

Porque la petición `{"status":"closed"}` es **válida en su forma**: `closed` pertenece al
conjunto de estados. Lo que la vuelve imposible es el **estado actual** del recurso (no hay
transición `open → closed` en la máquina). El `400` es para peticiones mal formadas; el
`409` comunica "la petición está correcta, pero el estado actual la prohíbe" e invita al
cliente a releer el estado del recurso (GET) en lugar de reintentar a ciegas.

### 6. ¿Por qué cancelar en vez de borrar?

Para preservar historia, referencias y auditoría. Borrar elimina el registro: un cliente
con `id 5` vería un `404` sin poder distinguir "nunca existió" de "qué pasó". Cancelar
registra la interrupción sin destruir información: la solicitud queda en estado terminal
`cancelled`, alcanzable desde `open` e `in_progress`, y se distingue de `closed` (cerrar
culmina el trabajo, cancelar lo interrumpe). Es una decisión documentada en
`001-cancel-instead-of-delete.md`, no una regla universal.

### 7. ¿Qué responsabilidad tiene cada archivo del módulo?

* `requests.routes.js`: por aquí **entra y sale HTTP**; decide códigos de estado y cuerpos,
  pero no toca el array directamente ni evalúa transiciones.
* `requests.store.js`: **administra el array y la identidad** (ids que solo avanzan); no
  sabe qué es un status code.
* `request-status.js`: **declara estados y transiciones y valida movimientos**; no conoce
  ni Express ni el array. Si mañana cambia una transición, solo se toca este archivo.

### 8. ¿Dónde viven los datos y qué se pierde al reiniciar?

En memoria, dentro del proceso Node (`requests.store.js`). Al reiniciar el servidor se
pierden todas las solicitudes y el contador de ids vuelve a empezar. Es comportamiento
esperado y documentado del proyecto; la persistencia (archivo o base de datos) es el
problema de una clase futura.