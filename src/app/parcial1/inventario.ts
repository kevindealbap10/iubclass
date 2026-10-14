import { Component, signal, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FichaProducto, Producto } from './ficha-producto';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [FichaProducto, CurrencyPipe],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Inventario de Periféricos</h2>
      
      <div class="mb-4 p-4 bg-gray-100 rounded">
        <p><strong>Valor Total:</strong> {{ valorTotal() | currency:'COP':'symbol':'1.0-0':'es-CO' }}</p>
        <p><strong>Unidades Totales:</strong> {{ unidadesTotales() }}</p>
        <p><strong>Productos Agotados:</strong> {{ productosAgotados() }}</p>
      </div>

      <button (click)="vaciarLista()" class="mb-4 px-4 py-2 bg-red-500 text-white rounded">
        Vaciar lista
      </button>

      <div>
        @for (prod of lista(); track prod.nombre) {
          <app-ficha [producto]="prod" (retirar)="manejarRetiro($event)" />
        } @empty {
          <p class="text-gray-500 italic">No hay productos para mostrar</p>
        }
      </div>
    </div>
  `
})
export class Inventario {
  lista = signal<Producto[]>([
    { nombre: 'Teclado', precio: 38000, existencias: 6 },
    { nombre: 'Ratón', precio: 22000, existencias: 0 },
    { nombre: 'Cable HDMI', precio: 15000, existencias: 2 },
    { nombre: 'Cable de red', precio: 6500, existencias: 12 }
  ]);

  valorTotal = computed(() => 
    this.lista().reduce((acc, p) => acc + (p.precio * p.existencias), 0)
  );

  unidadesTotales = computed(() => 
    this.lista().reduce((acc, p) => acc + p.existencias, 0)
  );

  productosAgotados = computed(() => 
    this.lista().filter(p => p.existencias === 0).length
  );

  manejarRetiro(nombre: string) {
    this.lista.update(productos => 
      productos.map(p => p.nombre === nombre ? { ...p, existencias: p.existencias - 1 } : p)
    );
  }

  vaciarLista() {
    this.lista.set([]);
  }
}
