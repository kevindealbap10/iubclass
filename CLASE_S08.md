# COM30 · S08 · Ejemplos de la sesión

**Sesión S08 · miércoles 4 de noviembre de 2026 · Observables y RxJS · sesión virtual por Teams**

El código de la sesión está en `src/app/s08/` y se ve en la ruta **`/s08`** de la aplicación
(pestaña «S08 · Ejemplos»). Cada ejemplo corresponde a diapositivas de `COM30_S08_sesion.pdf`, en el
aula. La explicación completa está en el comentario de encabezado de cada archivo, y cada tarjeta de la
página trae dos cuadros: **Qué observar** y **En su proyecto**.

La sesión se trabaja en **Visual Studio Code con Angular CLI**, sobre el fork de la clase. No se usa
StackBlitz.

Los ejemplos usan el **inventario de productos** de la S03, ampliado a 14 registros. El Taller 07 usa
otro conjunto de datos a propósito: aquí se consulta la técnica, no la solución.

---

## Antes de empezar

1. En su fork en GitHub: **Sync fork → Update branch**.
2. En la carpeta del proyecto, en la terminal de Visual Studio Code:

   ```
   git pull
   npm install
   npx ng serve
   ```

3. Abra `http://localhost:4200/s08`. Si el puerto 4200 está ocupado, `ng serve` lo informa y no arranca:
   cierre la terminal que ya lo está usando o ejecute `npx ng serve --port 4300` y abra
   `http://localhost:4300/s08`.
4. Los cambios que guarde en un archivo se reflejan solos en el navegador. Si la página queda en blanco
   tras un error de compilación, el mensaje aparece en la terminal y en la consola del navegador.

### Cómo depurar

- **Consola del navegador** (F12, pestaña Consola): errores de ejecución, como el `NG0203` del ejemplo 3
  si se olvida el `DestroyRef`.
- **Pestaña Red**: en un proyecto con `HttpClient` (Corte 3) allí se ve cada petición; en estos ejemplos
  el servidor es simulado y el contador de consultas de la página cumple esa función.
- **`tap`**: un operador que no cambia nada y sirve para mirar. `tap((v) => console.log('antes de switchMap', v))`
  entre dos operadores muestra qué valor pasa por ese punto.
- **Diagrama de canicas y panel de registro** de los ejemplos 1, 2, 4, 7 y 8: muestran el instante real de
  cada emisión. Si un valor aparece en una línea y no en la siguiente, un operador lo detuvo.

---

## Mapa de la sesión

| # | Diapositiva | Archivo | Concepto |
|---|---|---|---|
| 1 | 6 y 7 | `01-observable-frio/observable-frio.ts` | Observable frío frente a promesa; cada suscriptor ejecuta de nuevo |
| 7 | por asignar | `07-creacion/creacion.ts` | `of`, `from`, `timer`, `interval`, `fromEvent`, `take`; canales `next`, `error` y `complete` |
| 3 | 8 y 9 | `03-fuga/fuga.ts` | `interval`, fuga de memoria, `takeUntilDestroyed` |
| 2 | 12 y 13 | `02-operadores/operadores.ts` | `from`, `pipe`, `filter`, `map`, `toArray`, `tap` |
| 4 | 14, 15, 19 y 20 | `04-buscador/buscador.ts` | `valueChanges`, `debounceTime`, `distinctUntilChanged`, `switchMap`, `mergeMap` |
| 8 | por asignar | `08-errores/errores.ts` | `catchError` dentro de `switchMap`, `retry`, `finalize` |
| 5 | 23 y 24 | `05-puente/puente.ts` | `toSignal`, `toObservable`, `computed` |
| 9 | por asignar | `09-vida-real/vida-real.ts` | Autocompletado con selección, panel que se refresca solo, alta con validación asíncrona y `statusChanges` |
| 6 | 27 a 29 | `06-signal-forms/signal-forms.ts` | `form`, `required`, `minLength`, `min`, `submit`, `[formField]` |

`src/app/s08/inventario.ts` contiene el inventario, la regla de búsqueda y `ProductoApi`, el servicio
que simula al servidor con un retraso de `max(150, 900 − 150 × longitud)` milisegundos.
`src/app/s08/compartido/` contiene las piezas visuales: el diagrama de canicas (`canicas.ts`) y las
tarjetas de producto, indicadores y avisos (`ui.ts`). No usan librerías: son HTML, CSS y SVG.

---

## Cómo leer el diagrama de canicas

Cada línea es un observable y el eje horizontal es el tiempo real.

| Dibujo | Significa |
|---|---|
| Círculo de color | Un valor (`next`), en el instante en que se emitió |
| Círculo hueco con línea cortada | Un valor que entró a un operador y no pasó (`filter`) |
| Barra vertical ámbar | `complete`: el observable terminó bien |
| Cruz roja | `error`: el observable terminó con error |
| Barra verde con círculo al final | Una consulta al servidor que sí respondió (la separación es el retardo) |
| Barra gris con línea cortada y corte | Una consulta que `switchMap` canceló antes de que respondiera |

---

## Ejemplo 1 · Observable frío frente a promesa

