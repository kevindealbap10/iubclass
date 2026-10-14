/* =============================================================================
   COM30 · S03 · EJEMPLOS DE LA CLASE · VERSIÓN PARA STACKBLITZ (un solo archivo)
   -----------------------------------------------------------------------------
   Es el mismo código de src/app/s03/, reunido en un archivo. Cada bloque indica
   el archivo original; la explicación de cada ejemplo está en su comentario de
   encabezado y en CLASE_S03.md.

   Uso
     1. En StackBlitz, abra src/main.ts.
     2. Haga clic dentro del editor, seleccione todo (Ctrl+A) y pegue encima.
        Se reemplaza el contenido del archivo; el archivo no se elimina.
     3. Para los estilos de Tailwind, agregue en src/index.html, dentro de <head>:
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

   ========================================================================== */

import { CurrencyPipe, DatePipe, DecimalPipe, KeyValuePipe, NgFor, NgIf, UpperCasePipe, registerLocaleData } from '@angular/common';
import { Component, LOCALE_ID, Pipe, PipeTransform, computed, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import localeEsCo from '@angular/common/locales/es-CO';

// =============================================================================
// ARCHIVO ORIGINAL: src/app/s03/control-flujo/ejemplo-if.ts
// =============================================================================

// =============================================================================
//  S03 · EJEMPLO 1 · @if, @else if, @else y @if con alias
//  Diapositivas 7 y 8
// -----------------------------------------------------------------------------
//  Qué muestra
//    1. Una decisión con tres salidas: Angular comprueba las condiciones en
//       orden y muestra solo el primer bloque que se cumple.
//    2. @if con alias (as): guarda el valor comprobado en una variable local
//       del bloque. Dentro del bloque, TypeScript sabe que no es null.
//
//  Qué observar
//    - Con los tres botones de total, cambia el párrafo que aparece. Los otros
//      dos no se ocultan: no existen en el DOM (compruébelo con F12).
//    - Al pulsar «Quitar selección», el bloque del detalle desaparece completo.
// =============================================================================

interface Producto_ejemplo_if {
  nombre: string;
  precio: number;
  cantidad: number;
}

@Component({
  selector: 'app-ejemplo-if',
  template: `
    <!-- 1 · Tres salidas posibles. La signal se lee con paréntesis: total() -->
    <div class="flex flex-wrap gap-2">
      <button type="button" class="btn" (click)="total.set(72800)">Total 72.800</button>
      <button type="button" class="btn" (click)="total.set(30000)">Total 30.000</button>
      <button type="button" class="btn" (click)="total.set(0)">Total 0</button>
    </div>

    @if (total() > 50000) {
      <p class="aviso verde">Jornada de venta mayorista</p>
    } @else if (total() > 0) {
      <p class="aviso ambar">Jornada regular</p>
    } @else {
      <p class="aviso gris">Sin ventas registradas</p>
    }

    <!-- 2 · Alias: p es el valor ya comprobado, no la signal -->
    <div class="mt-6 flex flex-wrap gap-2">
      <button type="button" class="btn" (click)="seleccionar()">Seleccionar el mango</button>
      <button type="button" class="btn" (click)="productoSeleccionado.set(null)">Quitar selección</button>
    </div>

    @if (productoSeleccionado(); as p) {
      <div class="mt-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <p class="font-semibold text-slate-900">{{ p.nombre }}</p>
        <p class="text-sm text-slate-600">Existencias: {{ p.cantidad }}</p>
      </div>
    } @else {
      <p class="mt-3 text-sm text-slate-400">Ningún producto seleccionado.</p>
    }
  `,
  styles: `
    .btn { border-radius: .5rem; background: #1e293b; color: #fff; padding: .35rem .8rem; font-size: .8rem; font-weight: 600; }
    .aviso { margin-top: .75rem; border-left: 4px solid; padding: .6rem 1rem; font-size: .9rem; font-weight: 600; }
    .verde { border-color: #10b981; background: #ecfdf5; color: #064e3b; }
    .ambar { border-color: #f59e0b; background: #fffbeb; color: #78350f; }
    .gris  { border-color: #94a3b8; background: #f8fafc; color: #334155; }
  `,
})
class EjemploIf {
  total = signal(72800);

  // El tipo admite null: puede no haber ningún producto seleccionado.
  productoSeleccionado = signal<Producto_ejemplo_if | null>(null);

  seleccionar() {
    this.productoSeleccionado.set({ nombre: 'Mango', precio: 1800, cantidad: 12 });
  }
}

// =============================================================================
// ARCHIVO ORIGINAL: src/app/s03/control-flujo/ejemplo-for.ts
// =============================================================================

// =============================================================================
//  S03 · EJEMPLO 2 · @for completo: variables de contexto y @empty
//  Diapositivas 9 y 10
// -----------------------------------------------------------------------------
//  Qué muestra
//    - @for repite la fila por cada producto; track p.nombre la identifica.
//    - $index, $count, $first, $last y $even solo existen dentro del @for.
//    - @empty aparece en lugar de las filas cuando la lista no tiene elementos.
//
//  Qué observar
//    - «Vaciar» ejecuta productos.set([]): la tabla conserva el encabezado y
//      aparece el mensaje de @empty. Es el caso que casi nunca se prueba.
//    - «Restaurar» devuelve los datos y el mensaje desaparece del DOM.
// =============================================================================

interface Producto_ejemplo_for {
  nombre: string;
  cantidad: number;
}

const DATOS_FOR: Producto_ejemplo_for[] = [
  { nombre: 'Yuca', cantidad: 3 },
  { nombre: 'Ñame', cantidad: 2 },
  { nombre: 'Plátano', cantidad: 6 },
  { nombre: 'Mango', cantidad: 12 },
];

@Component({
  selector: 'app-ejemplo-for',
  template: `
    <div class="flex gap-2">
      <button type="button" class="btn" (click)="productos.set([])">Vaciar</button>
      <button type="button" class="btn" (click)="productos.set(datos)">Restaurar</button>
    </div>

    <table class="mt-3 w-full text-left text-sm">
      <thead class="bg-slate-900 text-xs uppercase text-white">
        <tr><th class="px-3 py-2">#</th><th class="px-3 py-2">Producto_ejemplo_for</th>
            <th class="px-3 py-2">Cantidad</th><th class="px-3 py-2">Posición</th></tr>
      </thead>
      <tbody>
        @for (p of productos(); track p.nombre) {
          <!-- $even sombrea las filas pares -->
          <tr class="border-t border-slate-100" [class.bg-slate-50]="$even">
            <td class="px-3 py-2 text-slate-400">{{ $index + 1 }}</td>
            <td class="px-3 py-2 font-semibold">{{ p.nombre }}</td>
            <td class="px-3 py-2">{{ p.cantidad }}</td>
            <td class="px-3 py-2 text-xs text-slate-500">
              @if ($first) { primero } @else if ($last) { último }
            </td>
          </tr>
        } @empty {
          <tr><td colspan="4" class="px-3 py-6 text-center text-slate-400">No hay productos para mostrar</td></tr>
        }
      </tbody>
    </table>

    <!-- $count no existe fuera del @for: afuera se usa la longitud de la lista -->
    <p class="mt-2 text-xs text-slate-500">{{ productos().length }} productos en la lista.</p>
  `,
  styles: `
    .btn { border-radius: .5rem; background: #1e293b; color: #fff; padding: .35rem .8rem; font-size: .8rem; font-weight: 600; }
  `,
})
class EjemploFor {
  readonly datos = DATOS_FOR;
  productos = signal<Producto_ejemplo_for[]>(DATOS_FOR);
}

// =============================================================================
// ARCHIVO ORIGINAL: src/app/s03/control-flujo/ejemplo-track.ts
// =============================================================================

// =============================================================================
//  S03 · EJEMPLO 3 · Por qué track necesita una identidad estable
//  Diapositiva 11
// -----------------------------------------------------------------------------
//  Qué muestra
//    Dos tablas con la MISMA lista filtrada. La izquierda usa track $index; la
//    derecha, track p.nombre. Cada fila tiene un campo de texto libre.
//
//  Cómo se demuestra en clase
//    1. Escriba «revisar» en el campo de la fila del Ñame, en las dos tablas.
//    2. Pulse «Ocultar la yuca». La lista pierde su primer elemento.
//    3. Tabla derecha (track p.nombre): «revisar» sigue junto al Ñame.
//       Tabla izquierda (track $index): «revisar» aparece junto al Plátano.
//
//  Por qué
//    Con $index, la identidad de cada fila es su posición. Al quitar la yuca,
//    Angular conserva las filas 0, 1, 2 y solo cambia el texto que muestran; el
//    contenido del campo, que no viene de los datos, se queda en su posición.
//    Con p.nombre, Angular sabe que la fila del Ñame es la misma y la conserva
//    entera. Es el número de documento de la analogía: la identidad no cambia
//    aunque la persona cambie de puesto en la fila.
// =============================================================================

interface Producto_ejemplo_track {
  nombre: string;
  cantidad: number;
}

@Component({
  selector: 'app-ejemplo-track',
  template: `
    <button type="button" class="btn" (click)="ocultarYuca.update((v) => !v)">
      {{ ocultarYuca() ? 'Mostrar la yuca' : 'Ocultar la yuca' }}
    </button>

    <div class="mt-3 grid gap-4 sm:grid-cols-2">
      <div>
        <p class="rotulo mal">track $index · identidad por posición</p>
        <table class="w-full text-sm">
          <tbody>
            @for (p of visibles(); track $index) {
              <tr class="border-t border-slate-100">
                <td class="py-1 font-semibold">{{ p.nombre }}</td>
                <td class="py-1"><input class="campo" placeholder="nota" /></td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div>
        <p class="rotulo bien">track p.nombre · identidad estable</p>
        <table class="w-full text-sm">
          <tbody>
            @for (p of visibles(); track p.nombre) {
              <tr class="border-t border-slate-100">
                <td class="py-1 font-semibold">{{ p.nombre }}</td>
                <td class="py-1"><input class="campo" placeholder="nota" /></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: `
    .btn { border-radius: .5rem; background: #1e293b; color: #fff; padding: .35rem .8rem; font-size: .8rem; font-weight: 600; }
    .rotulo { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; margin-bottom: .3rem; }
    .mal  { color: #b91c1c; }
    .bien { color: #047857; }
    .campo { width: 100%; border: 1px solid #cbd5e1; border-radius: .35rem; padding: .15rem .4rem; }
  `,
})
class EjemploTrack {
  ocultarYuca = signal(false);

  productos = signal<Producto_ejemplo_track[]>([
    { nombre: 'Yuca', cantidad: 3 },
    { nombre: 'Ñame', cantidad: 2 },
    { nombre: 'Plátano', cantidad: 6 },
    { nombre: 'Mango', cantidad: 12 },
  ]);

  visibles = computed(() =>
    this.ocultarYuca() ? this.productos().filter((p) => p.nombre !== 'Yuca') : this.productos(),
  );
}

// =============================================================================
// ARCHIVO ORIGINAL: src/app/s03/control-flujo/ejemplo-switch.ts
// =============================================================================

// =============================================================================
//  S03 · EJEMPLO 4 · @switch con el caso calculado en un computed
//  Diapositiva 12
// -----------------------------------------------------------------------------
//  Qué muestra
//    - El rango de precio de cada producto se calcula en el componente, en un
//      computed. La plantilla solo elige qué mostrar con @switch.
//    - Rangos: económico (menos de 2.000), medio (2.000 a 4.999) y alto
//      (5.000 o más).
//
//  Qué observar
//    - «Subir el mango 1.000» cambia su precio y su rango pasa de Económico a
//      Medio sin código adicional: el computed recalcula y @switch muestra el
//      caso nuevo.
//
//  Por qué en un computed y no en un método
//    Es la regla de la S02 para los totales: lo que se deriva de los datos se
//    declara como computed, no como un método que la plantilla invoca.
// =============================================================================

type Rango = 'economico' | 'medio' | 'alto';

interface Producto_ejemplo_switch {
  nombre: string;
  precio: number;
}

@Component({
  selector: 'app-ejemplo-switch',
  template: `
    <button type="button" class="btn" (click)="subirMango()">Subir el mango 1.000</button>

    <table class="mt-3 w-full text-left text-sm">
      <thead class="bg-slate-900 text-xs uppercase text-white">
        <tr><th class="px-3 py-2">Producto_ejemplo_switch</th><th class="px-3 py-2">Precio</th><th class="px-3 py-2">Rango</th></tr>
      </thead>
      <tbody>
        @for (p of filas(); track p.nombre) {
          <tr class="border-t border-slate-100">
            <td class="px-3 py-2 font-semibold">{{ p.nombre }}</td>
            <td class="px-3 py-2">{{ p.precio }}</td>
            <td class="px-3 py-2">
              <!-- igualdad estricta (===), sin break y sin caída al caso siguiente -->
              @switch (p.rango) {
                @case ('economico') { <span class="etq verde">Económico</span> }
                @case ('medio')     { <span class="etq ambar">Medio</span> }
                @default            { <span class="etq rojo">Alto</span> }
              }
            </td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    .btn { border-radius: .5rem; background: #1e293b; color: #fff; padding: .35rem .8rem; font-size: .8rem; font-weight: 600; }
    .etq { border-radius: 999px; padding: .1rem .6rem; font-size: .72rem; font-weight: 700; }
    .verde { background: #d1fae5; color: #065f46; }
    .ambar { background: #fef3c7; color: #92400e; }
    .rojo  { background: #fee2e2; color: #991b1b; }
  `,
})
class EjemploSwitch {
  productos = signal<Producto_ejemplo_switch[]>([
    { nombre: 'Plátano', precio: 1500 },
    { nombre: 'Mango', precio: 1800 },
    { nombre: 'Yuca', precio: 2800 },
    { nombre: 'Ñame', precio: 4200 },
    { nombre: 'Patilla', precio: 6500 },
  ]);

  // Cada fila es el producto más su rango. El operador de propagación (...p)
  // copia el producto; no se modifica el objeto original.
  filas = computed(() =>
    this.productos().map((p) => ({ ...p, rango: this.rangoDe(p.precio) })),
  );

  private rangoDe(precio: number): Rango {
    if (precio < 2000) return 'economico';
    return precio < 5000 ? 'medio' : 'alto';
  }

  // update() con un arreglo nuevo: nunca this.productos()[1].precio += 1000
  subirMango() {
    this.productos.update((lista) =>
      lista.map((p) => (p.nombre === 'Mango' ? { ...p, precio: p.precio + 1000 } : p)),
    );
  }
}

// =============================================================================
// ARCHIVO ORIGINAL: src/app/s03/control-flujo/ejemplo-heredado.ts
// =============================================================================

// =============================================================================
//  S03 · EJEMPLO 5 · Sintaxis anterior a Angular 17: *ngIf y *ngFor
//  Diapositiva 13
// -----------------------------------------------------------------------------
//  Para LEER código existente, no para escribirlo en este curso.
//
//  Qué muestra
//    El mismo aviso y la misma lista de los ejemplos 1 y 2, escritos con
//    directivas estructurales. Compare línea por línea:
//
//        *ngIf="cond; else plantilla"   ->  @if (cond) { } @else { }
//        *ngFor="let p of lista; trackBy: fn"  ->  @for (p of lista; track p.nombre)
//
//  Qué observar
//    - Las directivas se importan: NgIf y NgFor en imports. Sin ese import, la
//      plantilla no las reconoce (error 4 de «Errores frecuentes»).
//    - trackBy exige una función en la clase; track acepta una expresión.
//    - Migración automática de un proyecto viejo:
//          ng generate @angular/core:control-flow
// =============================================================================

@Component({
  selector: 'app-ejemplo-heredado',
  imports: [NgIf, NgFor],
  template: `
    <p *ngIf="total() > 50000; else regular" class="text-sm font-semibold text-emerald-800">
      Jornada de venta mayorista
    </p>
    <ng-template #regular><p class="text-sm text-slate-600">Jornada regular</p></ng-template>

    <ul class="mt-2 list-disc pl-6 text-sm">
      <li *ngFor="let p of productos(); trackBy: porNombre">{{ p }}</li>
    </ul>
  `,
})
class EjemploHeredado {
  total = signal(72800);
  productos = signal(['Yuca', 'Ñame', 'Plátano']);

  porNombre(_indice: number, nombre: string) {
    return nombre;
  }
}

// =============================================================================
// ARCHIVO ORIGINAL: src/app/s03/pipes/ejemplo-integrados.ts
// =============================================================================

// =============================================================================
//  S03 · EJEMPLO 6 · Pipes integrados y configuración regional es-CO
//  Diapositivas 19 a 22
// -----------------------------------------------------------------------------
//  Qué muestra
//    currency, number, date, uppercase y keyvalue sobre datos fijos. A la
//    derecha de cada expresión, el resultado que Angular produce.
//
//  Dos condiciones para que funcione
//    1. Cada pipe se importa en el componente (imports). Si falta:
//           NG8004: No pipe found with name 'currency'
//    2. El formato colombiano ($ 1.800 y 3,14) requiere registrar es-CO. En
//       este proyecto está en src/app/app.config.ts. Sin él, Angular formatea
//       en en-US: $1,800 y 3.14.
//
//  Qué observar
//    - El dato sigue siendo el número 1800: el pipe solo cambia cómo se lee.
//    - keyvalue ordena por clave: guayaba, mango, patilla, no el orden escrito.
// =============================================================================

@Component({
  selector: 'app-ejemplo-integrados',
  imports: [CurrencyPipe, DecimalPipe, DatePipe, UpperCasePipe, KeyValuePipe],
  template: `
    <table class="w-full text-left text-sm">
      <thead class="bg-slate-900 text-xs uppercase text-white">
        <tr><th class="px-3 py-2">Pipe</th><th class="px-3 py-2">Resultado</th></tr>
      </thead>
      <tbody>
        <tr class="border-t border-slate-100">
          <td class="px-3 py-2 font-mono text-xs">precio | currency:'COP':'symbol-narrow':'1.0-0'</td>
          <td class="px-3 py-2 font-semibold">{{ precio | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</td>
        </tr>
        <tr class="border-t border-slate-100">
          <td class="px-3 py-2 font-mono text-xs">pi | number:'1.2-2'</td>
          <td class="px-3 py-2 font-semibold">{{ pi | number: '1.2-2' }}</td>
        </tr>
        <tr class="border-t border-slate-100">
          <td class="px-3 py-2 font-mono text-xs">hoy | date:'fullDate'</td>
          <td class="px-3 py-2 font-semibold">{{ hoy | date: 'fullDate' }}</td>
        </tr>
        <tr class="border-t border-slate-100">
          <td class="px-3 py-2 font-mono text-xs">'mango' | uppercase</td>
          <td class="px-3 py-2 font-semibold">{{ 'mango' | uppercase }}</td>
        </tr>
      </tbody>
    </table>

    <!-- keyvalue convierte un objeto en una lista de pares { key, value } -->
    <p class="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">existencias | keyvalue</p>
    <ul class="mt-1 text-sm">
      @for (par of existencias | keyvalue; track par.key) {
        <li>{{ par.key | uppercase }}: {{ par.value }}</li>
      }
    </ul>
  `,
})
class EjemploIntegrados {
  precio = 1800;
  pi = 3.14159;
  hoy = new Date();
  existencias = { mango: 12, guayaba: 8, patilla: 2 };
}

// =============================================================================
// ARCHIVO ORIGINAL: src/app/s03/pipes/peso-pipe.ts
// =============================================================================

// =============================================================================
//  S03 · EJEMPLO 7a · Pipe propio: peso
//  Diapositiva 23
// -----------------------------------------------------------------------------
//  transform recibe el valor que está a la izquierda del | y devuelve el texto
//  que aparece en pantalla. El dato en el componente sigue siendo un número de
//  gramos; el pipe decide cómo se lee.
//
//      0     ->  sin peso
//      250   ->  250 g
//      1500  ->  1,5 kg
//      2000  ->  2 kg
//
//  Desde Angular 19 los pipes son standalone por defecto: basta con agregarlo
//  a imports del componente que lo usa. Con Angular CLI se genera con
//      ng generate pipe peso
// =============================================================================

@Pipe({ name: 'peso' })
class PesoPipe implements PipeTransform {
  transform(gramos: number): string {
    if (gramos === 0) return 'sin peso';
    if (gramos < 1000) return `${gramos} g`;
    // 1500 / 1000 = 1.5; toLocaleString('es-CO') lo escribe con coma: 1,5
    return `${(gramos / 1000).toLocaleString('es-CO')} kg`;
  }
}

// =============================================================================
// ARCHIVO ORIGINAL: src/app/s03/pipes/ejemplo-pipe-propio.ts
// =============================================================================

// =============================================================================
//  S03 · EJEMPLO 7b · Uso del pipe propio peso
//  Diapositiva 23
// -----------------------------------------------------------------------------
//  Qué observar
//    - La columna «Dato» muestra el número tal como está en el estado.
//    - La columna «Con el pipe» muestra el mismo número después de peso.
//    - «Agregar 500 g al bulto» cambia el dato; el pipe se vuelve a ejecutar
//      porque update() entrega un arreglo nuevo (ver ejemplo 8).
// =============================================================================

interface Presentacion_ejemplo_pipe_propio {
  producto: string;
  gramos: number;
}

@Component({
  selector: 'app-ejemplo-pipe-propio',
  imports: [PesoPipe],
  template: `
    <button type="button" class="btn" (click)="agregarAlBulto()">Agregar 500 g al bulto</button>

    <table class="mt-3 w-full text-left text-sm">
      <thead class="bg-slate-900 text-xs uppercase text-white">
        <tr><th class="px-3 py-2">Presentación</th><th class="px-3 py-2">Dato</th><th class="px-3 py-2">Con el pipe</th></tr>
      </thead>
      <tbody>
        @for (p of presentaciones(); track p.producto) {
          <tr class="border-t border-slate-100">
            <td class="px-3 py-2 font-semibold">{{ p.producto }}</td>
            <td class="px-3 py-2 font-mono text-xs">{{ p.gramos }}</td>
            <td class="px-3 py-2">{{ p.gramos | peso }}</td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    .btn { border-radius: .5rem; background: #1e293b; color: #fff; padding: .35rem .8rem; font-size: .8rem; font-weight: 600; }
  `,
})
class EjemploPipePropio {
  presentaciones = signal<Presentacion_ejemplo_pipe_propio[]>([
    { producto: 'Café molido', gramos: 250 },
    { producto: 'Arroz', gramos: 1500 },
    { producto: 'Bulto de papa', gramos: 2000 },
    { producto: 'Canasta vacía', gramos: 0 },
  ]);

  agregarAlBulto() {
    this.presentaciones.update((lista) =>
      lista.map((p) => (p.producto === 'Bulto de papa' ? { ...p, gramos: p.gramos + 500 } : p)),
    );
  }
}

// =============================================================================
// ARCHIVO ORIGINAL: src/app/s03/pipes/ejemplo-pipe-puro.ts
// =============================================================================

// =============================================================================
//  S03 · EJEMPLO 8 · Pipe puro: por qué no se recalcula con push
//  Diapositiva 24
// -----------------------------------------------------------------------------
//  Qué muestra
//    El pipe conteo devuelve la longitud de una lista. Es puro (el valor por
//    defecto): Angular lo vuelve a ejecutar solo si la ENTRADA cambia, y la
//    compara por referencia, no por contenido.
//
//  Cómo se demuestra en clase
//    1. «Agregar con push (incorrecto)»: modifica el arreglo por dentro. La
//       vista se vuelve a dibujar porque también cambia el contador de clics,
//       pero el pipe recibe el MISMO arreglo y no se ejecuta: «con el pipe» se
//       queda atrás, mientras «directo» muestra el valor real.
//    2. «Agregar con update (correcto)»: entrega un arreglo nuevo. El pipe se
//       ejecuta y los dos valores vuelven a coincidir.
//
//  El método agregarConPush está mal A PROPÓSITO. Es el mismo error del
//  Reto 5 de la S02 (sort sin copia) y es descuento en el Taller 02.
// =============================================================================

@Pipe({ name: 'conteo' })
class ConteoPipe implements PipeTransform {
  transform(lista: readonly unknown[]): number {
    return lista.length;
  }
}

@Component({
  selector: 'app-ejemplo-pipe-puro',
  imports: [ConteoPipe],
  template: `
    <div class="flex flex-wrap gap-2">
      <button type="button" class="btn rojo" (click)="agregarConPush()">Agregar con push (incorrecto)</button>
      <button type="button" class="btn verde" (click)="agregarConUpdate()">Agregar con update (correcto)</button>
    </div>

    <div class="mt-3 grid grid-cols-3 gap-3 text-center">
      <div class="dato"><p class="rot">Con el pipe</p><p class="num">{{ lista() | conteo }}</p></div>
      <div class="dato"><p class="rot">Directo</p><p class="num">{{ lista().length }}</p></div>
      <div class="dato"><p class="rot">Clics</p><p class="num">{{ clics() }}</p></div>
    </div>
  `,
  styles: `
    .btn { border-radius: .5rem; color: #fff; padding: .35rem .8rem; font-size: .8rem; font-weight: 600; }
    .rojo { background: #b91c1c; }
    .verde { background: #047857; }
    .dato { border: 1px solid #e2e8f0; border-radius: .6rem; padding: .6rem; background: #fff; }
    .rot { font-size: .68rem; text-transform: uppercase; letter-spacing: .08em; color: #64748b; }
    .num { font-size: 1.6rem; font-weight: 800; color: #0f172a; }
  `,
})
class EjemploPipePuro {
  lista = signal<string[]>(['Mango', 'Guayaba']);
  clics = signal(0);

  // INCORRECTO: push modifica el arreglo que ya está en la signal.
  agregarConPush() {
    this.lista().push('Producto ' + (this.lista().length + 1));
    this.clics.update((n) => n + 1); // fuerza el redibujo para que se vea la diferencia
  }

  // CORRECTO: un arreglo nuevo con el elemento agregado.
  agregarConUpdate() {
    this.lista.update((l) => [...l, 'Producto ' + (l.length + 1)]);
    this.clics.update((n) => n + 1);
  }
}

// =============================================================================
// ARCHIVO ORIGINAL: src/app/s03/estilos/ejemplo-estilos.ts
// =============================================================================

// =============================================================================
//  S03 · EJEMPLO 9 · Estilos de componente y encapsulación
//  Diapositivas 28 a 30
// -----------------------------------------------------------------------------
//  Qué muestra
//    - [class.premium] aplica o retira la clase según el dato.
//    - [style.color] asigna un valor de estilo calculado.
//    - Los estilos de este componente pintan TODAS sus celdas td de azul y en
//      negrita. Las tablas de los demás ejemplos de esta página no cambian:
//      el CSS de un componente no sale de su plantilla.
//
//  Cómo se verifica la encapsulación (diapositiva 30)
//    F12 -> seleccione una celda de esta tabla -> observe el atributo
//    _ngcontent-xxx en el elemento y el selector reescrito td[_ngcontent-xxx]
//    en el panel de estilos.
//
//  :host selecciona el elemento <app-ejemplo-estilos> que contiene al componente.
// =============================================================================

interface Producto_ejemplo_estilos {
  nombre: string;
  precio: number;
  cantidad: number;
}

@Component({
  selector: 'app-ejemplo-estilos',
  template: `
    <table class="w-full text-left text-sm">
      <tbody>
        @for (p of productos(); track p.nombre) {
          <tr [class.premium]="p.precio >= 5000">
            <td>{{ p.nombre }}</td>
            <td>{{ p.precio }}</td>
            <td [style.color]="p.cantidad < 3 ? 'darkred' : 'inherit'">{{ p.cantidad }} en existencia</td>
          </tr>
        }
      </tbody>
    </table>
    <button type="button" class="btn" (click)="subirPlatano()">Subir el plátano a 5.000</button>
  `,
  styles: `
    :host { display: block; border: 2px dashed #94a3b8; border-radius: .75rem; padding: .75rem; }
    td { color: #1d4ed8; font-weight: 600; padding: .35rem .6rem; border-top: 1px solid #e2e8f0; }
    .premium { background: #fef3c7; }
    .btn { margin-top: .6rem; border-radius: .5rem; background: #1e293b; color: #fff; padding: .35rem .8rem; font-size: .8rem; font-weight: 600; }
  `,
})
class EjemploEstilos {
  productos = signal<Producto_ejemplo_estilos[]>([
    { nombre: 'Plátano', precio: 1500, cantidad: 6 },
    { nombre: 'Ñame', precio: 4200, cantidad: 2 },
    { nombre: 'Patilla', precio: 6500, cantidad: 4 },
  ]);

  subirPlatano() {
    this.productos.update((lista) =>
      lista.map((p) => (p.nombre === 'Plátano' ? { ...p, precio: 5000 } : p)),
    );
  }
}

// =============================================================================
// ARCHIVO ORIGINAL: src/app/s03/s03.ts
// =============================================================================

// =============================================================================
//  S03 · Página de ejemplos · ruta /s03
// -----------------------------------------------------------------------------
//  Reúne los nueve ejemplos de la sesión, en el orden de la presentación. Cada
//  tarjeta indica la diapositiva que la acompaña y el archivo donde está el
//  código. La explicación completa de cada ejemplo está en el comentario de
//  encabezado de su archivo y en CLASE_S03.md.
// =============================================================================

@Component({
  selector: 'app-root',
  imports: [
    EjemploIf, EjemploFor, EjemploTrack, EjemploSwitch, EjemploHeredado,
    EjemploIntegrados, EjemploPipePropio, EjemploPipePuro, EjemploEstilos,
  ],
  template: `
    <h2 class="text-2xl font-bold text-slate-900">Sesión S03 · Control de flujo, pipes y estilos</h2>
    <p class="mt-1 text-sm text-slate-500">
      Ejemplos de la clase. Cada uno indica la diapositiva que lo acompaña y su archivo en src/app/s03/.
    </p>

    <h3 class="bloque">Bloque 1 · Control de flujo</h3>
    <section class="tarjeta">
      <p class="meta">Ejemplo 1 · Diapositivas 7 y 8 · control-flujo/ejemplo-if.ts</p>
      <h4>&#64;if, &#64;else if, &#64;else y alias</h4>
      <app-ejemplo-if />
    </section>
    <section class="tarjeta">
      <p class="meta">Ejemplo 2 · Diapositivas 9 y 10 · control-flujo/ejemplo-for.ts</p>
      <h4>&#64;for, variables de contexto y &#64;empty</h4>
      <app-ejemplo-for />
    </section>
    <section class="tarjeta">
      <p class="meta">Ejemplo 3 · Diapositiva 11 · control-flujo/ejemplo-track.ts</p>
      <h4>track por posición frente a track por identidad</h4>
      <app-ejemplo-track />
    </section>
    <section class="tarjeta">
      <p class="meta">Ejemplo 4 · Diapositiva 12 · control-flujo/ejemplo-switch.ts</p>
      <h4>&#64;switch con el caso calculado en un computed</h4>
      <app-ejemplo-switch />
    </section>
    <section class="tarjeta">
      <p class="meta">Ejemplo 5 · Diapositiva 13 · control-flujo/ejemplo-heredado.ts</p>
      <h4>Sintaxis anterior: *ngIf y *ngFor</h4>
      <app-ejemplo-heredado />
    </section>

    <h3 class="bloque">Bloque 2 · Pipes</h3>
    <section class="tarjeta">
      <p class="meta">Ejemplo 6 · Diapositivas 19 a 22 · pipes/ejemplo-integrados.ts</p>
      <h4>Pipes integrados con configuración es-CO</h4>
      <app-ejemplo-integrados />
    </section>
    <section class="tarjeta">
      <p class="meta">Ejemplo 7 · Diapositiva 23 · pipes/peso-pipe.ts y pipes/ejemplo-pipe-propio.ts</p>
      <h4>Pipe propio: peso</h4>
      <app-ejemplo-pipe-propio />
    </section>
    <section class="tarjeta">
      <p class="meta">Ejemplo 8 · Diapositiva 24 · pipes/ejemplo-pipe-puro.ts</p>
      <h4>Pipe puro: push frente a update</h4>
      <app-ejemplo-pipe-puro />
    </section>

    <h3 class="bloque">Bloque 3 · Estilos</h3>
    <section class="tarjeta">
      <p class="meta">Ejemplo 9 · Diapositivas 28 a 30 · estilos/ejemplo-estilos.ts</p>
      <h4>Binding de clase y de estilo, y encapsulación</h4>
      <app-ejemplo-estilos />
    </section>
  `,
  styles: `
    .bloque { margin-top: 2rem; font-size: .8rem; font-weight: 800; text-transform: uppercase; letter-spacing: .15em; color: #b45309; }
    .tarjeta { margin-top: .9rem; border: 1px solid #e2e8f0; border-left: 4px solid #1e293b; border-radius: .75rem; background: #fff; padding: 1rem 1.2rem; }
    .meta { font-size: .7rem; font-family: ui-monospace, Consolas, monospace; color: #64748b; }
    h4 { margin: .15rem 0 .7rem; font-size: 1.05rem; font-weight: 700; color: #0f172a; }
  `,
})
class App {}

// =============================================================================
// ARRANQUE · configuración regional es-CO (diapositiva 21)
// En el proyecto con Angular CLI esto está en src/app/app.config.ts.
// =============================================================================
registerLocaleData(localeEsCo);

bootstrapApplication(App, {
  providers: [{ provide: LOCALE_ID, useValue: 'es-CO' }],
}).catch((err) => console.error(err));
