import { Injectable, computed, signal } from '@angular/core';

// =============================================================================
//  S10 · Origen de los datos: API simulada o servidor propio
// -----------------------------------------------------------------------------
//  simulado -> https://dummyjson.com  responde, pero NO guarda las escrituras.
//  propio   -> /api                   ng serve lo redirige a api/servidor.mjs
//                                     (proxy.conf.json), que SÍ guarda en
//                                     api/datos.json.
//
//  Para usar el servidor propio, en una segunda terminal:   npm run api
//
//  Experimento de la clase: cree una tarea en «Escritura» y márquela.
//    simulado -> PATCH /todos/255 responde 404 (la tarea nunca se guardó)
//    propio   -> PATCH /todos/255 responde 200 y sigue ahí al recargar
// =============================================================================

export const ORIGENES = {
  simulado: 'https://dummyjson.com',
  propio: '/api',
} as const;
export type Origen = keyof typeof ORIGENES;

const CLAVE = 'iubclase-s10-origen';

function leerGuardado(): Origen {
  try {
    const v = typeof localStorage !== 'undefined' ? localStorage.getItem(CLAVE) : null;
    return v === 'propio' ? 'propio' : 'simulado';
  } catch {
    return 'simulado';
  }
}

@Injectable({ providedIn: 'root' })
export class OrigenApi {
  readonly origen = signal<Origen>(leerGuardado());
  /** Base de las URL: cualquier lectura que la use se vuelve a pedir al cambiar el origen. */
  readonly base = computed(() => ORIGENES[this.origen()]);

  usar(o: Origen): void {
    this.origen.set(o);
    try { localStorage.setItem(CLAVE, o); } catch { /* sin almacenamiento: solo dura la sesión */ }
  }
}
