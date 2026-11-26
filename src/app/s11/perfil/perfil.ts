import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { OrigenApi } from '../../s10/origen-api';
import { SesionService } from '../sesion.service';

// =============================================================================
//  S11 · Ejemplo 2 · Ruta protegida con canActivate · /s11/perfil · Diapositivas 21, 24 y 25
// -----------------------------------------------------------------------------
//  Qué muestra
//    - La ruta tiene canActivate: [autenticadoGuard]; sin sesión, el router lleva al login.
//    - GET /auth/me con httpResource. El componente NO escribe la cabecera
//      Authorization: la agrega tokenInterceptor.
//    - «Token alterado» cambia la firma: el servidor propio responde 401 «invalid token»
//      y renovacionInterceptor cierra la sesión (no hay nada que renovar).
//    - Con un token de 1 minuto, «Recargar» pasado el minuto muestra en F12 > Red:
//      GET /auth/me 401 «Token Expired!» -> POST /auth/refresh 200 -> GET /auth/me 200.
//
//  Qué observar
//    - F12 > Red > /auth/me > Encabezados de solicitud: Authorization: Bearer eyJ…
//    - La hora de vencimiento cambia después de la renovación.
//    - En dummyjson, el token alterado responde 500, no 401; por eso esa prueba se hace
//      con el servidor propio.
// =============================================================================

interface Perfil {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  image: string;
}

@Component({
  selector: 'app-s11-perfil',
  imports: [DatePipe],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h3 class="text-lg font-bold">Perfil · GET /auth/me</h3>
      <div class="flex gap-2">
        <button class="boton" (click)="perfil.reload()">Recargar</button>
        <button class="boton" (click)="sesion.danarToken()">Token alterado</button>
      </div>
    </div>
    <p class="mt-1 text-sm text-slate-500">El token vence a las {{ sesion.venceA() | date: 'HH:mm:ss' }}.</p>

    @if (perfil.isLoading()) {
      <p class="estado cargando">Consultando /auth/me…</p>
    } @else if (perfil.error()) {
      <p class="estado error">La consulta falló con status {{ status() }}.</p>
    } @else if (perfil.hasValue()) {
      <div class="mt-3 flex items-center gap-4 rounded-lg border bg-white p-4">
        <img [src]="perfil.value().image" alt="" width="64" height="64" class="rounded-full bg-slate-100" />
        <dl class="grid grid-cols-[auto_1fr] gap-x-4 text-sm">
          <dt class="text-slate-500">Nombre</dt><dd>{{ perfil.value().firstName }} {{ perfil.value().lastName }}</dd>
          <dt class="text-slate-500">Correo</dt><dd>{{ perfil.value().email }}</dd>
          <dt class="text-slate-500">Rol</dt><dd>{{ perfil.value().role }}</dd>
        </dl>
      </div>
    }
  `,
  styles: `
    .boton { border: 1px solid #cbd5e1; border-radius: .5rem; padding: .25rem .7rem; font-size: .85rem; background: #fff; }
    .estado { margin-top: .75rem; border-radius: .5rem; padding: .6rem .8rem; font-size: .9rem; }
    .cargando { background: #eff6ff; color: #1e3a8a; }
    .error { background: #fef2f2; color: #991b1b; }
  `,
})
export class PerfilVista {
  protected readonly sesion = inject(SesionService);
  private readonly origen = inject(OrigenApi);

  // Sin cabecera aquí: el interceptor la agrega porque la URL contiene /auth/
  readonly perfil = httpResource<Perfil>(() => `${this.origen.base()}/auth/me`);
  readonly status = computed(() => (this.perfil.error() as { status?: number } | undefined)?.status ?? '—');
}
