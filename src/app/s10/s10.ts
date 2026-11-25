import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { OrigenApi } from './origen-api';

// =============================================================================
//  S10 · Ruta padre · /s10 · HttpClient: conexión con el servidor
// -----------------------------------------------------------------------------
//  Tres vistas, una por bloque de la sesión:
//    /s10/tareas  -> lectura con httpResource y HttpParams (bloque 2)
//    /s10/editor  -> post, patch y delete con estado local (bloque 3)
//    /s10/buscar  -> get por id, 404 y catchError (bloque 4)
//  provideHttpClient(withFetch()) está en app.config.ts (bloque 1).
// =============================================================================

@Component({
  selector: 'app-s10',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <h2 class="text-2xl font-bold text-slate-900">Sesión S10 · HttpClient: conexión con el servidor</h2>
    <div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
      <span class="font-semibold">Origen de los datos:</span>
      <button type="button" class="opcion" [class.activo]="o.origen() === 'simulado'" (click)="o.usar('simulado')">
        dummyjson · simulado
      </button>
      <button type="button" class="opcion" [class.activo]="o.origen() === 'propio'" (click)="o.usar('propio')">
        servidor propio · guarda
      </button>
      <span class="font-mono text-xs text-slate-500">{{ o.base() }}/todos</span>
    </div>
    @if (o.origen() === 'propio') {
      <p class="mt-1 text-xs text-slate-500">
        Requiere <span class="font-mono">npm run api</span> en otra terminal. Si no está corriendo, la lectura muestra el
        error de conexión del bloque 4.
      </p>
    }
    <p class="mt-1 text-sm text-slate-500">Abra F12 &gt; Red para ver cada petición.</p>
    <nav class="mt-4 flex flex-wrap gap-2">
      <a routerLink="tareas" routerLinkActive="activo" class="opcion">1 · Lectura</a>
      <a routerLink="editor" routerLinkActive="activo" class="opcion">2 · Escritura</a>
      <a routerLink="buscar" [queryParams]="{ id: 7 }" routerLinkActive="activo" class="opcion">3 · Buscar y errores</a>
    </nav>
    <section class="mt-4 rounded-xl border-2 border-dashed border-amber-400 bg-white p-5">
      <router-outlet />
    </section>
  `,
  styles: `
    .opcion { border-radius: 9999px; border: 1px solid #cbd5e1; background: #fff; padding: 0.35rem 0.9rem;
      font-size: 0.85rem; font-weight: 600; color: #334155; }
    .activo { background: #1e3a8a; border-color: #1e3a8a; color: #fff; }
  `,
})
export class S10 {
  protected readonly o = inject(OrigenApi);
}
