import { Component, signal } from '@angular/core';

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

interface Producto {
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
export class EjemploEstilos {
  productos = signal<Producto[]>([
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
