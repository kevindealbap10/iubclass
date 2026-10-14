import { Component, signal } from '@angular/core';

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

interface Producto {
  nombre: string;
  cantidad: number;
}

const DATOS: Producto[] = [
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
        <tr><th class="px-3 py-2">#</th><th class="px-3 py-2">Producto</th>
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
export class EjemploFor {
  readonly datos = DATOS;
  productos = signal<Producto[]>(DATOS);
}