- **Qué hacer:** pulsar «Crear promesa»; pulsar «Crear observable»; pulsar «Suscriptor A» y, medio
  segundo después, «Suscriptor B».
- **Qué observar:** la promesa dibuja su canica al crearse. El observable no dibuja nada hasta que alguien
  se suscribe, y cada suscriptor ejecuta la función completa y recibe 1800, 1200 y 6500 (una cada 500 ms)
  y un `complete`. Los indicadores: promesa 1 ejecución; observable 2 (una por suscriptor).
- **Qué error previene:** esperar que una consulta hecha con un Observable se ejecute sin `subscribe`.
- **En su proyecto:** una consulta al servidor no sale hasta el `subscribe`, y cada `subscribe` envía la suya.

## Ejemplo 7 · Creación de observables

- **Qué hacer:** pulsar cada botón, uno tras otro; después «Escuchar clics (fromEvent)» y pulsar dos veces
  «Objetivo del clic».
- **Qué observar:** `of(INVENTARIO)` dibuja una canica con el arreglo `[14]`; `from(INVENTARIO)`, catorce.
  `timer(1000)` emite 0 a 1 s; `timer(500, 1000)` con `take(3)`, 0, 1 y 2 a 0,5, 1,5 y 2,5 s;
  `interval(1000)` con `take(3)`, a 1, 2 y 3 s. El observable que falla emite 1800 y 1200 y termina con una
  cruz, sin barra de `complete`. `fromEvent` dibuja un valor por clic y nunca completa.
- **Qué error previene:** confundir `of(arreglo)` con `from(arreglo)`; esperar `complete` de un flujo infinito
  o después de un `error`.
- **En su proyecto:** elegir la función de creación según la fuente: listado en memoria, valor único,
  refresco periódico o evento de la pantalla.

## Ejemplo 3 · Fuga de memoria

- **Qué hacer:** con los dos componentes montados, desmontar el de «sin limpieza»; montarlo de nuevo
  y repetir dos veces. Desmontar el de «con limpieza».
- **Qué observar:** el indicador «Sobrantes (fuga)» no baja al desmontar el componente sin limpieza y sube
  con cada montaje. Con `takeUntilDestroyed` baja al desmontar.
- **Qué error previene:** suscripciones que se acumulan al navegar entre vistas.
- **En su proyecto:** una pantalla con refresco periódico que el usuario abre y cierra muchas veces.

## Ejemplo 2 · Operadores

- **Qué hacer:** pulsar «Ejecutar el pipe».
- **Qué observar:** cuatro líneas de tiempo. La primera tiene 14 canicas; la segunda, 11 canicas y 3 círculos
  huecos (Guayaba, Ahuyama y Lechuga, con cantidad 0); la tercera, 11 valores; la cuarta, una sola canica con
  el tamaño del arreglo (11) y un `complete`. Entran 14, pasan 11 y el valor del inventario es $ 322.000.
- **Qué error previene:** creer que `filter` modifica el arreglo original.
- **En su proyecto:** quitar los agotados y calcular el valor de cada línea de un listado del servidor.

## Ejemplo 4 · Buscador

- **Qué hacer:** con cada tubería, pulsar «Escribir ma y man en 100 ms» y, después de «Reiniciar», «Escribir
  mango letra por letra». Con la tubería completa, escribir `an`, `gra`, `FRUT`, `zzz`, `a`, `fri` y `maiz`,
  y borrar el campo.
- **Qué observar:**

  | Tubería | «ma» y «man» en 100 ms | «mango» letra por letra |
  |---|---|---|
  | `mergeMap` | 2 consultas; la barra de `ma` termina después que la de `man`; 4 filas con el campo en `man` | 5 pulsaciones, 4 consultas, ninguna cancelada |
  | `switchMap` | 2 consultas; la de `ma` se cancela (línea cortada); 1 fila | 5 pulsaciones, 4 consultas, 3 canceladas |
  | completa | 1 consulta; 1 fila | 5 pulsaciones, 1 consulta, ahorro del 80 % |

  Con menos de 2 caracteres no se consulta, el contador no cambia y aparece el aviso.
- **Qué error previene:** mostrar el resultado de una búsqueda anterior; una consulta por tecla.
- **En su proyecto:** el filtro de un catálogo, de clientes o de pedidos.

## Ejemplo 8 · Cuando el servidor falla

- **Qué hacer:** con cada tubería, escribir `mango`, `error` y, en la última, `intermitente`. Los botones
  escriben el texto.
- **Qué observar:**

  | Tubería | `error` | después, `mango` |
  |---|---|---|
  | sin manejo | la tubería termina (cruz), «Buscando…» queda encendido, aviso oscuro | no responde |
  | `catchError` dentro de `switchMap` | aviso rojo, 0 filas, 1 intento | 1 fila: la tubería sigue viva |
  | `retry(2)` y `catchError` | 3 intentos (tres cruces), aviso, 0 filas | 1 intento, 1 fila |

  Con `retry(2)`, `intermitente` falla dos veces y responde a la tercera: dos cruces, una barra verde y
  5 filas (Mango, Guayaba, Patilla, Papaya y Banano).
