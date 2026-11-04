import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { MINIMO, Producto, ProductoApi, pesos, valorInventario } from '../inventario';
import { GuiaEjemplo, Indicador, TarjetaProducto } from '../compartido/ui';

// =============================================================================
//  S08 · EJEMPLO 5 · El puente entre Observable y signal
//  Diapositivas 23 y 24
// -----------------------------------------------------------------------------
//  Qué muestra
//    - toSignal(observable, { initialValue }) convierte un flujo en una signal.
//      Se suscribe al crearse y se cancela al destruirse el componente: no
//      necesita takeUntilDestroyed ni async. Sin valor inicial la signal puede
//      valer undefined; con initialValue siempre tiene un valor.
//    - Con la lista como signal, el resto del estado se escribe con computed:
//      total de filas, valor del inventario mostrado, agotados y el gráfico de
//      barras por categoría. Ninguno de esos cálculos se vuelve a escribir al
//      cambiar la búsqueda: el computed se recalcula solo.
//    - toObservable(signal) hace el camino inverso: emite cuando la signal
//      cambia, y entonces se pueden usar los operadores. Aquí el tope de precio
//      se aplica 400 ms después de soltar el control deslizante.
//
//  Regla práctica
//    - Valores que cambian a lo largo del tiempo y se muestran: signal.
//    - Flujos con tiempo (esperar, cancelar, combinar): Observable.
//    - Se entra al mundo Observable con toObservable y se vuelve con toSignal.
//
//  Qué observar
//    - Escriba «an»: 7 filas y valor $ 249.400. Escriba «man»: 1 fila y
//      $ 21.600. «zzz»: 0 filas y $ 0.
//    - Las tres tarjetas (filas, valor, agotados) y el gráfico por categoría
//      cambian solos con cada búsqueda. Con «an»: Frutas 2 (Mango, Banano),
//      Verduras 1 (Zanahoria), Granos 4 (Arroz, Lenteja, Fríjol, Maíz) y 0 agotados.
//    - Mueva el deslizante: el número a la izquierda cambia al instante; el
//      «tope aplicado» y el gráfico cambian 400 ms después de dejar de mover.
//
//  Qué error previene
//    - Suscribirse a mano en el componente para copiar el valor a una signal,
//      con el riesgo de olvidar la limpieza (ejemplo 3).
//
//  En su proyecto
//    - Un tablero de resumen (totales, valor, agotados y gráfico) que se
//      actualiza con la búsqueda y con un filtro de precio sin escribir código
//      de actualización: signals y computed.
// =============================================================================

const CATEGORIAS = ['Frutas', 'Verduras', 'Granos'] as const;

