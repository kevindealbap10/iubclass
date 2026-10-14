import { Component } from '@angular/core';
import { EjemploIf } from './control-flujo/ejemplo-if';
import { EjemploFor } from './control-flujo/ejemplo-for';
import { EjemploTrack } from './control-flujo/ejemplo-track';
import { EjemploSwitch } from './control-flujo/ejemplo-switch';
import { EjemploHeredado } from './control-flujo/ejemplo-heredado';
import { EjemploIntegrados } from './pipes/ejemplo-integrados';
import { EjemploPipePropio } from './pipes/ejemplo-pipe-propio';
import { EjemploPipePuro } from './pipes/ejemplo-pipe-puro';
import { EjemploEstilos } from './estilos/ejemplo-estilos';

// =============================================================================
//  S03 · Página de ejemplos · ruta /s03
// -----------------------------------------------------------------------------
//  Reúne los nueve ejemplos de la sesión, en el orden de la presentación. Cada
//  tarjeta indica la diapositiva que la acompaña y el archivo donde está el
//  código. La explicación completa de cada ejemplo está en el comentario de
//  encabezado de su archivo y en CLASE_S03.md.
// =============================================================================

@Component({
  selector: 'app-s03',
  imports: [
    EjemploIf, EjemploFor, EjemploTrack, EjemploSwitch, EjemploHeredado,
    EjemploIntegrados, EjemploPipePropio, EjemploPipePuro, EjemploEstilos,
  ],
  template: `
    <h2 class="text-2xl font-bold text-slate-900">Sesión S03 · Control de flujo, pipes y estilos</h2>
    <p class="mt-1 text-sm text-slate-500">
      Ejemplos de la clase. Cada uno indica la diapositiva que lo acompaña y su archivo en src/app/s03/.
    </p>

    <h3 class="bloque">Bloque 1 · Control de flujo</h3>
    <section class="tarjeta">
      <p class="meta">Ejemplo 1 · Diapositivas 7 y 8 · control-flujo/ejemplo-if.ts</p>
      <h4>&#64;if, &#64;else if, &#64;else y alias</h4>
      <app-ejemplo-if />
    </section>
    <section class="tarjeta">
      <p class="meta">Ejemplo 2 · Diapositivas 9 y 10 · control-flujo/ejemplo-for.ts</p>
      <h4>&#64;for, variables de contexto y &#64;empty</h4>
      <app-ejemplo-for />
    </section>
    <section class="tarjeta">
      <p class="meta">Ejemplo 3 · Diapositiva 11 · control-flujo/ejemplo-track.ts</p>
      <h4>track por posición frente a track por identidad</h4>
      <app-ejemplo-track />
    </section>
    <section class="tarjeta">
      <p class="meta">Ejemplo 4 · Diapositiva 12 · control-flujo/ejemplo-switch.ts</p>
      <h4>&#64;switch con el caso calculado en un computed</h4>
      <app-ejemplo-switch />
    </section>
    <section class="tarjeta">
      <p class="meta">Ejemplo 5 · Diapositiva 13 · control-flujo/ejemplo-heredado.ts</p>
      <h4>Sintaxis anterior: *ngIf y *ngFor</h4>
      <app-ejemplo-heredado />
    </section>

    <h3 class="bloque">Bloque 2 · Pipes</h3>
    <section class="tarjeta">
      <p class="meta">Ejemplo 6 · Diapositivas 19 a 22 · pipes/ejemplo-integrados.ts</p>
      <h4>Pipes integrados con configuración es-CO</h4>
      <app-ejemplo-integrados />
    </section>
    <section class="tarjeta">
      <p class="meta">Ejemplo 7 · Diapositiva 23 · pipes/peso-pipe.ts y pipes/ejemplo-pipe-propio.ts</p>
      <h4>Pipe propio: peso</h4>
      <app-ejemplo-pipe-propio />
    </section>
    <section class="tarjeta">
      <p class="meta">Ejemplo 8 · Diapositiva 24 · pipes/ejemplo-pipe-puro.ts</p>
      <h4>Pipe puro: push frente a update</h4>
      <app-ejemplo-pipe-puro />
    </section>

    <h3 class="bloque">Bloque 3 · Estilos</h3>
    <section class="tarjeta">
      <p class="meta">Ejemplo 9 · Diapositivas 28 a 30 · estilos/ejemplo-estilos.ts</p>
      <h4>Binding de clase y de estilo, y encapsulación</h4>
      <app-ejemplo-estilos />
    </section>
  `,
  styles: `
    .bloque { margin-top: 2rem; font-size: .8rem; font-weight: 800; text-transform: uppercase; letter-spacing: .15em; color: #b45309; }
    .tarjeta { margin-top: .9rem; border: 1px solid #e2e8f0; border-left: 4px solid #1e293b; border-radius: .75rem; background: #fff; padding: 1rem 1.2rem; }
    .meta { font-size: .7rem; font-family: ui-monospace, Consolas, monospace; color: #64748b; }
    h4 { margin: .15rem 0 .7rem; font-size: 1.05rem; font-weight: 700; color: #0f172a; }
  `,
})
export class S03 {}
