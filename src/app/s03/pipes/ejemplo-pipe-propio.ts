import { Component, signal } from '@angular/core';
import { PesoPipe } from './peso-pipe';

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

interface Presentacion {
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
export class EjemploPipePropio {
  presentaciones = signal<Presentacion[]>([
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