- **Qué error previene:** un buscador que queda mudo tras el primer error de red; un indicador de carga
  que queda encendido.
- **En su proyecto:** cualquier pantalla que consulta un servidor.

## Ejemplo 5 · Puente entre Observable y signal

- **Qué hacer:** escribir `an` y `man`; mover el control deslizante de precio máximo.
- **Qué observar:** `an` da 7 filas, $ 249.400 y 0 agotados; con las barras por categoría: Frutas 2 filas
  ($ 48.600), Verduras 1 ($ 31.500) y Granos 4 ($ 169.300). `man` da 1 fila y $ 21.600. El tope se aplica
  400 ms después de soltar el control.
- **Qué error previene:** copiar un Observable a una signal con una suscripción manual sin limpieza.
- **En su proyecto:** un tablero de resumen que se actualiza con la búsqueda y con un filtro de precio.

## Ejemplo 9 · Tres ejercicios con el inventario

**A · Autocompletado con selección**

- **Qué hacer:** escribir `ma`, `an`, `gu` y `a`; elegir una sugerencia; pulsar «Elegir Mango y, a los
  100 ms, Banano».
- **Qué observar:** `ma` 4 sugerencias; `an` 5 sugerencias y el aviso «2 más»; `gu` 1; `a` ninguna. La ficha
  de Banano: $ 900, 30 unidades, disponible, valor $ 27.000. Con la selección rápida la ficha final es Banano.

**B · Panel de reposición**

- **Qué hacer:** pulsar «Iniciar refresco» y esperar unos 12 segundos; pulsar «Detener».
- **Qué observar:** ciclos mostrados 0, 1, 3, 4, 5 y 6 (el 2 nunca se muestra y suma una petición cancelada).
  Valor por ciclo: 0 $ 322.000 · 1 $ 315.700 · 3 $ 303.100 · 4 $ 296.800 · 5 $ 290.500. Por reponer: 5 hasta
  el ciclo 4 y 6 desde el 5 (se suma Mango). Las tarjetas pasan de ámbar (bajo) a rojo (agotado) y el contador
  regresivo indica el próximo refresco. Tras «Detener» no se muestran más ciclos.

**C · Alta con validación asíncrona**

- **Qué hacer:** pulsar «Escribir «Pe»», «Escribir «Pera»», «Escribir «Mango»», «Escribir «mango »» y
  «Mango letra por letra».
- **Qué observar:**

  | Nombre | Estado final | Consultas |
  |---|---|---|
  | `Pe` | `INVALID` (mínimo 3 caracteres) | 0 |
  | `Pera` | `PENDING` 500 ms y `VALID` | 1 |
  | `Mango` | `PENDING` 500 ms e `INVALID` (ya existe) | 1 |
  | `mango ` | el mismo `INVALID` (se ignoran mayúsculas y espacios) | 1 |
  | `Mango` letra por letra | secuencia `INVALID → PENDING → INVALID`, 6 emisiones de `statusChanges` | 1 |

- **Qué error previene:** consultar al servidor en cada tecla; permitir enviar mientras la validación sigue
  pendiente.
- **En su proyecto:** un alta que avisa al instante si el nombre, el correo o el documento ya existen.

## Ejemplo 6 · Signal Forms

- **Qué hacer:** pulsar «Agregar» con el formulario vacío; escribir datos válidos y pulsar «Agregar».
- **Qué observar:** el panel de estado muestra `touched`, `dirty` e `invalid` de cada campo. Con el
  formulario vacío aparecen tres mensajes (nombre, categoría y precio; la cantidad 0 es válida) y no se
  agrega nada. La tarjeta de vista previa se arma sola desde la signal del modelo.
- **Qué error previene:** mostrar el error de un campo intacto (la condición usa `invalid` y `touched`).

---

## Comprobación de resultados esperados

Búsqueda con la tubería completa sobre el inventario de 14 productos:

| Texto | Filas | Valor del inventario mostrado |
|---|---|---|
| `an` | 7 (Mango, Banano, Zanahoria, Arroz, Lenteja, Fríjol, Maíz) | $ 249.400 |
| `ma` | 4 (Mango, Tomate, Ahuyama, Maíz) | $ 79.000 |
| `man` | 1 (Mango) | $ 21.600 |
| `gra` | 4 (Arroz, Lenteja, Fríjol, Maíz) | $ 169.300 |
| `FRUT` | 5 (Frutas) | $ 89.600 |
| `zzz` | 0 (bloque `@empty`) | $ 0 |
| `a` | no se consulta | — |
| `fri` | 1 (Fríjol) | $ 21.900 |
| `maiz` | 1 (Maíz) | $ 28.600 |

Operadores: 14 entran, 11 pasan, valor total $ 322.000.

---

## Qué se evalúa

Estos ejemplos no se evalúan. La evidencia calificable de la sesión es el **Taller 07**
(`COM30_S08_taller07.docx`, en el aula): guía de trabajo en `GUIA_TALLER_07.md`. El taller no usa
`catchError`, `retry` ni las funciones de creación del ejemplo 7.
