import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { INVENTARIO, valorInventario } from '../../s08/inventario';

// =============================================================================
//  S09 · Ejemplo 3 · Vista con carga diferida · /s09/resumen · Diapositiva 22
// -----------------------------------------------------------------------------
//  Esta vista se declara con loadComponent en s09.routes.ts. Su código se
//  descarga la primera vez que se entra a /s09/resumen y no antes.
//
//  Qué observar: F12 > Red, filtro JS. Al pulsar «Resumen (diferida)» aparece
//  un archivo chunk-XXXX.js nuevo. La segunda vez ya no se descarga.
//
//  Resultados: Frutas 5 · $ 89.600 · Verduras 5 · $ 63.100 · Granos 4 · $ 169.300
//  Total 14 productos · $ 322.000 (el mismo valor del inventario de la S08)
// =============================================================================

const CATEGORIAS = ['Frutas', 'Verduras', 'Granos'] as const;

@Component({
  selector: 'app-resumen',
  imports: [CurrencyPipe],
  template: `
    <table class="w-full max-w-md text-sm">
      <thead>
        <tr class="text-left text-slate-500"><th>Categoría</th><th>Productos</th><th class="text-right">Valor</th></tr>
      </thead>
      <tbody>
        @for (f of filas; track f.categoria) {
          <tr class="border-t border-slate-200">
            <td class="py-1">{{ f.categoria }}</td><td>{{ f.cantidad }}</td>
            <td class="text-right">{{ f.valor | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</td>
          </tr>
        }
        <tr class="border-t-2 border-slate-400 font-bold">
          <td class="py-1">Total</td><td>{{ total.cantidad }}</td>
          <td class="text-right" data-testid="valor">{{ total.valor | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</td>
        </tr>
      </tbody>
    </table>
  `,
})
export class Resumen {
  readonly filas = CATEGORIAS.map((categoria) => {
    const ps = INVENTARIO.filter((p) => p.categoria === categoria);
    return { categoria, cantidad: ps.length, valor: valorInventario(ps) };
  });
  readonly total = { cantidad: INVENTARIO.length, valor: valorInventario(INVENTARIO) };
}
