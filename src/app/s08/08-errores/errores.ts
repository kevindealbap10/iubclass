import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Observable, Subscription, catchError, debounceTime, defer, distinctUntilChanged, finalize, map, of, retry, switchMap, tap,
} from 'rxjs';
import { MINIMO, Producto, ProductoApi } from '../inventario';
import { Canicas, RegistroCanicas } from '../compartido/canicas';
import { Cargando, GuiaEjemplo, Indicador, TarjetaProducto } from '../compartido/ui';

// =============================================================================
//  S08 · EJEMPLO 8 · Cuando el servidor falla: catchError, retry y finalize
//  Diapositivas: por asignar
// -----------------------------------------------------------------------------
//  Qué muestra
//    - Un error en un observable termina el observable. En una tubería de
//      búsqueda eso significa que, tras el primer fallo del servidor, la
//      tubería entera queda terminada y el campo deja de responder.
//    - catchError se escribe DENTRO del switchMap, sobre el observable de la
//      consulta: captura el fallo de esa consulta, devuelve of([]) y la tubería
//      externa sigue viva. Escrito fuera del switchMap, la tubería ya murió.
//    - retry(n) vuelve a suscribirse a la consulta hasta n veces más antes de
//      dejar pasar el error.
//    - finalize se ejecuta al terminar o cancelarse la consulta, con éxito o con
//      error: es el lugar para apagar el indicador «Buscando…».
//    - El servicio inestable (ProductoApi.buscarInestable) no cuenta en la señal
//      llamadas de los demás ejemplos. Textos especiales:
//        error          falla siempre con «Error de red simulado» (150 ms)
//        intermitente   falla las dos primeras veces y luego devuelve las frutas
//        otro texto     se comporta como el buscador normal
//    - El diagrama de canicas dibuja cada intento como una barra: verde si el
//      servidor respondió, con cruz roja si falló.
//
//  Qué observar (resultados esperados)
//    Tubería «Sin manejo»
//      mango          1 fila (Mango) · intentos 1 · tubería activa
//      error          tubería terminada con error (cruz en la línea de resultado) ·
//                     «Buscando…» queda encendido · aviso oscuro «Error sin manejar»
//      mango          no ocurre nada: la tubería ya no responde
//    Tubería «catchError dentro de switchMap»
//      error          aviso rojo «No se pudo consultar» · 0 filas · intentos 1
//      mango          1 fila: la tubería sigue viva
//    Tubería «retry(2) y catchError»
//      error          3 intentos (1 más 2 reintentos, tres cruces) · aviso · 0 filas
//      intermitente   3 intentos (dos cruces y una barra verde) · 5 filas (Mango,
//                     Guayaba, Patilla, Papaya, Banano) · sin aviso
//      mango          1 intento · 1 fila
//    Con catchError y retry, finalize apaga «Buscando…» en los tres casos.
//
//  Qué error previene
//    - Un buscador que se queda mudo después del primer error de red.
//    - catchError fuera del switchMap, que no salva a la tubería.
//    - Un indicador «Buscando…» que queda encendido para siempre.
//    - retry sin límite: un servidor caído recibe peticiones sin fin.
//
//  En su proyecto
//    - Cualquier pantalla que consulta un servidor: un fallo de red debe mostrar
//      un aviso y dejar la pantalla funcionando, no dejarla muda.
// =============================================================================

type Modo = 'sin' | 'catch' | 'retry';

