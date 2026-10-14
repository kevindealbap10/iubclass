import { Pipe, PipeTransform } from '@angular/core';

// =============================================================================
//  S03 · EJEMPLO 7a · Pipe propio: peso
//  Diapositiva 23
// -----------------------------------------------------------------------------
//  transform recibe el valor que está a la izquierda del | y devuelve el texto
//  que aparece en pantalla. El dato en el componente sigue siendo un número de
//  gramos; el pipe decide cómo se lee.
//
//      0     ->  sin peso
//      250   ->  250 g
//      1500  ->  1,5 kg
//      2000  ->  2 kg
//
//  Desde Angular 19 los pipes son standalone por defecto: basta con agregarlo
//  a imports del componente que lo usa. Con Angular CLI se genera con
//      ng generate pipe peso
// =============================================================================

@Pipe({ name: 'peso' })
export class PesoPipe implements PipeTransform {
  transform(gramos: number): string {
    if (gramos === 0) return 'sin peso';
    if (gramos < 1000) return `${gramos} g`;
    // 1500 / 1000 = 1.5; toLocaleString('es-CO') lo escribe con coma: 1,5
    return `${(gramos / 1000).toLocaleString('es-CO')} kg`;
  }
}
