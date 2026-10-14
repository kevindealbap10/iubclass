# COM30 · S02 · Los pasos de la clase

Guía para dictar. Cinco pasos, cada uno se escribe, se guarda y se mira el navegador
**antes** de pasar al siguiente. El código final ya está en el proyecto: esto es para
reconstruirlo en vivo y para que quien se pierda pueda alcanzar.

---

## Paso 0 · Los dos grupos

La sala está partida y hay que decirlo en voz alta, sin drama:

| | Dónde escriben | Qué archivo |
|---|---|---|
| **5 con portátil propio** | Angular CLI local, `ng serve` | `src/app/tablero/tablero.ts` y `.html` |
| **10 en StackBlitz** | Navegador, sin instalar nada | `src/main.ts`, todo en un archivo |

**La lógica es idéntica en los dos.** Lo único que cambia es si la plantilla vive en un
archivo aparte o dentro del componente. Cuando yo diga «en la plantilla», el grupo de
StackBlitz escribe dentro del `template:` y el grupo local en el `.html`.

El grupo de StackBlitz arranca pegando `_para-stackblitz/main.ts` completo y luego
**borra** lo que no sea el paso 1. Es más rápido que escribirlo desde cero y así todos
llegamos juntos al paso 2.

> **El error de la noche, avísalo ANTES de que peguen.** Hay que borrar el *contenido*
> de `src/main.ts` (clic dentro del editor y `Ctrl+A`), **no el archivo**. Si borran el
> archivo, sale:
>
> ```
> ✘ [ERROR] TS6053: File '.../src/main.ts' not found.
> ✘ [ERROR] Could not resolve '.../src/main.ts'
> ```
>
> **Se arregla:** clic derecho en la carpeta `src` → *New file* → nombrarlo `main.ts`
> exactamente, **todo en minúscula**, y pegar el contenido. StackBlitz corre sobre Linux:
> `Main.ts` con mayúscula es otro archivo distinto y no sirve.

**Tailwind en StackBlitz** — una línea en `src/index.html`, dentro de `<head>`:

```html
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
```

Si la red la bloquea, se sigue igual: la aplicación funciona, solo se ve sin estilos.
**No se pierde tiempo peleando con esto.**

---

## Paso 0.5 · Léanlo antes de borrarlo · **3 minutos, y vale la pena**

El proyecto que abre StackBlitz por defecto **ya trae el contraste de toda la noche**:

```ts
@Component({
  selector: 'app-root',
  template: `
    <h1>Hello from {{ name }}!</h1>
    <button (click)="counter.set(counter() - 1)">--</button>
    <span> Counter: {{ counter() }} </span>
    <button (click)="counter.set(counter() + 1)">++</button>
  `,
})
export class App {
  name = 'Angular';        // propiedad normal  ->  {{ name }}     sin paréntesis
  counter = signal(0);     // signal            ->  {{ counter() }} CON paréntesis
}
```

**Tres cosas en vivo, sobre lo que ya tienen en pantalla:**

1. **Quita los paréntesis** de `{{ counter() }}` y guarda. Sale el disparate. Vuélvelos a poner.
2. **Pregunta por qué `name` no los lleva.** Ahí sale solo: uno es una cajita, el otro es un valor.
3. **Señala el botón:** `counter.set(counter() + 1)` usa `set` leyendo el valor viejo. Funciona,
   pero anúncialo: en el paso 4 vamos a ver por qué eso se escribe mejor con `update`.

> Los del portátil pueden pegar esas dos propiedades en su componente para hacer el mismo
> ejercicio. Son cuatro líneas y pone a los dos grupos en el mismo punto.

Después de esto sí, a borrar y pegar.

---

## Paso 1 · El componente y la interpolación

**Qué se escribe.** En la clase, una propiedad envuelta en `signal`:

```ts
vendedor = signal('Don Efraín');
```

En la plantilla:

```html
<h2 class="text-2xl font-bold">Puesto de {{ vendedor }}</h2>
```

**Qué se ve.** Algo como `function computedSignal()` o una flecha. **Eso está bien:**
es el error que queremos que vean.

**La pregunta:** ¿por qué no salió el nombre? Se arregla poniendo los paréntesis:

