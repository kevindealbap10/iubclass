import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse, HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, finalize, retry, switchMap, tap, throwError, timer } from 'rxjs';
import { SesionService } from './sesion.service';

// =============================================================================
//  S11 · Interceptores funcionales · Diapositivas 7 a 12, 24 y 25
// -----------------------------------------------------------------------------
//  Un interceptor es una función que recibe cada petición antes de que salga y
//  cada respuesta antes de que llegue al servicio:
//      (req, next) => next(req)          <- no hace nada: deja pasar
//  Se registran en orden en app.config.ts:
//      provideHttpClient(withInterceptors([renovacion, registro, reintento, token]))
//
//    renovacionInterceptor  -> ante un 401 en ruta protegida: si el token venció,
//                              lo renueva con /auth/refresh y repite la petición una
//                              vez; si no, cierra la sesión y lleva al login
//    registroInterceptor    -> mide cada petición y la anota en la bitácora de /s11
//    reintentoInterceptor   -> repite un GET si no hubo respuesta (0) o el servidor falló (5xx)
//    tokenInterceptor       -> agrega Authorization: Bearer <token> a las rutas /auth/…
//
//  El primero de la lista es el más externo: ve la petición primero y la
//  respuesta de último. El último es el más cercano al servidor.
//  renovacion va primero para que la petición que repite vuelva a pasar por
//  registro, reintento y token: así la bitácora muestra el 401 y el reintento.
//
//  Qué observar en la bitácora y en F12 > Red con un token de 1 minuto, pasado el minuto:
//      GET /auth/me 401  ->  POST /auth/refresh 200  ->  GET /auth/me 200
// =============================================================================

/** Bitácora visible en /s11: una línea por petición, la más reciente arriba. */
@Injectable({ providedIn: 'root' })
export class Bitacora {
  readonly lineas = signal<string[]>([]);
  anotar(linea: string): void {
    this.lineas.update((l) => [linea, ...l].slice(0, 10));
  }
}

/** Rutas que exigen token: /auth/… excepto login y refresh. El resto de la API es pública. */
export const esRutaProtegida = (url: string) => /\/auth\/(?!login|refresh)/.test(url);

/** Los ejemplos de la clase solo actúan sobre las peticiones de las vistas de /s11. Así no
 *  interfieren con otra sección del mismo repositorio que tenga su propio login (Taller 10). */
const desdeS11 = () => inject(Router).url.startsWith('/s11');

// 1. Agregar el token. La petición es inmutable: se clona con la cabecera nueva.
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(SesionService).token();
  if (!token || !esRutaProtegida(req.url) || !desdeS11()) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

// 2. Registrar: status y milisegundos de cada petición, haya salido bien o mal.
export const registroInterceptor: HttpInterceptorFn = (req, next) => {
  const bitacora = inject(Bitacora);
  const inicio = performance.now();
  let estado = 'sin respuesta';
  const ruta = req.urlWithParams.replace(/^https?:\/\/[^/]+/, '');
  return next(req).pipe(
    tap({
      next: (e) => { if (e.type === HttpEventType.Response) estado = String(e.status); },
      error: (e: HttpErrorResponse) => { estado = String(e.status); },
    }),
    finalize(() => bitacora.anotar(`${req.method} ${ruta} → ${estado} · ${Math.round(performance.now() - inicio)} ms`)),
  );
};

// 3. Reintentar: solo GET, porque repetir un POST podría crear el registro dos veces.
export const reintentoInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') return next(req);
  return next(req).pipe(
    retry({
      count: 2,
      delay: (err: HttpErrorResponse, intento) =>
        err.status === 0 || err.status >= 500 ? timer(400 * intento) : throwError(() => err),
    }),
  );
};

// 4. Manejar el 401: renovar una vez o cerrar la sesión.
export const renovacionInterceptor: HttpInterceptorFn = (req, next) => {
  if (!esRutaProtegida(req.url) || !desdeS11()) return next(req);   // rutas públicas, /auth/refresh y otras secciones
  const sesion = inject(SesionService);
  const router = inject(Router);

  const salir = (motivo: string) => {
    sesion.cerrar();
    router.navigate(['/s11/login'], { queryParams: { volver: router.url, motivo } });
  };

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) return throwError(() => err);
      if (err.error?.message !== 'Token Expired!') {
        salir(err.error?.message ?? 'No autorizado');   // token ausente o alterado: no hay nada que renovar
        return throwError(() => err);
      }
      return sesion.renovar().pipe(
        // la misma petición, con el token nuevo; si vuelve a fallar, ya no se renueva otra vez
        switchMap((nuevo) => next(req.clone({ setHeaders: { Authorization: `Bearer ${nuevo}` } }))),
        catchError((err2: HttpErrorResponse) => {
          salir(err2.error?.message ?? 'La sesión venció');
          return throwError(() => err2);
        }),
      );
    }),
  );
};
