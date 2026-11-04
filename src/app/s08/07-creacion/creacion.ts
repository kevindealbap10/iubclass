import { Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subscription, from, fromEvent, interval, of, take, timer } from 'rxjs';
import { INVENTARIO } from '../inventario';
import { Canicas, RegistroCanicas } from '../compartido/canicas';
import { GuiaEjemplo } from '../compartido/ui';

// =============================================================================
//  S08 · EJEMPLO 7 · Creación de observables y los tres canales
//  Diapositivas: por asignar
// -----------------------------------------------------------------------------
//  Qué muestra
//    - Un observable entrega valores por tres canales:
//        next      un valor (cero, uno o muchos)
//        error     un fallo; termina el observable
//        complete  fin normal; termina el observable
//      error y complete son excluyentes: después de uno de los dos no llega nada.
//    - Funciones de creación de RxJS:
//        of(a, b, c)         emite cada argumento. of(INVENTARIO) emite UN valor:
//                            el arreglo completo.
//        from(arreglo)       emite cada elemento del arreglo, uno por uno.
//        timer(ms)           emite 0 una vez, tras ms, y completa.
//        timer(ini, cada)    emite 0, 1, 2... y no completa por sí solo.
//        interval(ms)        emite 0, 1, 2... cada ms; no completa por sí solo.
//        fromEvent(el, ev)   emite cada evento del navegador; no completa nunca.
//      take(n) completa el observable tras n emisiones.
//    - Cada ejecución se suscribe con un observer completo (next, error y
//      complete), se dibuja en su propia línea del diagrama de canicas y se
//      cancela con takeUntilDestroyed. La separación entre canicas es el tiempo
//      real entre emisiones.
//
//  Qué observar (resultados esperados)
//    of(INVENTARIO)            1 next (el arreglo de 14, etiqueta [14]) · complete
//    from(INVENTARIO)          14 next (Mango ... Maíz) · complete, todos juntos
//    of(1800, 1200, 6500)      3 next · complete
//    timer(1000)               1 next (0) a 1 s · complete
//    timer(500, 1000), take(3) 3 next (0, 1, 2) a 0,5 s, 1,5 s y 2,5 s · complete
//    interval(1000), take(3)   3 next (0, 1, 2) a 1 s, 2 s y 3 s · complete a los 3 s
//    fromEvent (clics)         1 next por clic; nunca hay complete: «Dejar de escuchar» cancela
//    Observable que falla      2 next (1800, 1200) · error (cruz) · NO hay complete
//    El texto bajo cada línea resume cuántos next llegaron y cómo terminó.
//
//  Qué error previene
//    - Confundir of(arreglo) con from(arreglo): un valor frente a catorce.
//    - Esperar un complete de interval, timer con periodo o fromEvent: son
//      infinitos y hay que cancelarlos o limitarlos con take o con
//      takeUntilDestroyed.
//    - Esperar un complete después de un error.
//
//  En su proyecto
//    - Elegir la función de creación según la fuente: un listado que ya está en
//      memoria (from), un valor único (of), un refresco periódico (timer o
//      interval) o un evento de la pantalla (fromEvent).
// =============================================================================

@Component({
  selector: 'app-ejemplo-creacion',
  imports: [Canicas, GuiaEjemplo],
  template: `
    <app-guia-ejemplo
      [observar]="[
        'of(INVENTARIO) dibuja una canica con el arreglo [14]; from(INVENTARIO) dibuja catorce canicas.',
        'interval y timer con periodo no terminan solos: aquí se limitan con take(3).',
        'El observable que falla termina con una cruz y sin barra de complete.'
      ]"
      proyecto="Elegir la función de creación según la fuente: listado en memoria (from), valor único (of), refresco periódico (timer o interval) o evento de la pantalla (fromEvent)." />

    <div class="botones">
      <button (click)="ejecutar('of(INVENTARIO)', crearOf())">of(INVENTARIO)</button>
      <button (click)="ejecutar('from(INVENTARIO)', crearFrom())">from(INVENTARIO)</button>
      <button (click)="ejecutar('of(1800, 1200, 6500)', crearOfPrecios())">of(1800, 1200, 6500)</button>
      <button (click)="ejecutar('timer(1000)', crearTimer())">timer(1000)</button>
      <button (click)="ejecutar('timer(500, 1000), take(3)', crearTimerPeriodo())">timer(500, 1000), take(3)</button>
      <button (click)="ejecutar('interval(1000), take(3)', crearInterval())">interval(1000), take(3)</button>
      <button (click)="ejecutar('Observable que falla', crearQueFalla())">Observable que falla</button>
    </div>

    <div class="botones eventos">
      <button #objetivo class="objetivo">Objetivo del clic</button>
      <button (click)="escucharClics()" [disabled]="escuchando()">Escuchar clics (fromEvent)</button>
      <button (click)="dejarDeEscuchar()" [disabled]="!escuchando()">Dejar de escuchar</button>
      <button class="sec" (click)="limpiar()">Limpiar</button>
    </div>

    @if (registro.filas().length === 0) {
      <p class="vacio">Sin líneas de tiempo. Pulse uno de los botones.</p>
    }
    <app-canicas [registro]="registro" [ventana]="3200" />

    @if (resumenes().length) {
      <ul class="resumenes">
        @for (r of resumenes(); track $index) { <li>{{ r }}</li> }
      </ul>
    }
  `,
  styles: `
    .botones { display: flex; flex-wrap: wrap; gap: .5rem; }
    .eventos { margin-top: .6rem; }
    button { border-radius: .4rem; background: #1e293b; color: #fff; padding: .35rem .8rem; font-size: .85rem; }
    button.sec { background: #e2e8f0; color: #0f172a; }
    button.objetivo { background: #2563eb; }
    button:disabled { opacity: .4; }
    .vacio { margin: .8rem 0; font-size: .85rem; color: #64748b; font-style: italic; }
    .resumenes { margin: .4rem 0 0; padding-left: 1.1rem; list-style: disc; font-size: .8rem; color: #334155; }
  `,
})
export class EjemploCreacion {
  private readonly destroyRef = inject(DestroyRef);
  private readonly objetivo = viewChild.required<ElementRef<HTMLButtonElement>>('objetivo');

