import { Injectable, signal } from '@angular/core';
import { Observable, defer, mergeMap, of, throwError, timer } from 'rxjs';
import { delay } from 'rxjs/operators';

// =============================================================================
//  S08 · Inventario ampliado y servicio simulado
//  Usado por los ejemplos 2, 4, 5, 8 y 9. Los ejemplos 8 y 9 usan las funciones
//  puras (coincidencias, retardoBusqueda) y buscarInestable, que no tocan llamadas.
// -----------------------------------------------------------------------------
//  Los seis primeros productos son los de la S03 (Mango a Ahuyama). Se agregan
//  ocho para que las búsquedas devuelvan conjuntos de distinto tamaño.
//
//  Regla de búsqueda, común a todos los ejemplos
//    - El texto se normaliza: se recorta con trim(), se pasa a minúsculas y se
//      quitan las tildes. «Maíz» y «maiz» son el mismo texto.
//    - Con menos de MINIMO caracteres no se consulta.
//    - Un producto coincide si el texto está contenido en su nombre o en su
//      categoría.
//
//  ProductoApi simula un servidor: la respuesta llega con retraso
//    max(150, 900 - 150 * longitud) ms
//  Los textos cortos tardan más. Esa diferencia es la que produce la carrera de
//  respuestas del ejemplo 4. Aún no hay HttpClient (RA3, Corte 3): el servicio
//  mantiene la misma forma que tendrá con el servidor, un Observable.
//
//  Cada consulta se cuenta en la signal pública llamadas, que no se puede
//  modificar desde fuera (asReadonly), y el texto consultado queda en consultados.
// =============================================================================

export interface Producto {
  id: number;
  nombre: string;
  categoria: 'Frutas' | 'Verduras' | 'Granos';
  precio: number;
  cantidad: number;
}

export const MINIMO = 2;

export const INVENTARIO: Producto[] = [
  { id: 1, nombre: 'Mango', categoria: 'Frutas', precio: 1800, cantidad: 12 },
  { id: 2, nombre: 'Guayaba', categoria: 'Frutas', precio: 1200, cantidad: 0 },
  { id: 3, nombre: 'Patilla', categoria: 'Frutas', precio: 6500, cantidad: 2 },
  { id: 4, nombre: 'Tomate', categoria: 'Verduras', precio: 3200, cantidad: 9 },
  { id: 5, nombre: 'Cebolla', categoria: 'Verduras', precio: 2800, cantidad: 1 },
  { id: 6, nombre: 'Ahuyama', categoria: 'Verduras', precio: 4500, cantidad: 0 },
  { id: 7, nombre: 'Papaya', categoria: 'Frutas', precio: 3500, cantidad: 8 },
  { id: 8, nombre: 'Banano', categoria: 'Frutas', precio: 900, cantidad: 30 },
  { id: 9, nombre: 'Zanahoria', categoria: 'Verduras', precio: 2100, cantidad: 15 },
  { id: 10, nombre: 'Lechuga', categoria: 'Verduras', precio: 1500, cantidad: 0 },
  { id: 11, nombre: 'Arroz', categoria: 'Granos', precio: 4200, cantidad: 20 },
  { id: 12, nombre: 'Lenteja', categoria: 'Granos', precio: 5800, cantidad: 6 },
  { id: 13, nombre: 'Fríjol', categoria: 'Granos', precio: 7300, cantidad: 3 },
  { id: 14, nombre: 'Maíz', categoria: 'Granos', precio: 2600, cantidad: 11 },
];

/** Minúsculas, sin tildes y sin espacios en los extremos. */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

/** Productos cuyo nombre o categoría contienen el texto (ya normalizado o no). */
export function coincidencias(texto: string): Producto[] {
  const t = normalizar(texto);
  return INVENTARIO.filter((p) => normalizar(p.nombre).includes(t) || normalizar(p.categoria).includes(t));
}

/** Retraso del servidor simulado: max(150, 900 - 150 * longitud) ms. */
export function retardoBusqueda(texto: string): number {
  return Math.max(150, 900 - 150 * normalizar(texto).length);
}

/** Valor del inventario: suma de precio por cantidad. */
export function valorInventario(productos: Producto[]): number {
  return productos.reduce((suma, p) => suma + p.precio * p.cantidad, 0);
}

/** Formato con separador de miles de Colombia, sin depender del locale registrado. */
export function pesos(n: number): string {
  return '$ ' + n.toLocaleString('es-CO');
}

@Injectable({ providedIn: 'root' })
export class ProductoApi {
  private readonly _llamadas = signal(0);
  private readonly _consultados = signal<string[]>([]);

  /** Cantidad de consultas hechas al servidor simulado. */
  readonly llamadas = this._llamadas.asReadonly();
  /** Textos consultados, en orden. */
  readonly consultados = this._consultados.asReadonly();

  /**
   * La consulta se cuenta al suscribirse, no al llamar al método: un Observable
   * frío no hace nada hasta que alguien se suscribe. Una consulta cancelada por
   * switchMap ya contó, porque la petición salió.
   */
  buscar(texto: string): Observable<Producto[]> {
    const t = normalizar(texto);
    return defer(() => {
      this._llamadas.update((n) => n + 1);
      this._consultados.update((lista) => [...lista, t]);
      return of(coincidencias(t)).pipe(delay(retardoBusqueda(t)));
    });
  }

  private intentosIntermitentes = 0;

  /**
   * Servidor inestable del ejemplo 8. No cuenta en llamadas: los demás ejemplos
   * comparten ese contador y no deben alterarse.
   *   «error»        falla siempre, con el mensaje «Error de red simulado».
   *   «intermitente» falla las dos primeras suscripciones y responde con las
   *                  frutas desde la tercera. reiniciarInestable() lo restablece.
   *   cualquier otro se comporta como buscar().
   */
  buscarInestable(texto: string): Observable<Producto[]> {
    const t = normalizar(texto);
    return defer(() => {
      const espera = retardoBusqueda(t);
      if (t === 'error') {
        return timer(espera).pipe(mergeMap(() => throwError(() => new Error('Error de red simulado'))));
      }
      if (t === 'intermitente') {
        this.intentosIntermitentes += 1;
        if (this.intentosIntermitentes <= 2) {
          return timer(espera).pipe(mergeMap(() => throwError(() => new Error('Error de red simulado'))));
        }
        return of(coincidencias('frutas')).pipe(delay(espera));
      }
      return of(coincidencias(t)).pipe(delay(espera));
    });
  }

  reiniciarInestable(): void {
    this.intentosIntermitentes = 0;
  }

  reiniciar(): void {
    this._llamadas.set(0);
    this._consultados.set([]);
  }
}
