import { Component, computed, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { OrigenApi } from '../../s10/origen-api';
import { PaginaTareas } from '../../s10/tarea';

// =============================================================================
//  S11 · Ejemplo 3 · Datos protegidos con canMatch · /s11/tareas · Diapositivas 22 y 23
// -----------------------------------------------------------------------------
//  Qué muestra
//    - La ruta usa canMatch: [autenticadoMatch]. Sin sesión, la ruta no coincide y el
//      archivo de este componente NI SIQUIERA SE DESCARGA (F12 > Red > JS).
//    - Lee GET /auth/todos?limit=5&skip=N: la misma lista pública de la S10, pero por
//      la ruta /auth/, que exige el token. Sin interceptor, esta petición da 401.
//
//  Qué observar
//    - Con sesión: 254 tareas, página 1 con 2 completas (los mismos datos de /s10/tareas).
//    - En otra pestaña, http://localhost:4200/api/auth/todos (servidor propio):
//      401 «Access Token is required». El guard protege la vista; el servidor protege los datos.
// =============================================================================

@Component({
  selector: 'app-s11-tareas',
  template: `
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold">Tareas · GET /auth/todos · página {{ pagina() }}</h3>
      <div class="flex gap-2">
        <button class="boton" (click)="pagina.update((p) => p - 1)" [disabled]="pagina() === 1">Anterior</button>
        <button class="boton" (click)="pagina.update((p) => p + 1)">Siguiente</button>
      </div>
    </div>
    @if (recurso.isLoading()) {
      <p class="estado cargando">Cargando…</p>
    } @else if (recurso.error()) {
      <p class="estado error">No se pudieron leer las tareas protegidas.</p>
    } @else if (recurso.hasValue()) {
      <p class="mt-2 text-sm text-slate-500">{{ recurso.value().total }} tareas · completas en esta página: {{ completas() }}</p>
      <ul class="mt-3 divide-y rounded-lg border bg-white">
        @for (t of recurso.value().todos; track t.id) {
          <li class="flex gap-3 px-3 py-2 text-sm">
            <span class="w-8 font-mono text-slate-400">{{ t.id }}</span>
            <span [class.line-through]="t.completed">{{ t.todo }}</span>
          </li>
        }
      </ul>
    }
  `,
  styles: `
    .boton { border: 1px solid #cbd5e1; border-radius: .5rem; padding: .25rem .7rem; font-size: .85rem; background: #fff; }
    .boton:disabled { opacity: .4; }
    .estado { margin-top: .75rem; border-radius: .5rem; padding: .6rem .8rem; font-size: .9rem; }
    .cargando { background: #eff6ff; color: #1e3a8a; }
    .error { background: #fef2f2; color: #991b1b; }
  `,
})
export class TareasProtegidas {
  private readonly origen = inject(OrigenApi);
  readonly pagina = signal(1);
  readonly recurso = httpResource<PaginaTareas>(() => ({
    url: `${this.origen.base()}/auth/todos`,
    params: { limit: 5, skip: (this.pagina() - 1) * 5 },
  }));
  readonly completas = computed(() => (this.recurso.hasValue() ? this.recurso.value().todos.filter((t) => t.completed).length : 0));
}
