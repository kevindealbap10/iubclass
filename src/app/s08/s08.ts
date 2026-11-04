import { Component } from '@angular/core';
import { EjemploObservableFrio } from './01-observable-frio/observable-frio';
import { EjemploOperadores } from './02-operadores/operadores';
import { EjemploFuga } from './03-fuga/fuga';
import { EjemploBuscador } from './04-buscador/buscador';
import { EjemploPuente } from './05-puente/puente';
import { EjemploSignalForms } from './06-signal-forms/signal-forms';
import { EjemploCreacion } from './07-creacion/creacion';
import { EjemploErrores } from './08-errores/errores';
import { EjemploVidaReal } from './09-vida-real/vida-real';

// =============================================================================
//  S08 · Página de ejemplos · ruta /s08
// -----------------------------------------------------------------------------
//  Reúne los nueve ejemplos de la sesión, en el orden de la presentación.
//  Cada tarjeta indica las diapositivas que lo acompañan y el archivo del
//  código. La explicación completa está en el encabezado de cada archivo y en
//  CLASE_S08.md. Los ejemplos usan el inventario de productos; el Taller 07
//  usa otro conjunto de datos a propósito.
// =============================================================================

@Component({
  selector: 'app-s08',
  imports: [
    EjemploObservableFrio, EjemploCreacion, EjemploFuga, EjemploOperadores, EjemploBuscador, EjemploErrores,
    EjemploPuente, EjemploVidaReal, EjemploSignalForms,
  ],
  template: `
    <h2 class="text-2xl font-bold text-slate-900">Sesión S08 · Observables y RxJS</h2>
    <p class="mt-1 text-sm text-slate-500">
      Ejemplos de la sesión. Cada uno indica las diapositivas que lo acompañan y su archivo en src/app/s08/.
    </p>

    <h3 class="bloque">Bloque 1 · Observables</h3>
    <section class="tarjeta">
      <p class="meta">Ejemplo 1 · Diapositivas 6 y 7 · 01-observable-frio/observable-frio.ts</p>
      <h4>Observable frío frente a promesa</h4>
      <app-ejemplo-observable-frio />
    </section>
    <section class="tarjeta">
      <p class="meta">Ejemplo 7 · Diapositivas por asignar · 07-creacion/creacion.ts</p>
      <h4>Creación de observables y los canales next, error y complete</h4>
      <app-ejemplo-creacion />
    </section>
    <section class="tarjeta">
      <p class="meta">Ejemplo 3 · Diapositivas 8 y 9 · 03-fuga/fuga.ts</p>
      <h4>Fuga de memoria y takeUntilDestroyed</h4>
      <app-ejemplo-fuga />
    </section>

    <h3 class="bloque">Bloque 2 · Operadores</h3>
    <section class="tarjeta">
      <p class="meta">Ejemplo 2 · Diapositivas 12 y 13 · 02-operadores/operadores.ts</p>
      <h4>filter, map y toArray en un pipe</h4>
      <app-ejemplo-operadores />
    </section>

    <h3 class="bloque">Bloque 3 · Formularios y búsqueda</h3>
    <section class="tarjeta">
      <p class="meta">Ejemplo 4 · Diapositivas 14, 15, 19 y 20 · 04-buscador/buscador.ts</p>
      <h4>Buscador con valueChanges, debounceTime y switchMap</h4>
      <app-ejemplo-buscador />
    </section>
    <section class="tarjeta">
      <p class="meta">Ejemplo 8 · Diapositivas por asignar · 08-errores/errores.ts</p>
      <h4>Cuando el servidor falla: catchError, retry y finalize</h4>
      <app-ejemplo-errores />
    </section>

    <h3 class="bloque">Bloque 4 · Observable y signal</h3>
    <section class="tarjeta">
      <p class="meta">Ejemplo 5 · Diapositivas 23 y 24 · 05-puente/puente.ts</p>
      <h4>toSignal y toObservable</h4>
      <app-ejemplo-puente />
    </section>
    <section class="tarjeta">
      <p class="meta">Ejemplo 9 · Diapositivas por asignar · 09-vida-real/vida-real.ts</p>
      <h4>Autocompletado, panel de reposición y alta con validación asíncrona</h4>
      <app-ejemplo-vida-real />
    </section>

    <h3 class="bloque">Bloque 5 · Signal Forms</h3>
    <section class="tarjeta">
      <p class="meta">Ejemplo 6 · Diapositivas 27 a 29 · 06-signal-forms/signal-forms.ts</p>
      <h4>El alta de producto con Signal Forms</h4>
      <app-ejemplo-signal-forms />
    </section>
  `,
  styles: `
    .bloque { margin-top: 2rem; font-size: .8rem; font-weight: 800; text-transform: uppercase; letter-spacing: .15em; color: #b45309; }
    .tarjeta { margin-top: .9rem; border: 1px solid #e2e8f0; border-left: 4px solid #1e293b; border-radius: .75rem; background: #fff; padding: 1rem 1.2rem; }
    .meta { font-size: .7rem; font-family: ui-monospace, Consolas, monospace; color: #64748b; }
    h4 { margin: .15rem 0 .7rem; font-size: 1.05rem; font-weight: 700; color: #0f172a; }
  `,
})
export class S08 {}
