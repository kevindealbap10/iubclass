import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Observable, Subscription, debounceTime, defer, distinctUntilChanged, finalize, interval, map, mergeMap, of, switchMap, take, tap,
} from 'rxjs';
import { MINIMO, Producto, ProductoApi } from '../inventario';
import { Canicas, RegistroCanicas } from '../compartido/canicas';
import { Cargando, GuiaEjemplo, Indicador, TarjetaProducto } from '../compartido/ui';

// =============================================================================
//  S08 · EJEMPLO 4 · Buscador con valueChanges, debounceTime y switchMap
//  Diapositivas 14, 15, 19 y 20
// -----------------------------------------------------------------------------
//  Qué muestra
//    - valueChanges de un FormControl es un Observable: emite el valor cada vez
//      que el usuario escribe.
//    - Tres tuberías sobre ese mismo flujo, que se eligen con el selector:
//        1. mergeMap     sin debounce. Cada letra lanza una consulta y todas
//                        siguen vivas: gana la última RESPUESTA en llegar, no
//                        la última letra escrita.
//        2. switchMap    sin debounce. Cada letra nueva cancela la consulta
//                        anterior: solo importa la última letra.
//        3. completo     map (trim) → debounceTime(300) → distinctUntilChanged
//                        → switchMap. Una consulta por pausa del usuario.
//      En las tres, switchMap/mergeMap devuelve of([]) si el texto tiene menos de
//      2 caracteres: la lista se vacía, no se consulta y llamadas no aumenta.
//    - El servicio simulado responde más tarde a los textos cortos
//      (max(150, 900 - 150 * longitud) ms): «ma» tarda 600 ms y «man» 450 ms.
//    - El diagrama de canicas tiene cuatro líneas sobre el mismo eje de tiempo:
//        Pulsaciones              cada valor que emite valueChanges
//        Salida de la tubería     lo que llega a la consulta (tras debounce en la
//                                 tubería completa)
//        Consultas al servidor    barra desde que sale la petición hasta que
//                                 responde; línea cortada si switchMap la cancela
//        Respuestas               la respuesta que llega, con su número de filas
//
//  Qué observar
//    - Pulse «Escribir ma y man en 100 ms» con cada tubería.
//        mergeMap  → 2 consultas; «ma» llega después que «man» y deja el
//                    resultado equivocado: 4 filas (Mango, Tomate, Ahuyama, Maíz)
//                    con el campo mostrando «man». En el diagrama, la barra de
//                    «ma» termina DESPUÉS que la de «man».
//        switchMap → 2 consultas; la de «ma» se cancela (línea cortada); queda
//                    «man»: 1 fila.
//        completo  → 1 consulta; el debounce descarta «ma» porque «man» llega
//                    antes de 300 ms: 1 fila.
//    - Pulse «Escribir mango letra por letra» (5 pulsaciones, 80 ms entre cada
//      una):  completo → 1 consulta (ahorro del 80 %) · switchMap → 4 consultas,
//      3 canceladas · mergeMap → 4 consultas, ninguna cancelada.
//    - Escriba a mano en la tubería completa y compare el contador de consultas
//      con la cantidad de letras.
//    - Un solo carácter no consulta y borra los resultados. «zzz» devuelve 0
//      filas y muestra el bloque @empty.
//    - Resultados esperados (tubería completa): an 7 · ma 4 · man 1 · gra 4 ·
//      FRUT 5 · zzz 0 · a no consulta · fri 1 (Fríjol) · maiz 1 (Maíz).
//
//  Qué error previene
//    - Mostrar el resultado de una búsqueda anterior (carrera de respuestas).
//    - Una consulta por cada tecla (diapositiva 19).
//    - Un filter(longitud >= 2) en la tubería: al borrar el campo el texto corto
//      se descarta y la lista anterior queda en pantalla, desactualizada. Con
//      of([]) dentro de switchMap la lista se vacía. filter se ve en el
//      ejemplo 2 (operadores), no aquí.
//
//  En su proyecto
//    - El filtro de un catálogo, de un listado de clientes o de un tablero de
//      pedidos: el usuario escribe, el servidor responde una vez por pausa y la
//      pantalla muestra siempre la respuesta de lo último que escribió.
// =============================================================================

