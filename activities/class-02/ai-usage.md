# AI Usage — Clase 02

## What I asked for

Utilicé IA para las siguientes tareas durante la clase 2:

1. **Análisis del Lite**: Pedí que me ayudara a estructurar la tabla de análisis con las columnas correctas y a redactar las respuestas a las 8 preguntas guía.
2. **Contrato HTTP**: Pedí una revisión del contrato para asegurar que los códigos de estado y las descripciones fueran coherentes con lo estudiado en clase.
3. **Implementación del Full**: Pedí que me ayudara a implementar los 3 endpoints en el archivo `requests.routes.js`, siguiendo el contrato definido.

## What the AI proposed

1. Para el análisis: una tabla con 6 columnas (Endpoint, Intención, Entrada, Respuesta actual, Problema, Propuesta) y respuestas detalladas a las 8 preguntas.
2. Para el contrato: una estructura completa con method, ruta, entrada, respuestas de éxito y error, y ejemplos JSON.
3. Para la implementación: código Express con las 3 rutas, validación de título y códigos de estado correctos.

## What I accepted

- La estructura de la tabla de análisis.
- La organización del contrato HTTP con tablas y ejemplos.
- La implementación de los 3 endpoints con `res.status()`, validación y `generateId()`.

## What I changed or rejected

- Modifiqué las respuestas del ticket de salida con mis propias palabras, basándome en lo que entendí de la clase.
- En el contrato, ajusté las descripciones de los campos para que fueran más concisas.
- En la implementación, aseguré que `description` y `priority` fueran opcionales, no obligatorios, como indica el contrato.

## How I verified it

- Ejecuté el servidor con `npm start` y probé cada endpoint manualmente con `Invoke-WebRequest`.
- Verifiqué que cada endpoint devolviera el código de estado correcto (200, 201, 400, 404).
- Confirmé que la validación de título funcionara correctamente al enviar un body sin `title`.
- Revisé que el contrato HTTP fuera coherente con la implementación final.

## What I still do not understand

- No tengo claro aún cómo Express maneja internamente el enrutamiento cuando hay múltiples rutas declaradas en el mismo router. Sé que funciona, pero no entiendo completamente el mecanismo de búsqueda de coincidencia.
