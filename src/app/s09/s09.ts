import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

// =============================================================================
//  S09 · Ruta padre · /s09 · Diapositivas 10, 11 y 23
// -----------------------------------------------------------------------------
//  Qué muestra
//    1. Un menú con routerLink: cambia la vista SIN recargar la página.
//    2. routerLinkActive: pinta la opción de la ruta actual.
//    3. La «barra de dirección»: la URL que el enrutador acaba de resolver.
//       Se lee de router.events (un observable, S08) con toSignal.
//    4. <router-outlet />: el hueco donde el enrutador pone la vista hija.
//    5. <router-outlet name="panel" />: ruta secundaria (diapositivas 39 y 40).
//
//  Qué observar
//    - Al pulsar «Productos» y luego un producto, la opción «Productos» sigue
//      activa: /s09/productos/8 empieza por /s09/productos.
//    - «Inicio» usa { exact: true }; sin eso estaría activa en todas las vistas.
//    - En F12 > Red no aparece una nueva descarga del documento al navegar.
// =============================================================================

@Component({
  selector: 'app-s09',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <h2 class="text-2xl font-bold text-slate-900">Sesión S09 · Routing y navegación</h2>
    <p class="mt-1 text-sm text-slate-500">
      Una sola página, varias vistas. El código está en src/app/s09/ y el mapa de rutas en s09.routes.ts.
    </p>

    <!-- 3. Barra de dirección: lo que el enrutador resolvió -->
    <div class="mt-4 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm">
      <span class="text-slate-400">URL</span>
      <span data-testid="url" class="font-bold text-blue-700">{{ url() }}</span>
    </div>

    <!-- 1 y 2. Menú: rutas relativas a /s09 -->
    <nav class="mt-4 flex flex-wrap gap-2">
      <a routerLink="./" routerLinkActive="activo" [routerLinkActiveOptions]="{ exact: true }" class="opcion">Inicio</a>
      <a routerLink="productos" routerLinkActive="activo" class="opcion">Productos</a>
      <a routerLink="resumen" routerLinkActive="activo" class="opcion">Resumen (diferida)</a>
      <a routerLink="productos/99" routerLinkActive="activo" class="opcion">Producto 99</a>
      <a routerLink="ofertas" routerLinkActive="activo" class="opcion">Ofertas (no existe)</a>
      <a [routerLink]="['/s09', { outlets: { panel: ['ficha', 8] } }]" queryParamsHandling="preserve"
         class="opcion">Panel: ficha 8</a>
    </nav>

    <!-- 4. Aquí el enrutador pone la vista hija -->
    <!-- 5. Ruta secundaria: dos outlets a la vez, el principal y el llamado «panel» -->
    <div class="mt-4 grid gap-4" [class.con-panel]="panelAbierto()">
      <section class="rounded-xl border-2 border-dashed border-amber-400 bg-white p-5">
        <p class="mb-3 text-[11px] font-bold uppercase tracking-widest text-amber-600">router-outlet de /s09</p>
        <router-outlet />
      </section>
      <div><router-outlet name="panel" /></div>
    </div>
  `,
  styles: `
    .opcion { border-radius: 9999px; border: 1px solid #cbd5e1; background: #fff; padding: 0.35rem 0.9rem;
      font-size: 0.85rem; font-weight: 600; color: #334155; }
    .opcion:hover { border-color: #1e3a8a; }
    .activo { background: #1e3a8a; border-color: #1e3a8a; color: #fff; }
    .con-panel { grid-template-columns: 2fr 1fr; }
  `,
})
export class S09 {
  private readonly router = inject(Router);

  /** true si la dirección trae la ruta secundaria: /s09/(productos//panel:ficha/8) */
  readonly panelAbierto = () => this.url().includes('panel:');

  readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
}
