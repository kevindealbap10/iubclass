import { Component, Pipe, PipeTransform, signal } from '@angular/core';

// =============================================================================
//  S03 · EJEMPLO 8 · Pipe puro: por qué no se recalcula con push
//  Diapositiva 24
// -----------------------------------------------------------------------------
//  Qué muestra
//    El pipe conteo devuelve la longitud de una lista. Es puro (el valor por
//    defecto): Angular lo vuelve a ejecutar solo si la ENTRADA cambia, y la
//    compara por referencia, no por contenido.
//
//  Cómo se demuestra en clase
//    1. «Agregar con push (incorrecto)»: modifica el arreglo por dentro. La
//       vista se vuelve a dibujar porque también cambia el contador de clics,
//       pero el pipe recibe el MISMO arreglo y no se ejecuta: «con el pipe» se
//       queda atrás, mientras «directo» muestra el valor real.
//    2. «Agregar con update (correcto)»: entrega un arreglo nuevo. El pipe se
//       ejecuta y los dos valores vuelven a coincidir.
//
//  El método agregarConPush está mal A PROPÓSITO. Es el mismo error del
//  Reto 5 de la S02 (sort sin copia) y es descuento en el Taller 02.
// =============================================================================

@Pipe({ name: 'conteo' })
export class ConteoPipe implements PipeTransform {
  transform(lista: readonly unknown[]): number {
    return lista.length;
  }
}

@Component({
  selector: 'app-ejemplo-pipe-puro',
  imports: [ConteoPipe],
  template: `
    <div class="flex flex-wrap gap-2">
      <button type="button" class="btn rojo" (click)="agregarConPush()">Agregar con push (incorrecto)</button>
      <button type="button" class="btn verde" (click)="agregarConUpdate()">Agregar con update (correcto)</button>
    </div>

    <div class="mt-3 grid grid-cols-3 gap-3 text-center">
      <div class="dato"><p class="rot">Con el pipe</p><p class="num">{{ lista() | conteo }}</p></div>
      <div class="dato"><p class="rot">Directo</p><p class="num">{{ lista().length }}</p></div>
      <div class="dato"><p class="rot">Clics</p><p class="num">{{ clics() }}</p></div>
    </div>
  `,
  styles: `
    .btn { border-radius: .5rem; color: #fff; padding: .35rem .8rem; font-size: .8rem; font-weight: 600; }
    .rojo { background: #b91c1c; }
    .verde { background: #047857; }
    .dato { border: 1px solid #e2e8f0; border-radius: .6rem; padding: .6rem; background: #fff; }
    .rot { font-size: .68rem; text-transform: uppercase; letter-spacing: .08em; color: #64748b; }
    .num { font-size: 1.6rem; font-weight: 800; color: #0f172a; }
  `,
})
export class EjemploPipePuro {
  lista = signal<string[]>(['Mango', 'Guayaba']);
  clics = signal(0);

  // INCORRECTO: push modifica el arreglo que ya está en la signal.
  agregarConPush() {
    this.lista().push('Producto ' + (this.lista().length + 1));
    this.clics.update((n) => n + 1); // fuerza el redibujo para que se vea la diferencia
  }

  // CORRECTO: un arreglo nuevo con el elemento agregado.
  agregarConUpdate() {
    this.lista.update((l) => [...l, 'Producto ' + (l.length + 1)]);
    this.clics.update((n) => n + 1);
  }
}
