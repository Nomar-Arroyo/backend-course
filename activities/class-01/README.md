# Entrega 01 — El viaje de una petición

## Instrucciones para ejecutar

1. Asegúrate de tener Node.js instalado. Verifica con:
   ```bash
   node --version
   ```

2. Navega a la carpeta del servidor:
   ```bash
   cd src
   ```

3. Ejecuta el servidor:
   ```bash
   node server.js
   ```

4. Abre el navegador y visita:
   - `http://localhost:3000` — Página de bienvenida
   - `http://localhost:3000/health` — Estado del servidor
   - `http://localhost:3000/api/info` — Información en formato JSON
   - `http://localhost:3000/ruta-inexistente` — Respuesta 404

5. Para detener el servidor, presiona `Ctrl + C` en la terminal.

---

## Diagrama del recorrido de una petición

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Usuario  │───▶│Navegador │───▶│  Puerto  │───▶│Servidor  │
│           │    │(Frontend)│    │  3000    │    │ (Node.js)│
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                         │
                    ┌────────────────────────────────────┘
                    ▼
              ┌──────────┐    ┌──────────┐    ┌──────────┐
              │Inspecciona│───▶│ Decide   │───▶│ Responde │
              │  la URL   │    │ qué      │    │ al       │
              │           │    │ responder│    │navegador │
              └──────────┘    └──────────┘    └──────────┘
