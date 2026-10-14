import { Component, computed, signal } from '@angular/core';

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

interface Producto {
  nombre: string;
  precio: number;
}

@Component({
  selector: 'app-ejemplo-switch',
  template: `
    <button type="button" class="btn" (click)="subirMango()">Subir el mango 1.000</button>

    <table class="mt-3 w-full text-left text-sm">
      <thead class="bg-slate-900 text-xs uppercase text-white">
        <tr><th class="px-3 py-2">Producto</th><th class="px-3 py-2">Precio</th><th class="px-3 py-2">Rango</th></tr>
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
export class EjemploSwitch {
  productos = signal<Producto[]>([
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