```html
<h2 class="text-2xl font-bold">Puesto de {{ vendedor() }}</h2>
```

**Lo que hay que decir:** una signal es una cajita. Sin paréntesis pides la caja; con
paréntesis, lo que hay dentro. Y la razón de fondo: **leerla es lo que la suscribe**.
Angular no adivina qué parte de la pantalla depende de qué dato — lo anota en el
momento exacto en que alguien la llama.

---

## Paso 2 · La lista, con `@for` y `track`

**Qué se escribe.** Primero la interfaz y la signal de la lista:

```ts
interface Producto {
  nombre: string;
  precio: number;
  cantidad: number;
}

productos = signal<Producto[]>([
  { nombre: 'Yuca',    precio: 2800, cantidad: 3 },
  { nombre: 'Ñame',    precio: 4200, cantidad: 2 },
  { nombre: 'Plátano', precio: 1500, cantidad: 6 },
]);
```

Y en la plantilla, **a propósito sin `track`**:

```html
@for (p of productos()) {
  <tr>
    <td>{{ p.nombre }}</td>
    <td>{{ p.precio }}</td>
  </tr>
}
```

**Qué se ve.** El error `NG5002: @for loop must have a "track"`. Se agrega:

```html
@for (p of productos(); track p.nombre) {
```

**Lo que hay que decir:** el `track` identifica cada fila para reutilizar lo ya dibujado
en vez de rehacerlo. No es opcional. El valor tiene que ser único: el nombre sirve, el
índice casi nunca.

**Aquí se agrega también el subtotal**, para que vean que dentro de `{{ }}` cabe una
operación y no solo un nombre:

```html
<td>{{ p.precio * p.cantidad }}</td>
```

Y el `@empty`, que resuelve gratis el caso de la lista vacía.

---

## Paso 3 · Los `computed`

**Qué se escribe.**

```ts
total = computed(() =>
  this.productos().reduce((suma, p) => suma + p.precio * p.cantidad, 0)
);

unidades = computed(() =>
  this.productos().reduce((suma, p) => suma + p.cantidad, 0)
);
```

En la plantilla, con paréntesis igual que una signal:

```html
<div>{{ total() }}</div>
<div>{{ unidades() }}</div>
```

**Lo que hay que decir:** al leer `productos()` adentro, el computed quedó suscrito.
Cuando la lista cambie, el total ya está al día — sin llamarlo y sin acordarse de nada.

**La pregunta que siempre sale:** ¿y por qué no un método normal? Porque el método se
ejecuta cada vez que Angular revisa la pantalla, aunque nada haya cambiado. El computed
solo cuando cambia algo de lo que depende, y entre tanto **recuerda** el resultado.
Con 10 productos da igual; con 5.000 es la diferencia entre una app que responde y una
que se arrastra.

**Señalar:** estos dos `computed` son literalmente los requisitos 2 y 4 del Taller 01.
Y que noten que el segundo suma `cantidad`, no `precio * cantidad`.

---

## Paso 4 · Eventos, `update()` y el error que no da error

**Este es el paso importante de la noche.** No se recorta.

**4.1 · El botón que no hace nada.** Se escribe mal a propósito:

```html
<button (click)="vender">Vender 1</button>
```

Se pulsa varias veces. No pasa nada, y **no hay ningún error**. Se deja que se
desesperen un poco antes de revelar que faltan los paréntesis: `(click)="vender(p.nombre)"`.
Eso *nombra* la función; no la llama.

**4.2 · La mutación.** Se escribe el método mal, a propósito:

```ts
vender(nombre: string) {
  const p = this.productos().find(x => x.nombre === nombre);
  if (p) p.cantidad--;          // <- modifica por dentro
}
```

Se pulsa el botón y **se abre la consola**: el arreglo sí cambió. La pantalla, no.

**Por qué:** cuando le pones un valor, la signal se pregunta si es el mismo que ya tenía.
Con arreglos y objetos, JavaScript responde mirando **la dirección en memoria**, no el
contenido. El arreglo sigue siendo el mismo, en la misma dirección, solo que con otra
cosa adentro. Para la signal, nada cambió.

Dibujar en el tablero dos cajas y una flecha. Funciona mejor a mano que en diapositiva.

