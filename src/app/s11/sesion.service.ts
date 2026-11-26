import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { OrigenApi } from '../s10/origen-api';

// =============================================================================
//  S11 · Sesión del usuario con signals · Diapositivas 15 y 16
// -----------------------------------------------------------------------------
//  POST /auth/login devuelve el usuario, un accessToken y un refreshToken.
//    accessToken   -> viaja en cada petición protegida (Authorization: Bearer …)
//                     y vence pronto (expiresInMins).
//    refreshToken  -> solo sirve para pedir un accessToken nuevo en /auth/refresh.
//
//  El servicio guarda la respuesta en UNA signal privada y expone vistas de solo
//  lectura con computed. Los interceptores leen token(); los guards preguntan
//  estaAutenticado(); la vista muestra usuario() y venceA().
//  Además la copia en localStorage para que la sesión sobreviva a una recarga.
//
//  Usuarios de prueba (dummyjson y servidor propio):
//    emilys / emilyspass    michaelw / michaelwpass    sophiab / sophiabpass
// =============================================================================

export interface UsuarioSesion {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}
export interface Tokens {
  accessToken: string;
  refreshToken: string;
}
export type RespuestaLogin = UsuarioSesion & Tokens;

const CLAVE = 'iubclase-s11-sesion';

function leer(): RespuestaLogin | null {
  try {
    const v = typeof localStorage !== 'undefined' ? localStorage.getItem(CLAVE) : null;
    return v ? (JSON.parse(v) as RespuestaLogin) : null;
  } catch {
    return null;
  }
}

/** Lee el campo exp (segundos) de la parte central del JWT. No verifica la firma: eso lo hace el servidor. */
export function vencimientoDe(token: string | null): Date | null {
  try {
    const cuerpo = token!.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return new Date(JSON.parse(atob(cuerpo)).exp * 1000);
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly http = inject(HttpClient);
  private readonly origen = inject(OrigenApi);
  private readonly datos = signal<RespuestaLogin | null>(leer());
  private minutos = 30;

  readonly usuario = computed<UsuarioSesion | null>(() => this.datos());
  readonly token = computed(() => this.datos()?.accessToken ?? null);
  readonly estaAutenticado = computed(() => this.token() !== null);
  readonly venceA = computed(() => vencimientoDe(this.token()));

  /** expiresInMins corto (1) sirve para ver en clase el 401 «Token Expired!» y la renovación. */
  iniciar(username: string, password: string, expiresInMins = 30): Observable<RespuestaLogin> {
    this.minutos = expiresInMins;
    return this.http
      .post<RespuestaLogin>(`${this.origen.base()}/auth/login`, { username, password, expiresInMins })
      .pipe(tap((r) => this.guardar(r)));
  }

  /** Pide tokens nuevos con el refreshToken y devuelve el accessToken nuevo. Lo usa el interceptor de 401. */
  renovar(): Observable<string> {
    const refreshToken = this.datos()?.refreshToken;
    return this.http
      .post<Tokens>(`${this.origen.base()}/auth/refresh`, { refreshToken, expiresInMins: this.minutos })
      .pipe(
        tap((t) => {
          const actual = this.datos();
          if (actual) this.guardar({ ...actual, ...t });
        }),
        map((t) => t.accessToken),
      );
  }

  cerrar(): void {
    this.guardar(null);
  }

  /** Solo para la demostración de la diapositiva 25: reemplaza el token por uno con la firma alterada. */
  danarToken(): void {
    const actual = this.datos();
    if (actual) this.guardar({ ...actual, accessToken: actual.accessToken.slice(0, -4) + 'AAAA' });
  }

  private guardar(r: RespuestaLogin | null): void {
    this.datos.set(r);
    try {
      if (r) localStorage.setItem(CLAVE, JSON.stringify(r));
      else localStorage.removeItem(CLAVE);
    } catch { /* sin almacenamiento: la sesión dura hasta recargar */ }
  }
}
