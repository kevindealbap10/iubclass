import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, httpResource } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { NuevaTarea, PaginaTareas, Tarea } from './tarea';

// =============================================================================
//  S10 · El servicio de acceso a datos · Diapositivas 10 a 29
// -----------------------------------------------------------------------------
//  Regla de la sesión: este servicio es la ÚNICA puerta hacia el servidor.
//  Ningún componente inyecta HttpClient; todos piden los datos aquí.
//
//  Qué muestra
//    1. get tipado con HttpParams (limit y skip)            -> diapositiva 14
//    2. httpResource: la misma lectura con tres estados    -> diapositivas 16 y 17
//    3. post, patch, put y delete                          -> diapositiva 22
//    4. catchError + mensajeDe(): el error en palabras     -> diapositivas 28 y 29
//
//  Qué observar en F12 > Red
//    - Cada método produce UNA petición con su verbo (GET, POST, PATCH, DELETE).
//    - Las escrituras de dummyjson son simuladas: la respuesta es real, pero el
//      servidor no guarda el cambio. Por eso el componente actualiza su estado
//      local con lo que devuelve la API (diapositiva 23).
// =============================================================================

export const API_TAREAS = 'https://dummyjson.com/todos';

@Injectable({ providedIn: 'root' })
export class TareasService {
  private readonly http = inject(HttpClient);

  // 1. Lectura clásica: un Observable que hace la petición al suscribirse.
  pagina(limit: number, skip: number): Observable<PaginaTareas> {
    const params = new HttpParams().set('limit', limit).set('skip', skip);
    return this.http.get<PaginaTareas>(API_TAREAS, { params });
  }

  // 2. Lectura con httpResource: se vuelve a pedir sola cuando cambia la signal
  //    que lee dentro de la función. Debe llamarse en un contexto de inyección
  //    (inicializador de un campo del componente).
  paginaRecurso(pagina: () => number, tamano: number) {
    return httpResource<PaginaTareas>(() => ({
      url: API_TAREAS,
      params: { limit: tamano, skip: (pagina() - 1) * tamano },
    }));
  }

  porId(id: number): Observable<Tarea> {
    return this.http.get<Tarea>(`${API_TAREAS}/${id}`).pipe(
      // 4. El componente recibe un Error con texto legible, no el objeto HTTP.
      catchError((err: HttpErrorResponse) => throwError(() => new Error(mensajeDe(err)))),
    );
  }

  // 3. Escrituras. Cada una devuelve lo que responde el servidor.
  crear(tarea: NuevaTarea): Observable<Tarea> {
    return this.http.post<Tarea>(`${API_TAREAS}/add`, tarea); // 201 Created
  }

  marcar(id: number, completed: boolean): Observable<Tarea> {
    return this.http.patch<Tarea>(`${API_TAREAS}/${id}`, { completed }); // cambia un campo
  }

  reemplazar(tarea: Tarea): Observable<Tarea> {
    const { id, ...resto } = tarea;
    return this.http.put<Tarea>(`${API_TAREAS}/${id}`, resto); // envía el registro completo
  }

  eliminar(id: number): Observable<Tarea & { isDeleted: boolean }> {
    return this.http.delete<Tarea & { isDeleted: boolean }>(`${API_TAREAS}/${id}`);
  }
}

/** Traduce un HttpErrorResponse a un mensaje para el usuario. */
export function mensajeDe(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) return 'Ocurrió un error inesperado.';
  if (err.status === 0) return 'No hay conexión con el servidor. Verifique la red o la dirección de la API.';
  if (err.status === 404) return `No existe el registro solicitado (${err.error?.message ?? '404'}).`;
  if (err.status >= 500) return 'El servidor falló. Intente de nuevo en unos minutos.';
  return `La petición fue rechazada (${err.status}).`;
}
