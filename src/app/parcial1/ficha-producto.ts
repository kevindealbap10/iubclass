import { Component, input, output, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

export interface Producto {
  nombre: string;
  precio: number;
  existencias: number;
}

@Component({
  selector: 'app-ficha',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="p-4 border rounded shadow-sm mb-3">
      <h3>{{ producto().nombre }}</h3>
      <p>Precio: {{ producto().precio | currency:'COP':'symbol':'1.0-0':'es-CO' }}</p>
      <p>Existencias: {{ producto().existencias }}</p>
      <p>Estado: 
        @switch (estadoProducto()) {
          @case ('Agotado') {
            <span class="text-red-600 font-bold">Agotado</span>
          }
          @case ('Inventario bajo') {
            <span class="text-orange-500 font-bold">Inventario bajo</span>
          }
          @case ('Disponible') {
            <span class="text-green-600 font-bold">Disponible</span>
          }
        }
      </p>
      <button 
        (click)="retirarUnidad()" 
        [disabled]="producto().existencias === 0"
        class="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300">
        Retirar 1
      </button>
    </div>
  `
})
export class FichaProducto {
  producto = input.required<Producto>();
  retirar = output<string>();

  estadoProducto = computed(() => {
    const ex = this.producto().existencias;
    if (ex === 0) return 'Agotado';
    if (ex < 3) return 'Inventario bajo';
    return 'Disponible';
  });

  retirarUnidad() {
    this.retirar.emit(this.producto().nombre);
  }
}
