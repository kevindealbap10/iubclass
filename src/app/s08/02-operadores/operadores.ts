import { Component, computed, signal } from '@angular/core';
import { filter, from, interval, map, tap, toArray, zip } from 'rxjs';
import { INVENTARIO, Producto, pesos } from '../inventario';
import { Canicas, RegistroCanicas } from '../compartido/canicas';
import { GuiaEjemplo, Indicador, TarjetaProducto } from '../compartido/ui';

// =============================================================================
//  S08 · EJEMPLO 2 · Operadores en un pipe: filter, map y toArray
//  Diapositivas 12 y 13
// -----------------------------------------------------------------------------
//  Qué muestra
//    - from(INVENTARIO) emite los 14 productos uno por uno. Aquí se emiten cada
//      150 ms (zip con interval) para que el diagrama de canicas muestre el
//      avance; el resultado del pipe es el mismo sin ese ritmo.
//    - pipe() encadena operadores. Cada uno recibe lo que emite el anterior:
//        filter   deja pasar solo los productos con cantidad mayor que 0
//        map      transforma cada producto en { nombre, valor } con
//                 valor = precio por cantidad
//        toArray  espera a que termine la secuencia y entrega un solo arreglo
//    - tap no cambia nada: observa. Aquí anota cada etapa en una línea del
//      diagrama.
//
//  Qué observar
//    - Cuatro líneas de tiempo: la primera tiene 14 canicas; la segunda,
//      11 canicas y 3 círculos huecos (Guayaba, Ahuyama y Lechuga, con cantidad
//      0, no pasan el filtro); la tercera, 11 valores; la cuarta, una sola
//      canica al final, el arreglo, porque toArray espera el complete.
//    - Entran 14 y salen 11 del filtro. El valor del inventario es $ 322.000.
//      Los tres productos sin existencias aportan 0, por eso el total no
//      cambia con o sin filtro.
//    - Hasta que no hay subscribe no se ejecuta nada del pipe (ejemplo 1).
//
//  Qué error previene
//    - Creer que filter modifica el arreglo original. INVENTARIO sigue con 14.
//
//  En su proyecto
//    - Filtrar y transformar lo que llega del servidor (por ejemplo, quitar los
//      agotados y calcular el valor de cada línea) sin escribir ciclos a mano.
// =============================================================================

interface Fila { nombre: string; valor: number; }

@Component({
  selector: 'app-ejemplo-operadores',
  imports: [Canicas, GuiaEjemplo, Indicador, TarjetaProducto],
  template: `
    <app-guia-ejemplo
      [observar]="[
        'Línea 1: 14 canicas. Línea 2: 11 canicas y 3 círculos huecos, los productos sin existencias.',
        'Línea 4: una sola canica al final, porque toArray espera el complete.',
        'Entran 14, pasan 11 y el valor del inventario es $ 322.000.'
      ]"
      proyecto="Quitar los agotados y calcular el valor de cada línea de un listado que llega del servidor, con un pipe y sin ciclos a mano." />

    <div class="botones">
      <button class="ejecutar" (click)="ejecutar()" [disabled]="corriendo()">Ejecutar el pipe</button>
      <button class="sec" (click)="reiniciar()">Reiniciar</button>
    </div>

    <app-canicas [registro]="registro" [ventana]="2400" />

    @if (hecho()) {
      <div class="indicadores">
        <app-indicador [valor]="entran()" rotulo="Entran a filter" />
        <app-indicador [valor]="pasan()" rotulo="Pasan a map" tono="bien" />
        <app-indicador [valor]="entran() - pasan()" rotulo="Descartados" tono="alerta" />
        <app-indicador [valor]="pesos(total())" rotulo="Valor del inventario" tono="aviso" />
      </div>

      <h5>Productos que pasan el filtro ({{ filas().length }})</h5>
      <div class="cuadricula">
        @for (p of conExistencias(); track p.id) { <app-producto [producto]="p" /> }
      </div>

      <table>
        <thead><tr><th>Producto</th><th>Valor (precio por cantidad)</th></tr></thead>
        <tbody>
          @for (f of filas(); track f.nombre) {
            <tr><td>{{ f.nombre }}</td><td>{{ pesos(f.valor) }}</td></tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: `
    .botones { display: flex; gap: .5rem; }
    button { border-radius: .4rem; background: #1e293b; color: #fff; padding: .35rem .8rem; font-size: .85rem; }
    button.sec { background: #e2e8f0; color: #0f172a; }
    button:disabled { opacity: .4; }
    .indicadores { display: flex; flex-wrap: wrap; gap: .6rem; margin: .6rem 0; }
    h5 { margin: .8rem 0 .4rem; font-size: .85rem; font-weight: 700; }
    .cuadricula { display: grid; grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr)); gap: .6rem; }
    table { border-collapse: collapse; font-size: .85rem; margin-top: .8rem; }
    th, td { border: 1px solid #e2e8f0; padding: .25rem .7rem; text-align: left; }
    th { background: #f1f5f9; }
  `,
})
export class EjemploOperadores {
  protected readonly pesos = pesos;
  protected readonly registro = new RegistroCanicas('compartido', [
    'from(INVENTARIO)', 'filter(cantidad > 0)', 'map → valor', 'toArray()',
  ]);
  protected readonly filas = signal<Fila[]>([]);
  protected readonly entran = signal(0);
  protected readonly pasan = signal(0);
  protected readonly hecho = signal(false);
  protected readonly corriendo = signal(false);
  protected readonly total = computed(() => this.filas().reduce((s, f) => s + f.valor, 0));
  protected readonly conExistencias = computed<Producto[]>(() => INVENTARIO.filter((p) => p.cantidad > 0));

  protected reiniciar(): void {
    this.registro.reiniciar();
    this.filas.set([]);
    this.entran.set(0);
    this.pasan.set(0);
    this.hecho.set(false);
  }

  protected ejecutar(): void {
    this.reiniciar();
    this.corriendo.set(true);
    // zip con interval solo da ritmo a la emisión para poder dibujarla.
    zip(from(INVENTARIO), interval(150))
      .pipe(
        map(([p]) => p),
        tap((p) => {
          this.entran.update((n) => n + 1);
          this.registro.emitir(0, 'next', p.nombre);
          if (p.cantidad === 0) this.registro.emitir(1, 'omitido', p.nombre);
        }),
        filter((p) => p.cantidad > 0),
        tap((p) => {
          this.pasan.update((n) => n + 1);
          this.registro.emitir(1, 'next', p.nombre);
        }),
        map((p): Fila => ({ nombre: p.nombre, valor: p.precio * p.cantidad })),
        tap((f) => this.registro.emitir(2, 'next', (f.valor / 1000).toFixed(1) + 'k')),
        toArray(),
      )
      .subscribe({
        next: (filas) => {
          this.registro.emitir(3, 'next', String(filas.length));
          this.registro.emitir(3, 'complete');
          this.filas.set(filas);
          this.hecho.set(true);
        },
        complete: () => this.corriendo.set(false),
      });
  }
}
