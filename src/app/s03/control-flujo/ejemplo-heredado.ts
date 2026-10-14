import { Component, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

// =============================================================================
//  S03 · EJEMPLO 5 · Sintaxis anterior a Angular 17: *ngIf y *ngFor
//  Diapositiva 13
// -----------------------------------------------------------------------------
//  Para LEER código existente, no para escribirlo en este curso.
//
//  Qué muestra
//    El mismo aviso y la misma lista de los ejemplos 1 y 2, escritos con
//    directivas estructurales. Compare línea por línea:
//
//        *ngIf="cond; else plantilla"   ->  @if (cond) { } @else { }
//        *ngFor="let p of lista; trackBy: fn"  ->  @for (p of lista; track p.nombre)
//
//  Qué observar
//    - Las directivas se importan: NgIf y NgFor en imports. Sin ese import, la
//      plantilla no las reconoce (error 4 de «Errores frecuentes»).
//    - trackBy exige una función en la clase; track acepta una expresión.
//    - Migración automática de un proyecto viejo:
//          ng generate @angular/core:control-flow
// =============================================================================

@Component({
  selector: 'app-ejemplo-heredado',
  imports: [NgIf, NgFor],
  template: `
    <p *ngIf="total() > 50000; else regular" class="text-sm font-semibold text-emerald-800">
      Jornada de venta mayorista
    </p>
    <ng-template #regular><p class="text-sm text-slate-600">Jornada regular</p></ng-template>

    <ul class="mt-2 list-disc pl-6 text-sm">
      <li *ngFor="let p of productos(); trackBy: porNombre">{{ p }}</li>
    </ul>
  `,
})
export class EjemploHeredado {
  total = signal(72800);
  productos = signal(['Yuca', 'Ñame', 'Plátano']);

  porNombre(_indice: number, nombre: string) {
    return nombre;
  }
}
