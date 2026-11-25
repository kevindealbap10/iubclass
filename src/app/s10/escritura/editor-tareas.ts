import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Tarea } from '../tarea';
import { TareasService, mensajeDe } from '../tareas.service';

// =============================================================================
//  S10 · Ejemplo 3 · Escrituras: post, patch y delete · /s10/editor
//  Diapositivas 23 a 25
// -----------------------------------------------------------------------------
//  Qué muestra
//    - La lista local es una signal que se llena con un get (5 tareas).
//    - Agregar: POST /todos/add -> 201 con id 255; se agrega al estado local.
//    - Marcar: PATCH /todos/:id { completed } -> 200; se reemplaza la fila.
//    - Eliminar: DELETE /todos/:id -> 200 con isDeleted: true; se quita la fila.
//    - La bitácora muestra verbo, dirección y resultado de cada petición.
//
//  Qué observar
//    - dummyjson SIMULA las escrituras: responde como si guardara, pero no
//      guarda. Al pulsar «Recargar desde la API» vuelven las 5 originales.
//    - Marcar la tarea 255 recién creada da 404: el servidor nunca la guardó.
// =============================================================================

interface Registro { verbo: string; url: string; resultado: string; ok: boolean; }

@Component({
  selector: 'app-editor-tareas',
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold">Editor de tareas · {{ tareas().length }} en pantalla</h3>
      <button class="rounded border px-3 py-1 text-sm" (click)="cargar()">Recargar desde la API</button>
    </div>

    <form class="mt-3 flex gap-2" [formGroup]="form" (ngSubmit)="agregar()">
      <input [formControl]="texto" class="flex-1 rounded border px-2 py-1" placeholder="Nueva tarea (mínimo 5 caracteres)" />
      <button class="rounded bg-blue-800 px-3 py-1 text-sm font-semibold text-white" [disabled]="texto.invalid">Agregar</button>
    </form>

    <ul class="mt-3 divide-y rounded-lg border bg-white">
      @for (t of tareas(); track t.id) {
        <li class="flex items-center gap-3 px-3 py-2 text-sm">
          <input #casilla type="checkbox" [checked]="t.completed" (change)="marcar(t, casilla)" />
          <span class="w-8 font-mono text-slate-400">{{ t.id }}</span>
          <span class="flex-1" [class.line-through]="t.completed">{{ t.todo }}</span>
          <button class="text-red-700" (click)="eliminar(t)">eliminar</button>
        </li>
      } @empty {
        <li class="px-3 py-2 text-sm text-slate-500">No hay tareas en pantalla.</li>
      }
    </ul>

    <h4 class="mt-4 text-sm font-bold uppercase tracking-wider text-slate-500">Bitácora de peticiones</h4>
    <ol class="mt-1 font-mono text-xs leading-8">
      @for (r of bitacora(); track $index) {
        <li [class.text-red-700]="!r.ok">{{ r.verbo }} {{ r.url }} → {{ r.resultado }}</li>
      }
    </ol>
  `,
})
export class EditorTareas {
  private readonly servicio = inject(TareasService);
  readonly tareas = signal<Tarea[]>([]);
  readonly bitacora = signal<Registro[]>([]);
  readonly texto = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(5)] });
  readonly form = new FormGroup({ texto: this.texto }); // ngSubmit necesita un formGroup

  constructor() { this.cargar(); }

  cargar(): void {
    this.servicio.pagina(5, 0).subscribe({
      next: (p) => { this.tareas.set(p.todos); this.anotar('GET', '/todos?limit=5&skip=0', `200 · ${p.todos.length} tareas`, true); },
      error: (e) => this.anotar('GET', '/todos?limit=5&skip=0', mensajeDe(e), false),
    });
  }

  agregar(): void {
    this.servicio.crear({ todo: this.texto.value, completed: false, userId: 5 }).subscribe({
      next: (t) => {
        this.tareas.update((ts) => [...ts, t]); // el estado local refleja la respuesta
        this.anotar('POST', '/todos/add', `201 · id ${t.id}`, true);
        this.texto.reset();
      },
      error: (e) => this.anotar('POST', '/todos/add', mensajeDe(e), false),
    });
  }

  marcar(t: Tarea, casilla: HTMLInputElement): void {
    this.servicio.marcar(t.id, !t.completed).subscribe({
      next: (r) => {
        this.tareas.update((ts) => ts.map((x) => (x.id === t.id ? { ...x, completed: r.completed } : x)));
        this.anotar('PATCH', `/todos/${t.id}`, `200 · completed ${r.completed}`, true);
      },
      error: (e: HttpErrorResponse) => {
        casilla.checked = t.completed; // el servidor rechazó el cambio: la casilla vuelve a su estado real
        this.anotar('PATCH', `/todos/${t.id}`, `${e.status} · ${mensajeDe(e)}`, false);
      },
    });
  }

  eliminar(t: Tarea): void {
    this.servicio.eliminar(t.id).subscribe({
      next: (r) => {
        this.tareas.update((ts) => ts.filter((x) => x.id !== t.id));
        this.anotar('DELETE', `/todos/${t.id}`, `200 · isDeleted ${r.isDeleted}`, true);
      },
      error: (e: HttpErrorResponse) => this.anotar('DELETE', `/todos/${t.id}`, `${e.status} · ${mensajeDe(e)}`, false),
    });
  }

  private anotar(verbo: string, url: string, resultado: string, ok: boolean): void {
    this.bitacora.update((b) => [{ verbo, url, resultado, ok }, ...b].slice(0, 8));
  }
}