type Modo = 'merge' | 'switch' | 'completo';

@Component({
  selector: 'app-ejemplo-buscador',
  imports: [ReactiveFormsModule, Canicas, Cargando, GuiaEjemplo, Indicador, TarjetaProducto],
  template: `
    <app-guia-ejemplo
      [observar]="[
        'Con mergeMap, la barra de «ma» termina después que la de «man»: la tabla queda con 4 filas aunque el campo diga «man».',
        'Con switchMap, la consulta de «ma» se dibuja con línea cortada: se canceló y la tabla muestra 1 fila.',
        'Con debounceTime, escribir «mango» letra por letra genera 5 pulsaciones y 1 consulta.'
      ]"
      proyecto="Filtro de un catálogo, de clientes o de pedidos: una consulta por pausa del usuario y siempre la respuesta de lo último que escribió." />

    <div class="modo">
      <label>
        Tubería
        <select [value]="modo()" (change)="cambiarModo($any($event.target).value)">
          <option value="merge">Sin debounce con mergeMap</option>
          <option value="switch">Sin debounce con switchMap</option>
          <option value="completo">Completa: debounce, distinct y switchMap</option>
        </select>
      </label>
      <button (click)="carrera()">Escribir «ma» y «man» en 100 ms</button>
      <button (click)="escribirPalabra('mango')">Escribir «mango» letra por letra</button>
      <button class="sec" (click)="limpiar()">Reiniciar</button>
    </div>

    <label class="campo">
      Buscar producto
      <input [formControl]="busqueda" placeholder="Nombre o categoría" autocomplete="off" />
    </label>

    <div class="indicadores">
      <app-indicador [valor]="pulsaciones()" rotulo="Pulsaciones" />
      <app-indicador [valor]="api.llamadas()" rotulo="Consultas al servidor" tono="aviso" />
      <app-indicador [valor]="ahorro()" rotulo="Consultas evitadas" tono="bien" />
      <app-indicador [valor]="resultados().length" rotulo="Filas mostradas" />
    </div>
    <p class="consultados">Textos consultados: <code>{{ api.consultados().join(' → ') || '—' }}</code></p>

    <app-canicas [registro]="registro" [ventana]="3000" />

    <div class="estado">
      @if (texto().length < minimo) {
        <p class="aviso">Escriba al menos {{ minimo }} caracteres.</p>
      } @else if (buscando()) {
        <app-cargando texto="Buscando…" />
      }
    </div>

    @if (texto().length >= minimo && !buscando()) {
      <div class="cuadricula">
        @for (p of resultados(); track p.id) {
          <app-producto [producto]="p" [resaltar]="texto()" />
        } @empty {
          <p class="vacio">Sin coincidencias para «{{ texto() }}».</p>
        }
      </div>
    }
  `,
  styles: `
    .modo { display: flex; flex-wrap: wrap; gap: .6rem; align-items: end; margin-bottom: .8rem; font-size: .85rem; }
    select, input { border: 1px solid #cbd5e1; border-radius: .4rem; padding: .3rem .5rem; font-size: .9rem; display: block; }
    .campo { display: block; font-size: .85rem; font-weight: 600; }
    .campo input { width: 18rem; margin-top: .2rem; }
    button { border-radius: .4rem; background: #1e293b; color: #fff; padding: .4rem .8rem; font-size: .85rem; }
    button.sec { background: #e2e8f0; color: #0f172a; }
    .indicadores { display: flex; flex-wrap: wrap; gap: .6rem; margin: .8rem 0 .3rem; }
    .consultados { font-size: .8rem; color: #475569; }
    .estado { min-height: 1.6rem; margin: .3rem 0; }
    .aviso { font-size: .9rem; color: #92400e; }
    .cuadricula { display: grid; grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr)); gap: .6rem; }
    .vacio { grid-column: 1 / -1; padding: 1rem; border: 1px dashed #cbd5e1; border-radius: .5rem; color: #64748b; font-size: .85rem; }
  `,
})
export class EjemploBuscador {
  protected readonly api = inject(ProductoApi);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly minimo = MINIMO;

