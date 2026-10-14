import { Component, signal } from '@angular/core';

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

interface Producto {
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
export class EjemploIf {
  total = signal(72800);

  // El tipo admite null: puede no haber ningún producto seleccionado.
  productoSeleccionado = signal<Producto | null>(null);

  seleccionar() {
    this.productoSeleccionado.set({ nombre: 'Mango', precio: 1800, cantidad: 12 });
  }
}