**La forma correcta:**

```ts
vender(nombre: string) {
  this.productos.update((lista) =>
    lista.map((p) =>
      p.nombre === nombre && p.cantidad > 0
        ? { ...p, cantidad: p.cantidad - 1 }   // objeto NUEVO
        : p                                     // los demás, tal cual
    )
  );
}
```

**La regla del cuatrimestre:** nunca modifiques por dentro lo que hay en una signal.
Construye un valor nuevo. `map`, `filter` y `...` devuelven cosas nuevas; `push`,
`splice`, `sort` y `++` modifican la que había.

**4.3 · El binding de propiedades.** Ahora que el botón funciona, se apaga solo:

```html
<button [disabled]="p.cantidad === 0" (click)="vender(p.nombre)">Vender 1</button>
```

Y la fila se marca sola cuando se agota:

```html
<tr [class.opacity-40]="p.cantidad === 0">
```

**Señalar:** en la versión de la S01 esto era `classList.add()` dentro de un `if`, y había
que acordarse de quitarla. Aquí se declara la condición una vez.

**4.4 · El `$event`.** El buscador:

```html
<input [value]="filtro()" (input)="onFiltrar($event)" />
```

```ts
onFiltrar(e: Event) {
  const caja = e.target as HTMLInputElement;
  this.filtro.set(caja.value);
}
```

Mostrar **primero** el subrayado rojo en `.value` y después el `as HTMLInputElement`.
TypeScript sabe que todo evento tiene un `target`, pero no sabe si es una caja de texto.

Y el `computed` que filtra, que demuestra que un computed puede depender de dos signals:

```ts
visibles = computed(() => {
  const texto = this.filtro().toLowerCase().trim();
  if (texto === '') return this.productos();
  return this.productos().filter((p) => p.nombre.toLowerCase().includes(texto));
});
```

Cambiar el `@for` para que recorra `visibles()` en vez de `productos()`.

**4.5 · El remate, si alcanza el tiempo.** El `@if` del mensaje condicional:

```html
@if (total() > 50000) {
  <div class="...">Jornada de venta mayorista</div>
}
```

El total arranca en **47 400**, por debajo del umbral, así que el mensaje **no se ve**.
Pulsa «+10» en el mango: el total sube a **65 400** y el mensaje aparece solo. Vuelve a
vender hasta bajarlo y desaparece.

Es tema de la **S03**, pero es exactamente el **requisito 5 del Taller 01** y aquí lo ven
funcionando. Dilo con esas palabras: el punto que creen que no pueden hacer, acaban de verlo.

---

## Paso 5 · El esqueleto de rutas · **solo grupo local**

Cinco minutos, y es mecánico. El grupo de StackBlitz mira y lo hace en la semana.

**Por qué ahora:** para que la aplicación tenga dónde crecer. El tema completo es la
**S09**; hoy solo se deja el esqueleto, sin explicar parámetros ni rutas anidadas.

1. El tablero ya está en su propio componente, `tablero/tablero.ts`.
2. Se agrega un componente mínimo, `acerca/acerca.ts`.
3. En `app.routes.ts`:

```ts
export const routes: Routes = [
  { path: '', redirectTo: 'tablero', pathMatch: 'full' },
  { path: 'tablero', component: Tablero },
  { path: 'acerca', component: Acerca },
  { path: '**', redirectTo: 'tablero' },
];
```

4. En `app.ts` se importan `RouterOutlet`, `RouterLink` y `RouterLinkActive`, y en
   `app.html` va la barra de navegación con `<router-outlet />`.

**Lo que hay que hacer notar:** al cambiar de vista **la URL cambia y el navegador no
parpadea**. No se recargó la página. Eso es una SPA, y es lo que se anunció en la S01.

---

## Si el tiempo aprieta

Orden de sacrificio, en este orden:

1. **Paso 5** (rutas) — se manda como lectura y queda el código en el aula.
2. **El buscador del 4.4** — se deja el `$event` solo mencionado.
3. **El `@empty` y el `@if`** — son de la S03 de todos modos.

**Lo que no se sacrifica nunca:** el paso 4.2, la mutación. Sin eso el Taller 01 no sale
y la S03 arranca con el grupo colgado.
