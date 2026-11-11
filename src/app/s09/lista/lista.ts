import { Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { INVENTARIO } from '../../s08/inventario';

// =============================================================================
//  S09 · Ejemplo 2 · Listado con filtro en la URL · /s09/productos?categoria=Granos
//  Diapositivas 17 y 18
// -----------------------------------------------------------------------------
//  El filtro NO vive en una signal del componente: vive en la URL, como
//  parámetro de consulta (?categoria=...). Con withComponentInputBinding()
//  (app.config.ts), Angular entrega ese valor al input() del mismo nombre.
//
//  Consecuencias que se comprueban en clase
//    - F5 conserva el filtro: está en la dirección, no en memoria.
//    - La URL se puede copiar y enviar: quien la abre ve la misma lista.
//    - Atrás del navegador deshace el último filtro.
//
//  Resultados con el inventario de 14 productos (S08)
//    sin filtro 14 · Frutas 5 · Verduras 5 · Granos 4 · ?categoria=Lacteos 0
//
//  Cada tarjeta enlaza a [p.id]: ruta RELATIVA, queda /s09/productos/<id>.
// =============================================================================

@Component({
  selector: 'app-lista-productos',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm font-semibold text-slate-600">Categoría:</span>
      <a routerLink="." [queryParams]="{}" class="filtro" [class.sel]="!categoria()">Todas</a>
      @for (c of categorias; track c) {
        <a routerLink="." [queryParams]="{ categoria: c }" class="filtro" [class.sel]="categoria() === c">{{ c }}</a>
      }
    </div>

    <p class="mt-3 text-sm text-slate-600">
      categoria() = <b class="font-mono">{{ categoria() ?? 'undefined' }}</b> ·
      <b data-testid="total">{{ visibles().length }}</b> productos
    </p>

    <ul class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      @for (p of visibles(); track p.id) {
        <li>
          <a [routerLink]="[p.id]" class="block rounded-lg border border-slate-200 bg-slate-50 p-3 hover:border-blue-700">
            <span class="font-mono text-xs text-slate-400">#{{ p.id }}</span>
            <b class="block text-slate-900">{{ p.nombre }}</b>
            <span class="text-xs text-slate-500">{{ p.precio | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</span>
          </a>
          <!-- Ejemplo 5 · abre la ficha en el outlet «panel» sin salir del listado -->
          <a [routerLink]="['/s09', { outlets: { panel: ['ficha', p.id] } }]" queryParamsHandling="preserve"
             class="mt-1 block text-xs font-semibold text-violet-700 hover:underline">Vista rápida</a>
        </li>
      } @empty {
        <li class="col-span-full rounded-lg bg-amber-50 p-3 text-amber-800">
          No hay productos en la categoría «{{ categoria() }}».
        </li>
      }
    </ul>
  `,
  styles: `
    .filtro { border-radius: 0.5rem; border: 1px solid #cbd5e1; padding: 0.2rem 0.7rem; font-size: 0.85rem; }
    .sel { background: #d97706; border-color: #d97706; color: #fff; font-weight: 700; }
  `,
})
export class ListaProductos {
  /** ?categoria=... · undefined cuando la URL no lo trae. */
  readonly categoria = input<string>();

  readonly categorias = ['Frutas', 'Verduras', 'Granos'];

  readonly visibles = computed(() => {
    const c = this.categoria();
    return c ? INVENTARIO.filter((p) => p.categoria === c) : INVENTARIO;
  });
}