@Component({
  selector: 'app-ejemplo-puente',
  imports: [ReactiveFormsModule, GuiaEjemplo, Indicador, TarjetaProducto],
  template: `
    <app-guia-ejemplo
      [observar]="[
        'Escriba «an»: 7 filas y $ 249.400. Las tarjetas y las barras cambian solas, sin código de actualización.',
        'Mueva el deslizante: el número cambia al instante; el tope aplicado y el gráfico, 400 ms después.',
        'La lista llega por toSignal; todo lo demás son computed.'
      ]"
      proyecto="Un tablero de resumen con totales, valor y gráfico que se actualiza con la búsqueda y con un filtro de precio." />

    <label class="campo">
      Buscar producto
      <input [formControl]="busqueda" placeholder="Nombre o categoría" autocomplete="off" />
    </label>
    <div class="rapidos">
      @for (t of ['an', 'man', 'gra', 'FRUT', 'zzz']; track t) {
        <button (click)="busqueda.setValue(t)">{{ t }}</button>
      }
    </div>

    <div class="indicadores">
      <app-indicador [valor]="total()" rotulo="Filas" />
      <app-indicador [valor]="pesos(valor())" rotulo="Valor del inventario mostrado" tono="aviso" />
      <app-indicador [valor]="agotados()" rotulo="Agotados" [tono]="agotados() > 0 ? 'alerta' : 'bien'" />
    </div>

    <div class="panel">
      <section>
        <h5>Valor por categoría (productos bajo el tope)</h5>
        <ul class="barras" aria-label="Valor del inventario por categoría">
          @for (c of porCategoria(); track c.categoria) {
            <li>
              <span class="etq">{{ c.categoria }} · {{ c.filas }}</span>
              <span class="pista"><span class="relleno" [class]="c.categoria" [style.width.%]="c.porcentaje"></span></span>
              <span class="valor">{{ pesos(c.valor) }}</span>
            </li>
          }
        </ul>
      </section>
      <section>
        <h5>Precio máximo</h5>
        <label class="campo">
          Control: {{ pesos(tope()) }} · tope aplicado: <strong>{{ pesos(topeAplicado()) }}</strong>
          <input type="range" min="500" max="8000" step="100" [value]="tope()" (input)="tope.set(+$any($event.target).value)" />
        </label>
        <p class="nota">toObservable + debounceTime(400): el tope se aplica cuando el control deja de moverse.</p>
      </section>
    </div>

    <div class="cuadricula">
      @for (p of visibles(); track p.id) {
        <app-producto [producto]="p" [resaltar]="busqueda.value" />
      } @empty {
        <p class="vacio">Sin productos por debajo del tope.</p>
      }
    </div>
  `,
  styles: `
    .campo { display: block; font-size: .85rem; font-weight: 600; }
    input[type='text'], input:not([type]) { border: 1px solid #cbd5e1; border-radius: .4rem; padding: .3rem .5rem; width: 18rem; display: block; margin-top: .2rem; }
    input[type='range'] { display: block; width: 18rem; margin-top: .3rem; }
    .rapidos { display: flex; gap: .4rem; margin-top: .5rem; }
    .rapidos button { border-radius: 1rem; background: #e2e8f0; color: #0f172a; padding: .15rem .7rem; font-size: .8rem; }
    .indicadores { display: flex; flex-wrap: wrap; gap: .6rem; margin: .8rem 0; }
    .panel { display: grid; grid-template-columns: 3fr 2fr; gap: 1rem; margin-bottom: .8rem; }
    @media (max-width: 40rem) { .panel { grid-template-columns: 1fr; } }
    h5 { font-size: .8rem; font-weight: 700; margin-bottom: .4rem; }
    .barras { list-style: none; padding: 0; display: grid; gap: .4rem; }
    .barras li { display: grid; grid-template-columns: 6.5rem 1fr 5.5rem; align-items: center; gap: .5rem; font-size: .8rem; }
    .pista { height: 1rem; background: #e2e8f0; border-radius: .5rem; overflow: hidden; }
    .relleno { display: block; height: 100%; border-radius: .5rem; transition: width .35s; background: #2563eb; }
    .relleno.Verduras { background: #16a34a; }
    .relleno.Granos { background: #d97706; }
    .valor { text-align: right; font-weight: 600; }
    .nota { font-size: .75rem; color: #64748b; margin-top: .4rem; }
    .cuadricula { display: grid; grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr)); gap: .6rem; }
    .vacio { grid-column: 1 / -1; padding: 1rem; border: 1px dashed #cbd5e1; border-radius: .5rem; color: #64748b; font-size: .85rem; }
  `,
})
export class EjemploPuente {
  private readonly api = inject(ProductoApi);
  protected readonly pesos = pesos;
  protected readonly busqueda = new FormControl('', { nonNullable: true });

  // Observable → signal. initialValue evita undefined antes de la primera respuesta.
  protected readonly lista = toSignal(
    this.busqueda.valueChanges.pipe(
      map((t) => t.trim()),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((t) => (t.length < MINIMO ? of<Producto[]>([]) : this.api.buscar(t))),
    ),
    { initialValue: [] as Producto[] },
  );

  // Con la lista como signal, el resto es computed.
  protected readonly total = computed(() => this.lista().length);
  protected readonly valor = computed(() => valorInventario(this.lista()));
  protected readonly agotados = computed(() => this.lista().filter((p) => p.cantidad === 0).length);

  // Signal → Observable. El tope se aplica tras 400 ms sin cambios.
  protected readonly tope = signal(8000);
  protected readonly topeAplicado = toSignal(toObservable(this.tope).pipe(debounceTime(400)), { initialValue: 8000 });
  protected readonly visibles = computed(() => this.lista().filter((p) => p.precio <= this.topeAplicado()));

  protected readonly porCategoria = computed(() => {
    const filas = CATEGORIAS.map((categoria) => {
      const productos = this.visibles().filter((p) => p.categoria === categoria);
      return { categoria, filas: productos.length, valor: valorInventario(productos), porcentaje: 0 };
    });
    const maximo = Math.max(1, ...filas.map((f) => f.valor));
    return filas.map((f) => ({ ...f, porcentaje: (f.valor / maximo) * 100 }));
  });
}
