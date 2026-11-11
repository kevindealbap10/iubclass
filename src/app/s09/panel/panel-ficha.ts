import { Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { INVENTARIO } from '../../s08/inventario';

// =============================================================================
//  S09 · Ejemplo 5 · Ruta secundaria (outlet con nombre) · Diapositivas 39 y 40
// -----------------------------------------------------------------------------
//  Este componente NO se muestra en el router-outlet principal: se muestra en
//  <router-outlet name="panel" /> de s09.ts, AL MISMO TIEMPO que la vista
//  principal. La ruta se declara con outlet: 'panel' en s09.routes.ts.
//
//  La dirección lleva las dos rutas a la vez, entre paréntesis y separadas por //:
//    /s09/(productos//panel:ficha/8)
//    /s09/(resumen//panel:ficha/8)     <- cambia la principal, el panel se queda
//
//  Qué observar
//    - El listado y la ficha se ven juntos; cada uno tiene su propia ruta.
//    - F5 conserva el panel abierto: está en la dirección.
//    - «Cerrar» navega con { outlets: { panel: null } }: quita solo el panel.
//    - :id llega al input() igual que en el detalle (withComponentInputBinding).
// =============================================================================

@Component({
  selector: 'app-panel-ficha',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <aside class="rounded-xl border-2 border-violet-500 bg-violet-50 p-4">
      <p class="text-[11px] font-bold uppercase tracking-widest text-violet-700">router-outlet name="panel"</p>
      @if (producto(); as p) {
        <h3 class="mt-1 text-lg font-bold text-slate-900" data-testid="panel-nombre">{{ p.nombre }}</h3>
        <p class="text-sm text-slate-700">{{ p.categoria }} · {{ p.precio | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</p>
        <p class="text-sm text-slate-700">{{ p.cantidad }} unidades</p>
      } @else {
        <p class="mt-1 text-sm text-amber-800">No existe el producto {{ id() }}.</p>
      }
      <a [routerLink]="['/s09', { outlets: { panel: null } }]" queryParamsHandling="preserve"
         class="mt-3 inline-block text-sm font-semibold text-violet-800 underline">Cerrar panel</a>
    </aside>
  `,
})
export class PanelFicha {
  readonly id = input.required<string>();
  readonly producto = computed(() => INVENTARIO.find((p) => p.id === Number(this.id())));
}