```

**Descripción del recorrido:**

1. El usuario introduce una URL en el navegador
2. El navegador crea una petición HTTP y la envía al puerto 3000
3. El servidor Node.js recibe la petición
4. El programa inspecciona la URL solicitada
5. El programa decide qué respuesta producir según la ruta
6. El servidor completa la respuesta con estado, encabezados y cuerpo
7. El navegador recibe y presenta el resultado al usuario

---

## Explicación de una falla diagnosticada

### Falla elegida: fault-5 (Asignación en lugar de comparación)

**Comportamiento observado:**
Cualquier ruta, incluso una inventada, devolvía el mismo contenido. El primer bloque de decisión siempre ganaba.

**Hipótesis inicial:**
El servidor estaba respondiendo con la misma ruta para todas las solicitudes.

**Evidencia revisada:**
- En la terminal se veía que el servidor recibía diferentes rutas
- En el navegador, todas las URLs mostraban la misma respuesta
- Al inspeccionar el código, se encontró una asignación (`=`) en lugar de una comparación (`===`)

**Causa encontrada:**
En la condición del `if`, se usaba `=` (asignación) en lugar de `===` (comparación). Esto causaba que la condición siempre fuera verdadera, ejecutando siempre el primer bloque de código sin importar la ruta solicitada.

**Modificación realizada:**
Cambiar `=` por `===` en la comparación de rutas:

```javascript
// Antes (incorrecto)
if (url = '/health') {

// Después (correcto)
if (url === '/health') {
```

**Resultado:**
El servidor ahora responde correctamente según cada ruta: `/` muestra bienvenida, `/health` devuelve OK, `/api/info` devuelve JSON, y rutas inexistentes devuelven 404.

**Explicación final:**
El error era un problema de lógica, no de sintaxis. JavaScript permite usar `=` en una condición (asigna el valor y lo evalúa como verdadero), por lo que el programa nunca llegaba a verificar las demás rutas. Con `===` se compara el valor de `url` con cada ruta, permitiendo que el programa tome la decisión correcta para cada caso.

---

## Respuestas al ticket de salida

### 1. ¿Qué es frontend y qué es backend? ¿Cuál es la diferencia esencial?

Frontend es todo lo que se ejecuta en el navegador del usuario: la interfaz visual, los botones, los formularios, la presentación de datos. Backend es un programa distinto que se ejecuta en otra máquina o proceso, recibe solicitudes y decide qué responder.

La diferencia esencial es **dónde se ejecuta el código y quién controla la decisión**. El frontend está en manos del usuario (puede inspeccionarlo y modificarlo), mientras que el backend controla las reglas del sistema de forma segura.

### 2. ¿Por qué un servidor puede quedarse activo sin terminar?

Porque el método `server.listen()` deja el proceso en ejecución, esperando nuevas peticiones. A diferencia de un script normal que termina al llegar al final del archivo, un servidor se mantiene activo mientras haya algo pendiente por atender. Node.js detecta que hay un proceso escuchando y no cierra el programa.

### 3. ¿Cuál es el primer instrumento que mirarías si un usuario reporta que "no funciona"?

La **terminal** donde está corriendo el servidor. Es el primer lugar porque responde si el proceso sigue activo, si registró la llegada de la solicitud y si hubo algún error. Si el proceso está vivo y registra la petición, el problema está en cómo se genera la respuesta. Si el proceso no está o no registra nada, el problema está antes: en la conexión, el puerto o la dirección.

### 4. ¿En qué orden ocurren los pasos del recorrido de una petición?

1. El usuario introduce una URL
2. El navegador crea una petición
3. La petición se dirige a un puerto
4. El proceso de Node.js recibe la petición
5. El programa inspecciona la URL
6. El programa decide qué respuesta producir
7. El servidor completa la respuesta
8. El navegador recibe y presenta el resultado

### 5. Si el servidor está activo pero el navegador no obtiene respuesta, ¿dónde está el problema?

El problema está en la conexión entre el navegador y el servidor. Posibles causas:
- El navegador está intentando conectarse a un puerto diferente al que escucha el servidor
- La dirección URL es incorrecta
- Un firewall o configuración de red bloquea la conexión

Si el servidor registra la solicitud en la terminal pero el navegador no recibe respuesta, el problema puede estar en que la respuesta nunca se cerró con `response.end()`.

---

## Profundización

### Recurso elegido: "Differences between Node.js and the Browser"

**1. ¿Qué concepto nuevo encontraste?**

Que Node.js y el navegador son dos entornos de ejecución distintos para el mismo lenguaje (JavaScript). Aunque el código se escribe igual, cada entorno ofrece capacidades diferentes. El navegador tiene acceso al DOM, `document`, `window` y la interfaz gráfica; Node.js tiene acceso al sistema de archivos, procesos, la red a bajo nivel y módulos nativos.

**2. ¿Cómo se relaciona con el servidor que construí?**

Directamente. Para construir el servidor usé `require('http')`, que es un módulo nativo de Node.js que no existe en el navegador. Si intentara usar ese código en un navegador, fallaría porque `require` y `http` no están disponibles ahí. El servidor funciona porque Node.js proporciona las herramientas necesarias para escuchar en un puerto y manejar peticiones de red.

**3. ¿Qué parte todavía no comprendes?**

No tengo claro cómo Node.js maneja internamente múltiples peticiones simultáneas sin crear un hilo por cada una. Sé que funciona con un bucle de eventos, pero no entiendo completamente cómo se alternan las tareas cuando hay muchas peticiones al mismo tiempo.

**4. ¿Qué evidencia o experimento podrías utilizar para investigarla?**

Podría crear un servidor que simule una tarea lenta (usando `setTimeout` con varios segundos) y hacer múltiples peticiones simultáneas desde el navegador o con `curl`. Observando el comportamiento podría ver si las peticiones se atienden en paralelo o de forma secuencial, y medir los tiempos de respuesta para entender cómo se gestionan.

---

## AI usage

- **¿Utilizaste IA?** Sí
- **¿Para qué la utilizaste?** Para estructurar el README.md con el formato correcto y revisar la explicación conceptual del diagrama y la falla diagnosticada.
- **¿Qué sugerencia aceptaste?** La estructura de los apartados del README y la forma de documentar la falla con sus siete campos.
- **¿Qué sugerencia rechazaste o modificaste?** Modifiqué las respuestas del ticket de salida con mis propias palabras, basándome en lo que entendí de la clase. No copié las respuestas sugeridas por la IA.
- **¿Cómo comprobaste el resultado?** Ejecuté el servidor con `node server.js` y probé cada ruta en el navegador, verificando que las respuestas fueran las esperadas y que los logs aparecieran correctamente en la terminal.
