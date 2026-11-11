import { Component, computed, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { INVENTARIO } from '../../s08/inventario';

// =============================================================================
//  S09 · Ejemplo 1 · Detalle por parámetro de ruta · /s09/productos/:id
//  Diapositivas 13, 14, 15 y 20
// -----------------------------------------------------------------------------
//  1. :id llega como TEXTO al input() del mismo nombre (withComponentInputBinding).
//     Toda URL es texto: «8» no es 8. Se convierte con Number() en el computed.
//  2. El producto se busca en un computed: cuando :id cambia sin salir del
//     componente (botones Anterior y Siguiente), el detalle se recalcula solo.
//  3. Un código que no existe NO es un 404: la ruta sí existe (/productos/:id),
//     lo que no existe es el registro. Se muestra un mensaje dentro del detalle.
//  4. Navegación programática: el cuadro «Ir al código» usa router.navigate()
//     porque la URL se decide en el código, después de leer lo que se escribió.
//
//  Resultados
//    /s09/productos/8   -> Banano · Frutas · $ 900 · 30 unidades
//    /s09/productos/14  -> Maíz · Siguiente queda deshabilitado
//    /s09/productos/99  -> «No existe un producto con el código 99»
//    /s09/productos/abc -> el mismo mensaje: Number('abc') es NaN
// =============================================================================

@Component({
  selector: 'app-detalle-producto',
  imports: [RouterLink, CurrencyPipe, FormsModule],
  template: `
    <p class="text-sm text-slate-600">id() = <b class="font-mono">'{{ id() }}'</b> (texto)</p>

    @if (producto(); as p) {
      <article class="mt-3 max-w-md rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p class="font-mono text-xs text-slate-400">Código {{ p.id }} · {{ p.categoria }}</p>
        <h3 class="text-xl font-bold text-slate-900" data-testid="nombre">{{ p.nombre }}</h3>
        <p class="mt-1 text-slate-700">
          {{ p.precio | currency: 'COP' : 'symbol-narrow' : '1.0-0' }} · {{ p.cantidad }} unidades
        </p>
        <div class="mt-3 flex gap-2">
          <a [routerLink]="['..', p.id - 1]" class="paso" [class.off]="p.id === 1">← Anterior</a>
          <a [routerLink]="['..', p.id + 1]" class="paso" [class.off]="p.id === ultimo">Siguiente →</a>
          <a routerLink=".." class="paso">Volver al listado</a>
        </div>
      </article>
    } @else {
      <div class="mt-3 max-w-md rounded-xl bg-amber-50 p-4 text-amber-800" data-testid="no-existe">
        No existe un producto con el código {{ id() }}.
        <a routerLink=".." class="ml-1 font-semibold underline">Volver al listado</a>
      </div>
    }

    <form class="mt-4 flex items-center gap-2 text-sm" (ngSubmit)="irA()">
      <label for="codigo" class="text-slate-600">Ir al código</label>
      <input id="codigo" name="codigo" type="number" [(ngModel)]="codigo"
             class="w-20 rounded border border-slate-300 px-2 py-1" />
      <button class="rounded bg-blue-800 px-3 py-1 font-semibold text-white">Ir</button>
    </form>
  `,
  styles: `
    .paso { border-radius: 0.5rem; border: 1px solid #cbd5e1; padding: 0.25rem 0.7rem; font-size: 0.85rem; }
    .off { pointer-events: none; opacity: 0.35; }
  `,
})
export class DetalleProducto {
  private readonly router = inject(Router);

  /** :id de la ruta. Siempre texto. */
  readonly id = input.required<string>();

  readonly ultimo = INVENTARIO.length;
  readonly producto = computed(() => INVENTARIO.find((p) => p.id === Number(this.id())));

  codigo: number | null = null;

  irA(): void {
    if (this.codigo == null) return;
    // Ruta absoluta: el arreglo se une con «/» -> /s09/productos/5
    this.router.navigate(['/s09/productos', this.codigo]);
  }
}
