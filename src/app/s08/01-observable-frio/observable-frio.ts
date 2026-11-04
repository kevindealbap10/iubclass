import { Component, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { INVENTARIO, pesos } from '../inventario';
import { Canicas, RegistroCanicas } from '../compartido/canicas';
import { GuiaEjemplo, Indicador } from '../compartido/ui';

// =============================================================================
//  S08 · EJEMPLO 1 · Observable frío frente a promesa
//  Diapositivas 6 y 7
// -----------------------------------------------------------------------------
//  Qué muestra
//    - Una promesa es ansiosa: su función ejecutora corre al crearla, aunque
//      nadie la espere, y entrega un solo valor una sola vez.
//    - Un Observable es frío: su función de suscripción no corre al crearlo.
//      Corre una vez por cada suscriptor, y cada uno recibe la secuencia
//      completa desde el principio.
//    - Los tres valores son los precios de Mango, Guayaba y Patilla. El
//      observable los emite cada 500 ms para que el diagrama de canicas muestre
//      el tiempo entre una emisión y otra.
//
//  Qué observar
//    - «Crear promesa» dibuja una canica de inmediato, sin ningún then.
//    - «Crear observable» no dibuja nada: se creó y no ocurrió nada.
//    - «Suscriptor A» y «Suscriptor B» ejecutan la función de suscripción cada
//      uno y reciben 1800, 1200 y 6500, con un complete al final. Dos
//      suscriptores, dos ejecuciones, dos líneas completas.
//    - Sin suscribirse no hay valores, aunque el observable exista.
//    - Los indicadores cuentan las ejecuciones: la promesa corre 1 vez al
//      crearla; el observable, 0 al crearlo y 1 por cada suscripción.
//
//  Qué error previene
//    - Escribir una consulta con un Observable y esperar que se ejecute sola
//      (diapositiva 7). Sin subscribe, o sin el pipe async, no ocurre nada.
//
//  En su proyecto
//    - Una consulta al servidor es un observable frío: no sale ninguna petición
//      hasta que alguien se suscribe, y cada suscripción envía la suya.
// =============================================================================

@Component({
  selector: 'app-ejemplo-observable-frio',
  imports: [Canicas, GuiaEjemplo, Indicador],
  template: `
    <app-guia-ejemplo
      [observar]="[
        'La promesa dibuja su canica al crearse; el observable no dibuja nada hasta que alguien se suscribe.',
        'Cada suscriptor recorre la secuencia completa: 1800, 1200, 6500 y complete.',
        'Los indicadores cuentan cuántas veces corrió cada función.'
      ]"
      proyecto="Una consulta al servidor es un observable frío: no sale ninguna petición hasta el subscribe, y cada subscribe envía la suya." />

    <div class="botones">
      <button (click)="crearPromesa()">Crear promesa</button>
      <button (click)="crearObservable()">Crear observable</button>
      <button (click)="suscribir('A')" [disabled]="!precios$">Suscriptor A</button>
      <button (click)="suscribir('B')" [disabled]="!precios$">Suscriptor B</button>
      <button class="sec" (click)="reiniciar()">Reiniciar</button>
    </div>

    <div class="indicadores">
      <app-indicador [valor]="ejecucionesPromesa()" rotulo="Ejecuciones de la promesa" />
      <app-indicador [valor]="ejecucionesObservable()" rotulo="Ejecuciones del observable" tono="aviso" />
      <app-indicador [valor]="precios$ ? 'creado' : 'sin crear'" rotulo="Estado del observable" />
    </div>

    @if (registro.filas().length === 0) {
      <p class="vacio">Sin líneas de tiempo. Pulse «Crear promesa» o «Crear observable» y luego un suscriptor.</p>
    }
    <app-canicas [registro]="registro" [ventana]="2500" />

    <details>
      <summary>Registro en texto</summary>
      <ol class="registro" aria-label="Registro de eventos">
        @for (linea of lineas(); track $index) { <li>{{ linea }}</li> }
      </ol>
    </details>
  `,
  styles: `
    .botones { display: flex; flex-wrap: wrap; gap: .5rem; }
    button { border-radius: .4rem; background: #1e293b; color: #fff; padding: .35rem .8rem; font-size: .85rem; }
    button.sec { background: #e2e8f0; color: #0f172a; }
    button:disabled { opacity: .4; }
    .indicadores { display: flex; flex-wrap: wrap; gap: .6rem; margin: .8rem 0 .2rem; }
    .vacio { margin: .8rem 0; font-size: .85rem; color: #64748b; font-style: italic; }
    details { margin-top: .5rem; font-size: .8rem; }
    summary { cursor: pointer; color: #475569; }
    .registro { margin-top: .4rem; padding: .6rem 1rem .6rem 2rem; background: #0f172a; color: #e2e8f0;
      border-radius: .5rem; font: .8rem/1.5 ui-monospace, Consolas, monospace; list-style: decimal; }
  `,
})
export class EjemploObservableFrio {
  protected readonly lineas = signal<string[]>([]);
  protected readonly registro = new RegistroCanicas('porFila');
  protected readonly ejecucionesPromesa = signal(0);
  protected readonly ejecucionesObservable = signal(0);
  protected precios$?: Observable<number>;

  private anotar(texto: string): void {
    this.lineas.update((r) => [...r, texto]);
  }

  protected reiniciar(): void {
    this.lineas.set([]);
    this.registro.reiniciar();
    this.ejecucionesPromesa.set(0);
    this.ejecucionesObservable.set(0);
    this.precios$ = undefined;
  }

  protected crearPromesa(): void {
    const fila = this.registro.filaNueva('Promesa · new Promise');
    // El ejecutor corre aquí, al crear la promesa, sin esperar a ningún then.
    const promesa = new Promise<number>((resolver) => {
      this.ejecucionesPromesa.update((n) => n + 1);
      this.anotar('Promesa · el ejecutor corre al crearla');
      resolver(INVENTARIO[0].precio);
    });
    this.registro.emitir(fila, 'next', String(INVENTARIO[0].precio));
    promesa.then((v) => this.anotar(`Promesa · then recibe ${pesos(v)}, un solo valor`));
  }

  protected crearObservable(): void {
    // Crear el Observable solo guarda la función. Nada se ejecuta todavía.
    this.precios$ = new Observable<number>((suscriptor) => {
      this.ejecucionesObservable.update((n) => n + 1);
      this.anotar('Observable · la función de suscripción corre ahora');
      const precios = INVENTARIO.slice(0, 3).map((p) => p.precio);
      const temporizadores = precios.map((precio, i) => setTimeout(() => suscriptor.next(precio), 500 * i));
      temporizadores.push(setTimeout(() => suscriptor.complete(), 500 * precios.length));
      // Función de limpieza: se ejecuta al cancelar o al completar.
      return () => temporizadores.forEach(clearTimeout);
    });
    this.anotar('Observable · creado. No ocurre nada hasta que alguien se suscribe');
  }

  protected suscribir(nombre: string): void {
    const fila = this.registro.filaNueva(`Observable · suscriptor ${nombre}`);
    this.precios$?.subscribe({
      next: (v) => {
        this.registro.emitir(fila, 'next', String(v));
        this.anotar(`Suscriptor ${nombre} · recibe ${v}`);
      },
      complete: () => {
        this.registro.emitir(fila, 'complete');
        this.anotar(`Suscriptor ${nombre} · complete`);
      },
    });
  }
}