  protected readonly busqueda = new FormControl('', { nonNullable: true });
  protected readonly modo = signal<Modo>('completo');
  /** Lista que se muestra. Con menos de MINIMO caracteres queda vacía y no se consulta. */
  protected readonly resultados = signal<Producto[]>([]);
  protected readonly buscando = signal(false);
  protected readonly pulsaciones = signal(0);
  /** Texto recortado, solo para decidir qué mensaje se muestra. No interviene en la tubería. */
  protected readonly texto = toSignal(this.busqueda.valueChanges.pipe(map((t) => t.trim())), { initialValue: '' });
  protected readonly ahorro = computed(() => {
    const p = this.pulsaciones();
    return p === 0 ? '—' : `${Math.max(0, Math.round((1 - this.api.llamadas() / p) * 100))} %`;
  });

  protected readonly registro = new RegistroCanicas('compartido', [
    'Pulsaciones · valueChanges', 'Tras map(trim)', 'Consultas al servidor', 'Respuestas',
  ]);

  private suscripcion?: Subscription;

  constructor() {
    this.api.reiniciar();
    this.armar();
  }

  protected cambiarModo(valor: Modo): void {
    this.modo.set(valor);
    this.limpiar();
  }

  protected limpiar(): void {
    this.busqueda.setValue('', { emitEvent: false });
    this.resultados.set([]);
    this.buscando.set(false);
    this.pulsaciones.set(0);
    this.api.reiniciar();
    this.armar();
  }

  /** Reproduce la escritura rápida de «ma» y «man» con 100 ms de diferencia. */
  protected carrera(): void {
    this.busqueda.setValue('ma');
    setTimeout(() => this.busqueda.setValue('man'), 100);
  }

  /** Escribe una palabra letra por letra, con 80 ms entre cada una. */
  protected escribirPalabra(palabra: string): void {
    interval(80)
      .pipe(take(palabra.length), takeUntilDestroyed(this.destroyRef))
      .subscribe((i) => this.busqueda.setValue(palabra.slice(0, i + 1)));
  }

  /** Arma la tubería elegida. Se cancela la anterior para no acumular suscripciones. */
  private armar(): void {
    this.suscripcion?.unsubscribe();
    this.registro.reiniciar([
      'Pulsaciones · valueChanges',
      this.modo() === 'completo' ? 'Tras debounceTime y distinct' : 'Tras map(trim)',
      'Consultas al servidor',
      'Respuestas',
    ]);

    const texto$ = this.busqueda.valueChanges.pipe(
      tap((v) => {
        this.pulsaciones.update((n) => n + 1);
        this.registro.emitir(0, 'next', v);
      }),
      map((t) => t.trim()),
    );

    // Con menos de MINIMO caracteres la lista se vacía y no se consulta: of([]) emite
    // al instante y llamadas no aumenta. No se usa filter: descartaría el texto corto
    // y la lista anterior quedaría en pantalla al borrar el campo.
    const consulta = (t: string): Observable<Producto[]> => {
      if (t.length < MINIMO) {
        this.buscando.set(false);
        return of([]);
      }
      this.buscando.set(true);
      return defer(() => {
        const id = this.registro.abrirTramo(2, t);
        return this.api.buscar(t).pipe(
          tap((r) => {
            this.registro.cerrarTramo(2, id, 'ok');
            this.registro.emitir(3, 'next', String(r.length));
          }),
          // Si switchMap cancela la consulta antes de la respuesta, finalize la marca como cancelada.
          finalize(() => this.registro.cerrarTramo(2, id, 'cancelada')),
        );
      });
    };
    const anotarSalida = tap((t: string) => this.registro.emitir(1, 'next', t));

    let flujo$: Observable<Producto[]>;
    switch (this.modo()) {
      case 'merge':
        flujo$ = texto$.pipe(anotarSalida, mergeMap(consulta));
        break;
      case 'switch':
        flujo$ = texto$.pipe(anotarSalida, switchMap(consulta));
        break;
      default:
        flujo$ = texto$.pipe(debounceTime(300), distinctUntilChanged(), anotarSalida, switchMap(consulta));
    }

    this.suscripcion = flujo$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((r) => {
      this.resultados.set(r);
      this.buscando.set(false);
    });
  }
}
