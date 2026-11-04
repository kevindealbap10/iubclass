# COM30 · Guía de trabajo del Taller 07

**Buscador reactivo sobre un inventario de equipos · avance: miércoles 4 de noviembre de 2026, 21:00 ·
entrega final: martes 10 de noviembre de 2026, 23:59**

Esta guía ordena el trabajo e indica, para cada requisito del enunciado, qué ejemplo de la sesión S08
contiene la técnica y **qué cambia en el taller**. Los ejemplos usan el inventario de productos; el
taller usa un inventario de equipos, a propósito: la técnica se consulta, la solución se diseña. El
enunciado oficial, con los datos, la tabla de casos de prueba y la rúbrica, es
`COM30_S08_taller07.docx`, en el aula.

---

## Antes de empezar

1. **Proyecto nuevo y propio.** No se trabaja sobre el fork de la clase. Trabaje en Visual Studio Code con
   Angular CLI. En una terminal, fuera de la carpeta del fork:

   ```
   npx @angular/cli@22 new com30-taller07-apellido --style=css --ssr=false
   cd com30-taller07-apellido
   npx ng serve
   ```

   Si el puerto 4200 está ocupado, `npx ng serve --port 4300`. El navegador recarga solo al guardar.
2. **Repositorio público** `com30-taller07-apellido` en GitHub, creado desde la terminal con git:

   ```
   git add .
   git commit -m "Taller 07: servicio y buscador"
   git branch -M main
   git remote add origin https://github.com/<usuario>/com30-taller07-apellido.git
   git push -u origin main
   ```

   El repositorio se crea vacío en GitHub antes del primer `git push`.
3. **Datos.** Los 18 equipos están en el enunciado (código, tipo, ubicación y estado). Se copian
   exactamente: los resultados esperados dependen de ellos.
4. **Primer commit en los primeros 30 minutos.**

---

## Regla común del servicio y del buscador

- El servicio simulado recibe el texto, cuenta cada consulta en una signal pública de solo lectura
  `llamadas` y responde con `of(...).pipe(delay(...))`.
- Retraso: `max(150, 1500 − 300 × longitud)` ms, con la longitud del texto recortado. Los textos
  cortos tardan más: 2 caracteres, 900 ms; 3, 600 ms; 4, 300 ms; 5 o más, 150 ms.
- Se normaliza el texto: `trim()`, minúsculas y sin tildes. Un equipo coincide si el texto está en su
  código, su tipo o su ubicación.
- Con menos de 2 caracteres no se consulta: la lista queda vacía y `llamadas` no aumenta.

---

## Orden de trabajo

### Paso 1 · Servicio simulado con contador

| | |
|---|---|
| **Construya** | Interfaz del equipo, arreglo con los 18 equipos y un servicio `providedIn: 'root'` con `buscar(texto)`, la signal `llamadas` de solo lectura y `reiniciar()`. |
| **Consulte** | S08, ejemplo 4 (`src/app/s08/inventario.ts`, clase `ProductoApi`) y S05, ejemplo 1 para `asReadonly()`. |
| **Qué cambia en el taller** | Otros datos, otros campos de búsqueda (código, tipo, ubicación) y otra curva de retraso. |
| **Compruebe** | Tras `buscar('sala')`, suscrito una vez, `llamadas` vale 1 y la respuesta trae 10 equipos. |

### Paso 2 · Tubería del buscador

| | |
|---|---|
| **Construya** | Un `FormControl` y una tubería sobre `valueChanges` con `map` para recortar, `debounceTime(300)`, `distinctUntilChanged()` y `switchMap` hacia el servicio. |
| **Consulte** | S08, ejemplo 4 (`04-buscador/buscador.ts`), tubería «completa». |
| **Qué cambia en el taller** | El servicio y los datos. El texto de menos de 2 caracteres no se consulta: `switchMap` devuelve `of([])`. No se usa `filter` para ese caso, porque descartaría el texto corto y la lista anterior quedaría en pantalla al borrar el campo. |
| **Qué error previene** | Una consulta por tecla; mostrar la respuesta de una búsqueda anterior. |
| **Compruebe** | Escribir `sala` letra por letra sin pausas produce 1 consulta. Escribir `sa`, esperar un segundo y escribir `la` produce 2. Escribir `router` y luego `router ` (con espacio) no agrega una consulta. |

### Paso 3 · De Observable a signal · lista y resumen

| | |
|---|---|
| **Construya** | La lista de resultados como signal con `toSignal` y un valor inicial, y un `computed` con la cantidad de equipos mostrados. |
| **Consulte** | S08, ejemplo 5 (`05-puente/puente.ts`). |
| **Qué cambia en el taller** | El resumen cuenta equipos, no suma valores. |
| **Compruebe** | `sala` da 10; `sala 2` da 5; `router` da 3; `lab` da 4; `proy` da 4. |

### Paso 4 · Filtro por estado con `computed`

| | |
|---|---|
| **Construya** | Una signal con el estado elegido (Todos, Activo, Mantenimiento, Baja) y un `computed` que combine la lista de la búsqueda con ese estado. |
| **Consulte** | S08, ejemplo 5, `computed` con el tope de precio. |
| **Qué cambia en el taller** | El filtro por estado no consulta al servicio: se aplica sobre la lista que ya llegó. |
| **Compruebe** | `sala` con estado Activo da 6 equipos (001, 003, 005, 006, 013 y 015). Sin texto, el filtro no muestra equipos. |

### Paso 5 · Historial de búsquedas con limpieza

| | |
|---|---|
| **Construya** | Una suscripción a la tubería que conserve en una signal los últimos 5 textos consultados, sin repetidos consecutivos, y la limpie con `takeUntilDestroyed`. |
| **Consulte** | S08, ejemplo 3 (`03-fuga/fuga.ts`). |
| **Qué error previene** | Suscripciones que sobreviven al componente. |
| **Compruebe** | Tras 7 búsquedas distintas, el historial muestra las 5 más recientes, la última primero. |

### Paso 6 · Estados de la interfaz

| | |
|---|---|
| **Construya** | Mensaje «Buscando…» mientras llega la respuesta, aviso «Escriba al menos 2 caracteres» a partir de una signal con el texto, y bloque `@empty` cuando no hay coincidencias. |
| **Consulte** | S08, ejemplo 4: la plantilla con `@if`, `@else if` y `@empty`. |
| **Qué cambia en el taller** | El aviso del texto corto sale de una signal con el texto, no de la tubería. |
| **Compruebe** | `x` muestra el aviso y `llamadas` no cambia; `zzz` muestra el mensaje de lista vacía; mientras `router` espera su respuesta aparece «Buscando…». |

### Paso 7 · Repositorio y entrega

1. README del repositorio con el escenario y cómo ejecutarlo.
2. Verifique que `npx ng build` termina sin errores y que el repositorio abre en
   una ventana privada del navegador.
3. Complete las tablas de casos del enunciado con el resultado obtenido en cada caso.

---

## Avance de hoy y entrega

- **Hoy, hasta las 21:00:** `git push` y enlace del repositorio en la actividad *Taller 07 · Avance en
  clase* (texto en línea). Mínimo: servicio con contador y buscador con la tubería completa.
- **Martes 10 de noviembre de 2026, 23:59:** entrega final en la actividad *Taller 07*, con los
  archivos que indica el enunciado y el enlace del repositorio `com30-taller07-apellido`.
