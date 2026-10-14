# COM30 · S03 · Ejemplos de la clase

**Sesión S03 · miércoles 23 de septiembre de 2026 · Control de flujo, pipes y estilos**

El código de la sesión está en `src/app/s03/` y se ve en la ruta **`/s03`** de la aplicación
(pestaña «S03 · Ejemplos»). Cada ejemplo corresponde a una o varias diapositivas de la
presentación `COM30_S03_sesion.pdf`, publicada en el aula. La explicación completa está en el
comentario de encabezado de cada archivo; este documento la resume y dice qué debe observarse.

Quien trabaja en StackBlitz tiene los nueve ejemplos en un solo archivo:
`_para-stackblitz/s03-main.ts`.

---

## Mapa de la sesión

| # | Diapositiva | Archivo | Concepto |
|---|---|---|---|
| 1 | 7 y 8 | `control-flujo/ejemplo-if.ts` | `@if`, `@else if`, `@else` y alias con `as` |
| 2 | 9 y 10 | `control-flujo/ejemplo-for.ts` | `@for`, variables de contexto y `@empty` |
| 3 | 11 | `control-flujo/ejemplo-track.ts` | `track $index` frente a `track p.nombre` |
| 4 | 12 | `control-flujo/ejemplo-switch.ts` | `@switch` con el caso calculado en un `computed` |
| 5 | 13 | `control-flujo/ejemplo-heredado.ts` | Lectura de `*ngIf` y `*ngFor` |
| 6 | 19 a 22 | `pipes/ejemplo-integrados.ts` | `currency`, `number`, `date`, `uppercase`, `keyvalue` |
| 7 | 23 | `pipes/peso-pipe.ts` · `pipes/ejemplo-pipe-propio.ts` | Pipe propio |
| 8 | 24 | `pipes/ejemplo-pipe-puro.ts` | Pipe puro: `push` frente a `update` |
| 9 | 28 a 30 | `estilos/ejemplo-estilos.ts` | `[class]`, `[style]` y encapsulación |
| — | 21 | `src/app/app.config.ts` | Configuración regional es-CO |

---

## Bloque 1 · Control de flujo

### Ejemplo 1 · `@if`, `@else if`, `@else` y alias

Angular comprueba las condiciones en orden y muestra solo el primer bloque que se cumple.

- **Qué hacer:** pulsar los tres botones de total.
- **Qué observar:** cambia el párrafo que aparece. Con F12 se comprueba que los otros dos no
  están ocultos: no existen en el DOM.
- **Alias:** `@if (productoSeleccionado(); as p)` guarda el valor comprobado en `p`. Dentro del
  bloque, TypeScript sabe que `p` no es `null`.

### Ejemplo 2 · `@for`, variables de contexto y `@empty`

- **Qué hacer:** pulsar «Vaciar» y luego «Restaurar».
- **Qué observar:** con la lista vacía, la tabla conserva el encabezado y aparece el mensaje del
  bloque `@empty`. `$index`, `$first`, `$last` y `$even` solo existen dentro del `@for`.
- **Qué error previene:** una tabla vacía sin explicación para el usuario.

### Ejemplo 3 · Por qué `track` necesita una identidad estable

Dos tablas con la misma lista y un campo de texto por fila. La izquierda usa `track $index`; la
derecha, `track p.nombre`.

1. Escribir «revisar» en la fila del Ñame, en las dos tablas.
2. Pulsar «Ocultar la yuca».
3. **Derecha:** la nota sigue junto al Ñame. **Izquierda:** la nota aparece junto al Plátano.

Con `$index`, la identidad de cada fila es su posición: al quitar el primer elemento, Angular
conserva las filas por posición y solo cambia su texto. Con `p.nombre`, reconoce que la fila del
Ñame es la misma y la conserva completa.

### Ejemplo 4 · `@switch` con el caso calculado en un `computed`

El rango de precio (económico, medio, alto) se calcula en el componente con un `computed`; la
plantilla solo elige qué mostrar con `@switch`.

- **Qué hacer:** pulsar «Subir el mango 1.000».
- **Qué observar:** el mango pasa de Económico a Medio sin código adicional.
- **Por qué en un `computed`:** es la regla de la S02 para los totales. Lo que se deriva de los
  datos no se calcula en un método invocado desde la plantilla.

### Ejemplo 5 · Sintaxis anterior a Angular 17

El mismo aviso y la misma lista con `*ngIf` y `*ngFor`, para poder **leer** código existente.
Las directivas se importan (`NgIf`, `NgFor`) y `trackBy` exige una función. En este curso se
escribe `@if` y `@for`. Migración automática: `ng generate @angular/core:control-flow`.

---

## Bloque 2 · Pipes

### Ejemplo 6 · Pipes integrados

Cada fila muestra la expresión y el resultado que produce Angular con la configuración es-CO:

| Expresión | Resultado |
|---|---|
| `precio \| currency:'COP':'symbol-narrow':'1.0-0'` | $ 1.800 |
| `pi \| number:'1.2-2'` | 3,14 |
| `hoy \| date:'fullDate'` | miércoles, 23 de septiembre de 2026 |
| `'mango' \| uppercase` | MANGO |
| `existencias \| keyvalue` | GUAYABA: 8 · MANGO: 12 · PATILLA: 2 (orden por clave) |

Dos condiciones: cada pipe se importa en el componente (si falta, `NG8004: No pipe found with
name 'currency'`), y es-CO se registra en `src/app/app.config.ts`.

### Ejemplo 7 · Pipe propio `peso`

`transform` recibe el número de gramos y devuelve el texto: 0 → «sin peso», 250 → «250 g»,
1500 → «1,5 kg», 2000 → «2 kg». La tabla muestra el dato original junto al resultado del pipe:
el estado sigue guardando números.

### Ejemplo 8 · Pipe puro

El pipe `conteo` devuelve la longitud de una lista.

1. **«Agregar con push (incorrecto)»**: la vista se redibuja, pero el pipe recibe el mismo arreglo
   y no se ejecuta. «Con el pipe» se queda atrás; «Directo» muestra el valor real.
2. **«Agregar con update (correcto)»**: arreglo nuevo, el pipe se ejecuta y los valores coinciden.

El método `agregarConPush` es incorrecto a propósito: es el mismo error del Reto 5 de la S02.

---

## Bloque 3 · Estilos

### Ejemplo 9 · Binding de clase, de estilo y encapsulación

- `[class.premium]="p.precio >= 5000"` resalta las filas de precio alto. «Subir el plátano a
  5.000» agrega la clase sin código adicional.
- `[style.color]` pinta de rojo oscuro las existencias menores que 3.
- Los estilos del componente pintan de azul **todas** sus celdas `td`. Las tablas de los demás
  ejemplos de la página no cambian: el CSS de un componente no sale de su plantilla.
- **Verificación:** F12, seleccionar una celda y observar el atributo `_ngcontent-xxx` y el
  selector reescrito `td[_ngcontent-xxx]`.

---

## Reglas de oro de la sesión

1. Signal con paréntesis, siempre: `total()`, nunca `total`.
2. `track` con identidad estable; `$index` solo si la lista nunca se filtra ni se reordena.
3. Toda lista que puede quedar vacía declara su `@empty`.
4. El `computed` calcula y filtra; el pipe solo formatea para mostrar.
5. El estado se reemplaza, no se modifica: `update()` con un arreglo nuevo.
