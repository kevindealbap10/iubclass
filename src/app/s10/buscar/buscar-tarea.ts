import { Component, effect, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Tarea } from '../tarea';
import { TareasService } from '../tareas.service';

// =============================================================================
//  S10 · Ejemplo 2 · get por id y manejo de errores · /s10/buscar?id=7
//  Diapositivas 29 y 30
// -----------------------------------------------------------------------------
//  Qué muestra
//    - get<Tarea> clásico con subscribe({ next, error }).
//    - El servicio aplica catchError y entrega un Error con texto legible:
//      el componente no conoce status ni HttpErrorResponse.
//    - El id viaja en la dirección (?id=), como en la S09.
//
//  Qué observar
//    - ?id=7   -> «Solve a Rubik's cube», completa.
//    - ?id=9999 -> 404 y el mensaje «No existe el registro solicitado (Todo with id '9999' not found).»
//    - Mientras llega la respuesta se muestra «Buscando…»: nunca una pantalla vacía.
// =============================================================================

@Component({
  selector: 'app-buscar-tarea',
  imports: [ReactiveFormsModule],
  template: `
    <h3 class="text-lg font-bold">Buscar una tarea por código</h3>
    <form class="mt-3 flex gap-2" [formGroup]="form" (ngSubmit)="ir()">
      <input type="number" [formControl]="codigo" class="w-32 rounded border px-2 py-1" placeholder="código" />
      <button class="rounded bg-blue-800 px-3 py-1 text-sm font-semibold text-white" [disabled]="codigo.invalid">Buscar</button>
    </form>

    @if (buscando()) {
      <p class="mt-3 rounded bg-blue-50 px-3 py-2 text-sm text-blue-900">Buscando…</p>
    } @else if (error()) {
      <p class="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-800">{{ error() }}</p>
    } @else if (tarea(); as t) {
      <div class="mt-3 rounded-lg border bg-white p-4 text-sm">
        <p class="font-mono text-slate-400">GET /todos/{{ t.id }} · 200</p>
        <p class="mt-1 text-base font-semibold">{{ t.todo }}</p>
        <p class="mt-1">{{ t.completed ? 'Completa' : 'Pendiente' }} · usuario {{ t.userId }}</p>
      </div>
    }
  `,
})
export class BuscarTarea {
  private readonly servicio = inject(TareasService);
  private readonly router = inject(Router);

  readonly id = input<string>(); // ?id= llega aquí por withComponentInputBinding (S09)
  readonly codigo = new FormControl<number | null>(null, [Validators.required, Validators.min(1)]);
  readonly form = new FormGroup({ codigo: this.codigo });

  readonly tarea = signal<Tarea | null>(null);
  readonly error = signal('');
  readonly buscando = signal(false);

  constructor() {
    // Cada vez que cambia ?id= en la dirección, se hace la petición.
    effect(() => {
      const id = Number(this.id());
      if (!id) return;
      this.codigo.setValue(id);
      this.buscando.set(true);
      this.error.set('');
      this.servicio.porId(id).subscribe({
        next: (t) => { this.tarea.set(t); this.buscando.set(false); },
        error: (e: Error) => { this.tarea.set(null); this.error.set(e.message); this.buscando.set(false); },
      });
    });
  }

  ir(): void {
    this.router.navigate(['/s10/buscar'], { queryParams: { id: this.codigo.value } });
  }
}
