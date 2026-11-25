# Guía del Taller 09 · Mercado

Esta guía ordena el trabajo y señala qué ejemplo de `/s10` consultar en cada paso. No contiene la solución: el taller
trabaja con productos (`/products`, categoría groceries) y criterios distintos a los de las tareas de la clase.

| Paso | Qué construir | Ejemplo a consultar | Qué cambia en el taller | Comprobación |
|---|---|---|---|---|
| 1 | `provideHttpClient()`, interfaz y servicio | `app.config.ts`, `s10/tarea.ts`, `s10/tareas.service.ts` | La respuesta trae `products` y `total`; los campos son `title`, `price`, `stock` | F12 > Red muestra la petición con status 200 |
| 2 | Listado con httpResource y estados | `s10/lectura/lista-tareas.ts` | Se pide la categoría completa (`limit=0`) con `select`; el contador es «Reponer» (stock menor que 10) | Casos C1 y C2 |
| 3 | Búsqueda y orden con parámetros | `pagina()` en el servicio | Parámetros `q`, `sortBy`, `order` y `limit` | Casos C3, C4 y C5; pestaña Carga útil |
| 4 | Detalle por `:id` con mensaje de 404 | `s10/buscar/buscar-tarea.ts` y la S09 | El id llega como parámetro de ruta, no de consulta | Casos C6 y C7 |
| 5 | Alta, cambio y eliminación | `s10/escritura/editor-tareas.ts` | Se cambia precio o stock con PATCH; el estado local se actualiza con la respuesta | Casos C8, C9 y C10, en ese orden |
| 6 | Mensajes de error | `mensajeDe()` | Los textos son suyos y se justifican en la pregunta A3 | Sin conexión, la aplicación informa y no se bloquea |

Commit de avance: «T09: avance» con los pasos 1 y 2, hasta el miércoles 25 de noviembre de 2026, 23:59.
