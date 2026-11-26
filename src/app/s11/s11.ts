import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { OrigenApi } from '../s10/origen-api';
import { Bitacora } from './interceptores';
import { SesionService } from './sesion.service';

// =============================================================================
//  S11 · Ruta padre · /s11 · Interceptores, rutas protegidas y despliegue
// -----------------------------------------------------------------------------
//    /s11/login   -> formulario reactivo de inicio de sesión            (pública)
//    /s11/perfil  -> GET /auth/me                                        (canActivate)
//    /s11/tareas  -> GET /auth/todos                                     (canMatch)
//  Los interceptores están registrados en app.config.ts y la bitácora de abajo
//  la escribe registroInterceptor: una línea por petición, de cualquier vista.
//  El selector de origen es el mismo de la S10 (OrigenApi).
// =============================================================================

@Component({
  selector: 'app-s11',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <h2 class="text-2xl font-bold text-slate-900">Sesión S11 · Interceptores, rutas protegidas y despliegue</h2>
    <div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
      <span class="font-semibold">Origen:</span>
      <button type="button" class="opcion" [class.activo]="o.origen() === 'simulado'" (click)="cambiar('simulado')">dummyjson</button>
      <button type="button" class="opcion" [class.activo]="o.origen() === 'propio'" (click)="cambiar('propio')">servidor propio</button>
      <span class="font-mono text-xs text-slate-500">{{ o.base() }}/auth/…</span>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-slate-100 px-4 py-2 text-sm">
      @if (sesion.usuario(); as u) {
        <span>Sesión de <strong>{{ u.firstName }} {{ u.lastName }}</strong> ({{ u.username }})</span>
        <button type="button" class="opcion" (click)="salir()">Cerrar sesión</button>
      } @else {
        <span class="text-slate-500">Sin sesión iniciada</span>
      }
    </div>

    <nav class="mt-4 flex flex-wrap gap-2">
      <a routerLink="login" routerLinkActive="activo" class="opcion">1 · Login</a>
      <a routerLink="perfil" routerLinkActive="activo" class="opcion">2 · Perfil (canActivate)</a>
      <a routerLink="tareas" routerLinkActive="activo" class="opcion">3 · Tareas (canMatch)</a>
    </nav>
    <section class="mt-4 rounded-xl border-2 border-dashed border-cyan-500 bg-white p-5">
      <router-outlet />
    </section>

    <h3 class="mt-6 text-sm font-semibold text-slate-600">Bitácora de registroInterceptor</h3>
    <ol class="mt-1 rounded-lg bg-slate-900 p-3 font-mono text-xs leading-6 text-slate-100">
      @for (l of bitacora.lineas(); track $index) {
        <li>{{ l }}</li>
      } @empty {
        <li class="text-slate-400">Todavía no hay peticiones.</li>
      }
    </ol>
  `,
  styles: `
    .opcion { border-radius: 9999px; border: 1px solid #cbd5e1; background: #fff; padding: 0.35rem 0.9rem;
      font-size: 0.85rem; font-weight: 600; color: #334155; }
    .activo { background: #0e7490; border-color: #0e7490; color: #fff; }
  `,
})
export class S11 {
  protected readonly o = inject(OrigenApi);
  protected readonly sesion = inject(SesionService);
  protected readonly bitacora = inject(Bitacora);
  private readonly router = inject(Router);

  salir(): void {
    this.sesion.cerrar();
    this.router.navigate(['/s11/login']);
  }

  /** Un token emitido por un servidor no vale en el otro: al cambiar de origen se cierra la sesión. */
  cambiar(origen: 'simulado' | 'propio'): void {
    if (origen === this.o.origen()) return;
    this.o.usar(origen);
    this.salir();
  }
}