  protected readonly registro = new RegistroCanicas('porFila');
  protected readonly resumenes = signal<string[]>([]);
  protected readonly escuchando = signal(false);
  private suscripcionClics?: Subscription;

  protected limpiar(): void {
    this.suscripcionClics?.unsubscribe();
    this.escuchando.set(false);
    this.registro.reiniciar();
    this.resumenes.set([]);
  }

  // ---- creación -------------------------------------------------------------
  protected crearOf(): Observable<unknown> {
    // of(INVENTARIO): un solo valor, el arreglo completo.
    return of(INVENTARIO);
  }

  protected crearFrom(): Observable<unknown> {
    // from(INVENTARIO): un valor por cada elemento del arreglo.
    return from(INVENTARIO);
  }

  protected crearOfPrecios(): Observable<unknown> {
    return of(INVENTARIO[0].precio, INVENTARIO[1].precio, INVENTARIO[2].precio);
  }

  protected crearTimer(): Observable<unknown> {
    return timer(1000);
  }

  protected crearTimerPeriodo(): Observable<unknown> {
    return timer(500, 1000).pipe(take(3));
  }

  protected crearInterval(): Observable<unknown> {
    return interval(1000).pipe(take(3));
  }

  protected crearQueFalla(): Observable<unknown> {
    return new Observable<number>((observador) => {
      observador.next(INVENTARIO[0].precio);
      observador.next(INVENTARIO[1].precio);
      observador.error(new Error('Fallo simulado'));
      // Esta línea no tiene efecto: después de error no llega nada más.
      observador.complete();
    });
  }

  // ---- suscripción con observer completo -----------------------------------
  protected ejecutar(titulo: string, fuente$: Observable<unknown>): void {
    const fila = this.registro.filaNueva(titulo);
    let nexts = 0;
    fuente$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (valor) => {
        nexts += 1;
        this.registro.emitir(fila, 'next', this.describir(valor));
      },
      error: (e: Error) => {
        this.registro.emitir(fila, 'error', e.message);
        this.resumen(`${titulo}: ${nexts} next y termina con error («${e.message}»). No hay complete.`);
      },
      complete: () => {
        this.registro.emitir(fila, 'complete');
        this.resumen(`${titulo}: ${nexts} next y termina con complete.`);
      },
    });
  }

  private resumen(texto: string): void {
    this.resumenes.update((r) => [...r, texto]);
  }

  /** Etiqueta corta de la canica: el valor, o [n] si es un arreglo. */
  private describir(valor: unknown): string {
    if (Array.isArray(valor)) return `[${valor.length}]`;
    if (typeof valor === 'object' && valor !== null && 'nombre' in valor) return String((valor as { nombre: string }).nombre);
    return String(valor);
  }

  // ---- fromEvent -----------------------------------------------------------
  protected escucharClics(): void {
    this.escuchando.set(true);
    const fila = this.registro.filaNueva('fromEvent(objetivo, "click")');
    let clics = 0;
    this.suscripcionClics = fromEvent<MouseEvent>(this.objetivo().nativeElement, 'click')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        clics += 1;
        this.registro.emitir(fila, 'next', `c${clics}`);
      });
  }

  protected dejarDeEscuchar(): void {
    // unsubscribe corta la suscripción sin pasar por complete: no hay barra de complete.
    this.suscripcionClics?.unsubscribe();
    this.escuchando.set(false);
    this.resumen('fromEvent: unsubscribe() cancela la suscripción sin complete; los clics siguientes ya no se registran.');
  }
}
