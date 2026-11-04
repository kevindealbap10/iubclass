import { Component, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, interval } from 'rxjs';
import { GuiaEjemplo, Indicador } from '../compartido/ui';

// =============================================================================
//  S08 · EJEMPLO 3 · Fuga de memoria y takeUntilDestroyed
//  Diapositivas 8 y 9
// -----------------------------------------------------------------------------
//  Qué muestra
//    - interval(1000) emite 0, 1, 2... cada segundo y no termina nunca.
//    - Un componente que se suscribe sin limpiar sigue recibiendo valores
//      después de ser destruido. Esa suscripción abandonada es la fuga.
//    - takeUntilDestroyed() completa la suscripción cuando el componente se
//      destruye. Se llama dentro del constructor (contexto de inyección) o con
//      el DestroyRef como argumento.
//    - ContadorSuscripciones lleva la cuenta global de suscripciones activas:
//      suma al suscribirse y resta cuando la suscripción termina o se cancela.
//
//  Qué observar
//    - Con los dos componentes montados hay 2 suscripciones activas.
//    - Al desmontar el componente SIN limpieza, el contador queda en 1: su
//      suscripción sigue viva. Al montarlo de nuevo sube a 2 y, tras repetir,
//      a 3, 4... Cada montaje agrega una suscripción que nadie detiene.
//    - Al desmontar el componente CON takeUntilDestroyed, el contador baja.
//
//    - Los indicadores separan las suscripciones que corresponden a un
//      componente montado de las que sobran: las sobrantes son la fuga.
//
//  Qué error previene
//    - Suscripciones que se acumulan al navegar entre vistas (diapositiva 8).
//    - Con async pipe o toSignal no hace falta: ambos se limpian solos.
//
//  En su proyecto
//    - Una pantalla con refresco periódico (panel de reposición, tablero de
//      pedidos) que el usuario abre y cierra muchas veces: cada visita no puede
//      dejar un temporizador vivo.
// =============================================================================

@Injectable({ providedIn: 'root' })
export class ContadorSuscripciones {
  private readonly _activas = signal(0);
  readonly activas = this._activas.asReadonly();

  /** Operador a medida: cuenta la suscripción mientras esté viva. */
  contar<T>() {
    return (origen: Observable<T>) =>
      new Observable<T>((suscriptor) => {
        this._activas.update((n) => n + 1);
        const interna = origen.subscribe(suscriptor);
        return () => {
          interna.unsubscribe();
          this._activas.update((n) => n - 1);
        };
      });
  }

  reiniciar(): void {
    this._activas.set(0);
  }
}

@Component({
  selector: 'app-con-fuga',
  template: `<p class="fila rojo">Sin limpieza · segundos recibidos: <strong>{{ segundos() }}</strong></p>`,
  styles: `.fila { padding: .4rem .7rem; border-radius: .4rem; font-size: .9rem; } .rojo { background: #fee2e2; }`,
})
export class ConFuga {
  protected readonly segundos = signal(0);

  constructor() {
    // Sin takeUntilDestroyed: la suscripción sobrevive al componente.
    interval(1000)
      .pipe(inject(ContadorSuscripciones).contar<number>())
      .subscribe((n) => this.segundos.set(n + 1));
  }
}

@Component({
  selector: 'app-sin-fuga',
  template: `<p class="fila verde">Con takeUntilDestroyed · segundos recibidos: <strong>{{ segundos() }}</strong></p>`,
  styles: `.fila { padding: .4rem .7rem; border-radius: .4rem; font-size: .9rem; } .verde { background: #dcfce7; }`,
})
export class SinFuga {
  protected readonly segundos = signal(0);

  constructor() {
    interval(1000)
      .pipe(inject(ContadorSuscripciones).contar<number>(), takeUntilDestroyed())
      .subscribe((n) => this.segundos.set(n + 1));
  }
}

@Component({
  selector: 'app-ejemplo-fuga',
  imports: [ConFuga, SinFuga, GuiaEjemplo, Indicador],
  template: `
    <app-guia-ejemplo
      [observar]="[
        'Desmontar el componente sin limpieza no baja el contador: su suscripción sigue viva.',
        'Cada vez que se monta de nuevo, sube una suscripción más.',
        'Con takeUntilDestroyed, el contador baja al desmontar.'
      ]"
      proyecto="Una pantalla con refresco periódico que el usuario abre y cierra muchas veces no puede dejar un temporizador vivo por cada visita." />

    <div class="indicadores">
      <app-indicador [valor]="cuenta.activas()" rotulo="Suscripciones activas" tono="aviso" />
      <app-indicador [valor]="esperadas()" rotulo="Corresponden a componentes montados" tono="bien" />
      <app-indicador [valor]="sobrantes()" rotulo="Sobrantes (fuga)" [tono]="sobrantes() > 0 ? 'alerta' : 'bien'" />
    </div>

    <div class="botones">
      <button (click)="conFuga.set(!conFuga())">{{ conFuga() ? 'Desmontar' : 'Montar' }} el componente sin limpieza</button>
      <button (click)="sinFuga.set(!sinFuga())">{{ sinFuga() ? 'Desmontar' : 'Montar' }} el componente con limpieza</button>
    </div>

    @if (conFuga()) { <app-con-fuga /> }
    @if (sinFuga()) { <app-sin-fuga /> }
  `,
  styles: `
    .indicadores { display: flex; flex-wrap: wrap; gap: .6rem; margin-bottom: .8rem; }
    .botones { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: .6rem; }
    button { border-radius: .4rem; background: #1e293b; color: #fff; padding: .35rem .8rem; font-size: .85rem; }
  `,
})
export class EjemploFuga {
  protected readonly cuenta = inject(ContadorSuscripciones);
  protected readonly conFuga = signal(true);
  protected readonly sinFuga = signal(true);
  protected readonly esperadas = computed(() => (this.conFuga() ? 1 : 0) + (this.sinFuga() ? 1 : 0));
  protected readonly sobrantes = computed(() => Math.max(0, this.cuenta.activas() - this.esperadas()));
}