@Component({
  selector: 'app-ejemplo-errores',
  imports: [ReactiveFormsModule, Canicas, Cargando, GuiaEjemplo, Indicador, TarjetaProducto],
  template: `
    <app-guia-ejemplo
      [observar]="[
        'Sin manejo: tras escribir «error» la tubería termina (cruz), «Buscando…» queda encendido y «mango» ya no responde.',
        'Con catchError dentro de switchMap: aparece el aviso, la tabla queda vacía y «mango» sí responde.',
        'Con retry(2): tres intentos para «error» (tres cruces) y, para «intermitente», dos cruces y una barra verde.'
      ]"
      proyecto="Un fallo de red en cualquier pantalla que consulta un servidor debe mostrar un aviso y dejar la pantalla funcionando, no dejarla muda." />

    <div class="modo">
      <label>
        Tubería
        <select [value]="modo()" (change)="cambiarModo($any($event.target).value)">
          <option value="sin">Sin manejo de errores</option>
          <option value="catch">catchError dentro de switchMap</option>
          <option value="retry">retry(2) y catchError</option>
        </select>
      </label>
      <button (click)="escribir('mango')">Escribir «mango»</button>
      <button (click)="escribir('error')">Escribir «error»</button>
      <button (click)="escribir('intermitente')">Escribir «intermitente»</button>
      <button class="sec" (click)="cambiarModo(modo())">Reiniciar</button>
    </div>

    <label class="campo">
      Buscar producto
      <input [formControl]="busqueda" placeholder="mango, error o intermitente" autocomplete="off" />
    </label>

    <div class="indicadores">
      <app-indicador [valor]="tuberia()" rotulo="Estado de la tubería" [tono]="tuberia() === 'activa' ? 'bien' : 'alerta'" />
      <app-indicador [valor]="intentos()" rotulo="Intentos de la última consulta" tono="aviso" />
      <app-indicador [valor]="resultados().length" rotulo="Filas mostradas" />
    </div>

    @if (mensaje()) {
      <div [class]="'toast ' + (tuberia() === 'activa' ? 'manejado' : 'grave')" role="alert">
        <strong>{{ tuberia() === 'activa' ? 'Aviso' : 'Error' }}</strong> {{ mensaje() }}
      </div>
    }
    @if (buscando()) { <app-cargando texto="Buscando…" /> }

    <app-canicas [registro]="registro" [ventana]="1200" />

    <div class="cuadricula">
      @for (p of resultados(); track p.id) {
        <app-producto [producto]="p" [resaltar]="busqueda.value" />
      } @empty {
        <p class="vacio">Sin resultados.</p>
      }
    </div>
  `,
  styles: `
    .modo { display: flex; flex-wrap: wrap; gap: .6rem; align-items: end; margin-bottom: .8rem; font-size: .85rem; }
    select, input { border: 1px solid #cbd5e1; border-radius: .4rem; padding: .3rem .5rem; font-size: .9rem; display: block; }
    .campo { display: block; font-size: .85rem; font-weight: 600; }
    .campo input { width: 18rem; margin-top: .2rem; }
    button { border-radius: .4rem; background: #1e293b; color: #fff; padding: .4rem .8rem; font-size: .85rem; }
    button.sec { background: #e2e8f0; color: #0f172a; }
    .indicadores { display: flex; flex-wrap: wrap; gap: .6rem; margin: .8rem 0; }
    .toast { margin: .6rem 0; padding: .55rem .8rem; border-radius: .5rem; font-size: .85rem; animation: entra .25s ease-out; }
    .toast.manejado { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
    .toast.grave { background: #7f1d1d; color: #fff; }
    @keyframes entra { from { transform: translateY(-6px); opacity: 0; } to { transform: none; opacity: 1; } }
    .cuadricula { display: grid; grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr)); gap: .6rem; }
    .vacio { grid-column: 1 / -1; padding: 1rem; border: 1px dashed #cbd5e1; border-radius: .5rem; color: #64748b; font-size: .85rem; }
  `,
})
export class EjemploErrores {
  private readonly api = inject(ProductoApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly busqueda = new FormControl('', { nonNullable: true });
  protected readonly modo = signal<Modo>('catch');
  protected readonly resultados = signal<Producto[]>([]);
  protected readonly buscando = signal(false);
  protected readonly mensaje = signal('');
  protected readonly tuberia = signal<'activa' | 'terminada con error'>('activa');
  protected readonly intentos = signal(0);
  protected readonly registro = new RegistroCanicas('compartido', ['Texto que llega a switchMap', 'Intentos al servidor', 'Resultado']);

  private suscripcion?: Subscription;

  constructor() {
    this.armar();
  }

  protected escribir(texto: string): void {
    this.busqueda.setValue(texto);
  }

  protected cambiarModo(valor: Modo): void {
    this.modo.set(valor);
    this.busqueda.setValue('', { emitEvent: false });
    this.resultados.set([]);
    this.buscando.set(false);
    this.mensaje.set('');
    this.tuberia.set('activa');
    this.intentos.set(0);
    this.api.reiniciarInestable();
    this.registro.reiniciar();
    this.armar();
  }

  /** Consulta al servidor inestable, con el manejo que elige el modo. */
  private consultar(t: string): Observable<Producto[]> {
    this.mensaje.set('');
    // El diagrama muestra solo la última consulta, para que los intentos se vean separados.
    this.registro.reiniciar();
    this.registro.emitir(0, 'next', t);
    if (t.length < MINIMO) {
      this.buscando.set(false);
      this.intentos.set(0);
      return of([]);
    }
    this.buscando.set(true);
    let intentos = 0;
    // defer cuenta cada suscripción al servidor: con retry hay una por intento.
    const fuente$ = defer(() => {
      intentos += 1;
      this.intentos.set(intentos);
      const id = this.registro.abrirTramo(1, `${t} (${intentos})`);
      return this.api.buscarInestable(t).pipe(
        tap({
          next: () => this.registro.cerrarTramo(1, id, 'ok'),
          error: () => this.registro.cerrarTramo(1, id, 'error'),
        }),
        finalize(() => this.registro.cerrarTramo(1, id, 'cancelada')),
      );
    });
    const fallar = (e: Error): Observable<Producto[]> => {
      this.mensaje.set(`No se pudo consultar «${t}»: ${e.message} (${intentos} ${intentos === 1 ? 'intento' : 'intentos'}).`);
      return of([]);
    };
    switch (this.modo()) {
      case 'catch':
        return fuente$.pipe(catchError(fallar), finalize(() => this.buscando.set(false)));
      case 'retry':
        return fuente$.pipe(retry(2), catchError(fallar), finalize(() => this.buscando.set(false)));
      default:
        // Sin catchError ni finalize: el error atraviesa el switchMap y termina la tubería.
        return fuente$;
    }
  }

  private armar(): void {
    this.suscripcion?.unsubscribe();
    this.suscripcion = this.busqueda.valueChanges
      .pipe(
        map((t) => t.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        // La consulta se arma dentro del switchMap: allí se coloca catchError.
        switchMap((t) => this.consultar(t)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (filas) => {
          this.resultados.set(filas);
          this.registro.emitir(2, 'next', String(filas.length));
          if (this.modo() === 'sin') this.buscando.set(false);
        },
        error: (e: Error) => {
          // La tubería terminó. «Buscando…» no se apaga porque no hay finalize.
          this.tuberia.set('terminada con error');
          this.registro.emitir(2, 'error', e.message);
          this.mensaje.set(`Error sin manejar: ${e.message}. La tubería terminó y el campo ya no responde.`);
        },
      });
  }
}
