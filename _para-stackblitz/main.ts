/* =============================================================================
   COM30 · S02 · VERSIÓN PARA STACKBLITZ  (un solo archivo)
   -----------------------------------------------------------------------------
   Es EL MISMO código de la clase, con la plantilla adentro del componente en vez
   de en un archivo aparte. Ni una línea de lógica cambia.

   CÓMO USARLO
     1. En StackBlitz, abre el archivo  src/main.ts
     2. Haz clic DENTRO del editor, selecciona todo con Ctrl+A y pega encima.
     3. La vista previa se actualiza sola.

   ¡OJO! NO BORRES EL ARCHIVO, SOLO SU CONTENIDO.
     El proyecto está configurado para arrancar desde src/main.ts. Si borras el
     archivo en vez de su texto, la compilación falla con:

         ERROR TS6053: File '.../src/main.ts' not found.
         ERROR Could not resolve '.../src/main.ts'

     Se arregla volviéndolo a crear: clic derecho en la carpeta  src  ->
     New file -> nómbralo EXACTAMENTE  main.ts  (todo en minúscula) y pega
     este contenido. El nombre distingue mayúsculas: Main.ts NO sirve.

   PARA QUE SE VEA CON ESTILOS (Tailwind)
     Abre  src/index.html  y pega esta línea dentro de <head>:

       <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

     Si esa línea no carga porque la red la bloquea, NO PASA NADA: la aplicación
     funciona igual, solo se ve sin estilos. Lo que se evalúa es que funcione.
   ========================================================================== */

import { bootstrapApplication } from '@angular/platform-browser';
import { Component, computed, signal } from '@angular/core';

// -----------------------------------------------------------------------------
// El modelo de datos: describe la FORMA que tiene un producto.
// -----------------------------------------------------------------------------
interface Producto {
  nombre: string;
  precio: number;
  cantidad: number;
}

@Component({
  selector: 'app-root',
  template: `
    <div class="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div class="mx-auto max-w-4xl">
        <!-- BINDING 1 · INTERPOLACION (llaves dobles) · la signal se lee LLAMANDOLA -->
        <h2 class="text-2xl font-bold">Puesto de {{ vendedor() }}</h2>
        <p class="mt-1 text-sm text-slate-500">Inventario del día · plaza de mercado</p>

        <!-- BINDING 3 · EVENTOS ( ) · el $event trae lo que escribió el usuario -->
        <div class="mt-6 flex gap-2">
          <input
            type="text"
            placeholder="Buscar producto…"
            class="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm"
            [value]="filtro()"
            (input)="onFiltrar($event)"
          />
          <!-- BINDING 2 · PROPIEDADES [ ] · entre comillas va una EXPRESIÓN -->
          <button
            type="button"
            class="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-30"
            [disabled]="filtro() === ''"
            (click)="limpiarFiltro()"
          >
            Limpiar
          </button>
        </div>

        <!-- LA TABLA · @for SIEMPRE con su track, o sale el error NG5002 -->
        <div class="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-900 text-xs uppercase tracking-wider text-white">
              <tr>
                <th class="px-4 py-3">Producto</th>
                <th class="px-4 py-3">Precio</th>
                <th class="px-4 py-3">Cantidad</th>
                <th class="px-4 py-3">Subtotal</th>
                <th class="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (p of visibles(); track p.nombre) {
                <tr class="border-t border-slate-100" [class.opacity-40]="p.cantidad === 0">
                  <td class="px-4 py-3 font-semibold">{{ p.nombre }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ p.precio }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ p.cantidad }}</td>
                  <td class="px-4 py-3 font-semibold">{{ p.precio * p.cantidad }}</td>
                  <td class="px-4 py-3">
                    <button
                      type="button"
                      class="rounded-md bg-amber-400 px-3 py-1 text-xs font-bold disabled:opacity-30"
                      [disabled]="p.cantidad === 0"
                      (click)="vender(p.nombre)"
                    >
                      Vender 1
                    </button>
                    <button
                      type="button"
                      class="ml-1 rounded-md bg-slate-200 px-3 py-1 text-xs font-bold"
                      (click)="reabastecer(p.nombre)"
                    >
                      +10
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-4 py-8 text-center text-slate-400">
                    Ningún producto coincide con «{{ filtro() }}»
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- LOS COMPUTED · también se leen con paréntesis -->
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl bg-slate-900 px-5 py-4 text-white">
            <div class="text-xs uppercase tracking-widest text-amber-400">Total en dinero</div>
            <div class="mt-1 text-3xl font-bold">{{ total() }}</div>
          </div>
          <div class="rounded-xl bg-slate-100 px-5 py-4">
            <div class="text-xs uppercase tracking-widest text-slate-500">Unidades</div>
            <div class="mt-1 text-3xl font-bold">{{ unidades() }}</div>
          </div>
        </div>

        <!-- @if · es tema de la S03, pero es el requisito 5 del Taller 01 -->
        @if (total() > 50000) {
          <div class="mt-3 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 px-5 py-3">
            <p class="text-sm font-semibold text-emerald-900">Jornada de venta mayorista</p>
          </div>
        }

        <p class="mt-4 text-xs text-slate-400">
          Mostrando {{ visibles().length }} de {{ productos().length }} productos.
        </p>
      </div>
    </div>
  `,
})
export class App {
  // ===========================================================================
  //  EL ESTADO — en signals
  // ===========================================================================
  vendedor = signal('Don Efraín');
  filtro = signal('');

  productos = signal<Producto[]>([
    { nombre: 'Yuca', precio: 2800, cantidad: 3 },
    { nombre: 'Ñame', precio: 4200, cantidad: 2 },
    { nombre: 'Plátano', precio: 1500, cantidad: 6 },
    { nombre: 'Mango', precio: 1800, cantidad: 12 },
    { nombre: 'Guayaba', precio: 1200, cantidad: 0 },
  ]);

  // ===========================================================================
  //  LOS VALORES DERIVADOS — computed()
  //  Al leer productos() adentro quedan suscritos: se recalculan solos.
  // ===========================================================================
  total = computed(() =>
    this.productos().reduce((suma, p) => suma + p.precio * p.cantidad, 0)
  );

  // Ojo: aquí se suma la CANTIDAD, no el precio por la cantidad.
  unidades = computed(() =>
    this.productos().reduce((suma, p) => suma + p.cantidad, 0)
  );

  visibles = computed(() => {
    const texto = this.filtro().toLowerCase().trim();
    if (texto === '') return this.productos();
    return this.productos().filter((p) => p.nombre.toLowerCase().includes(texto));
  });

  // ===========================================================================
  //  LOS MÉTODOS — cómo se cambia una signal
  // ===========================================================================
  //  Lo que NO funciona:   this.productos()[0].cantidad--;
  //  El arreglo sí cambia, la pantalla no se entera. Hay que construir uno NUEVO.
  vender(nombre: string) {
    this.productos.update((lista) =>
      lista.map((p) =>
        p.nombre === nombre && p.cantidad > 0
          ? { ...p, cantidad: p.cantidad - 1 }
          : p
      )
    );
  }

  reabastecer(nombre: string) {
    this.productos.update((lista) =>
      lista.map((p) => (p.nombre === nombre ? { ...p, cantidad: p.cantidad + 10 } : p))
    );
  }

  onFiltrar(e: Event) {
    const caja = e.target as HTMLInputElement;
    this.filtro.set(caja.value);
  }

  limpiarFiltro() {
    this.filtro.set('');
  }
}

bootstrapApplication(App);
