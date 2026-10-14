import { Component, computed, signal } from '@angular/core';

// =============================================================================
//  S03 · EJEMPLO 3 · Por qué track necesita una identidad estable
//  Diapositiva 11
// -----------------------------------------------------------------------------
//  Qué muestra
//    Dos tablas con la MISMA lista filtrada. La izquierda usa track $index; la
//    derecha, track p.nombre. Cada fila tiene un campo de texto libre.
//
//  Cómo se demuestra en clase
//    1. Escriba «revisar» en el campo de la fila del Ñame, en las dos tablas.
//    2. Pulse «Ocultar la yuca». La lista pierde su primer elemento.
//    3. Tabla derecha (track p.nombre): «revisar» sigue junto al Ñame.
//       Tabla izquierda (track $index): «revisar» aparece junto al Plátano.
//
//  Por qué
//    Con $index, la identidad de cada fila es su posición. Al quitar la yuca,
//    Angular conserva las filas 0, 1, 2 y solo cambia el texto que muestran; el
//    contenido del campo, que no viene de los datos, se queda en su posición.
//    Con p.nombre, Angular sabe que la fila del Ñame es la misma y la conserva
//    entera. Es el número de documento de la analogía: la identidad no cambia
//    aunque la persona cambie de puesto en la fila.
// =============================================================================

interface Producto {
  nombre: string;
  cantidad: number;
}

@Component({
  selector: 'app-ejemplo-track',
  template: `
    <button type="button" class="btn" (click)="ocultarYuca.update((v) => !v)">
      {{ ocultarYuca() ? 'Mostrar la yuca' : 'Ocultar la yuca' }}
    </button>

    <div class="mt-3 grid gap-4 sm:grid-cols-2">
      <div>
        <p class="rotulo mal">track $index · identidad por posición</p>
        <table class="w-full text-sm">
          <tbody>
            @for (p of visibles(); track $index) {
              <tr class="border-t border-slate-100">
                <td class="py-1 font-semibold">{{ p.nombre }}</td>
                <td class="py-1"><input class="campo" placeholder="nota" /></td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div>
        <p class="rotulo bien">track p.nombre · identidad estable</p>
        <table class="w-full text-sm">
          <tbody>
            @for (p of visibles(); track p.nombre) {
              <tr class="border-t border-slate-100">
                <td class="py-1 font-semibold">{{ p.nombre }}</td>
                <td class="py-1"><input class="campo" placeholder="nota" /></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: `
    .btn { border-radius: .5rem; background: #1e293b; color: #fff; padding: .35rem .8rem; font-size: .8rem; font-weight: 600; }
    .rotulo { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; margin-bottom: .3rem; }
    .mal  { color: #b91c1c; }
    .bien { color: #047857; }
    .campo { width: 100%; border: 1px solid #cbd5e1; border-radius: .35rem; padding: .15rem .4rem; }
  `,
})
export class EjemploTrack {
  ocultarYuca = signal(false);

  productos = signal<Producto[]>([
    { nombre: 'Yuca', cantidad: 3 },
    { nombre: 'Ñame', cantidad: 2 },
    { nombre: 'Plátano', cantidad: 6 },
    { nombre: 'Mango', cantidad: 12 },
  ]);

  visibles = computed(() =>
    this.ocultarYuca() ? this.productos().filter((p) => p.nombre !== 'Yuca') : this.productos(),
  );
}
