import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TareasService, mensajeDe } from '../tareas.service';

// =============================================================================
//  S10 · Ejemplo 1 · Lectura con httpResource · /s10/tareas · Diapositivas 17 y 18
// -----------------------------------------------------------------------------
//  Qué muestra
//    - httpResource pide GET /todos?limit=5&skip=N y expone tres estados:
//      isLoading(), hasValue() y error(). No hay subscribe ni switchMap a mano.
//    - Al cambiar la signal «pagina», el recurso vuelve a pedir solo.
//    - computed sobre el valor: cuántas tareas de la página están completas.
//
//  Qué observar
//    - Página 1: tareas 1 a 5, completas 2 de 5. Página 2: 6 a 10, completas 3.
//    - F12 > Red: una petición por cada clic en «Siguiente».
//    - F12 > Red > «Sin conexión» y luego «Recargar»: el recurso pasa a error
//      con status 0 y se muestra el mensaje de mensajeDe().
// =============================================================================

@Component({
  selector: 'app-lista-tareas',
  imports: [RouterLink],
  template: `
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold">Tareas · página {{ pagina() }}@if (recurso.hasValue()) { de {{ paginas() }}}</h3>
      <div class="flex gap-2">
        <button class="boton" (click)="pagina.update((p) => p - 1)" [disabled]="pagina() === 1">Anterior</button>
        <button class="boton" (click)="pagina.update((p) => p + 1)" [disabled]="!recurso.hasValue() || pagina() >= paginas()">Siguiente</button>
        <button class="boton" (click)="recurso.reload()">Recargar</button>
      </div>
    </div>

    @if (recurso.isLoading()) {
      <p class="estado cargando">Cargando tareas…</p>
    } @else if (recurso.error()) {
      <p class="estado error">{{ mensaje() }}</p>
    } @else if (recurso.hasValue()) {
      <p class="mt-2 text-sm text-slate-500">
        {{ recurso.value().total }} tareas en la API · completas en esta página: {{ completas() }} de {{ recurso.value().todos.length }}
      </p>
      <ul class="mt-3 divide-y rounded-lg border bg-white">
        @for (t of recurso.value().todos; track t.id) {
          <li class="flex items-center gap-3 px-3 py-2 text-sm">
            <span class="w-8 font-mono text-slate-400">{{ t.id }}</span>
            <span class="flex-1" [class.line-through]="t.completed">{{ t.todo }}</span>
            <a [routerLink]="['..', 'buscar']" [queryParams]="{ id: t.id }" class="text-blue-700">ver</a>
          </li>
        } @empty {
          <li class="px-3 py-2 text-sm text-slate-500">La página no trae tareas.</li>
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
export class ListaTareas {
  private readonly servicio = inject(TareasService);
  readonly tamano = 5;
  readonly pagina = signal(1);

  // Se crea en el inicializador del campo: es un contexto de inyección.
  readonly recurso = this.servicio.paginaRecurso(this.pagina, this.tamano);

  readonly paginas = computed(() => (this.recurso.hasValue() ? Math.ceil(this.recurso.value().total / this.tamano) : 1));
  readonly completas = computed(() => (this.recurso.hasValue() ? this.recurso.value().todos.filter((t) => t.completed).length : 0));
  readonly mensaje = computed(() => mensajeDe(this.recurso.error()));
}
