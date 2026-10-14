import { Component, computed, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { UnidadesPipe } from './unidades-pipe';

interface Producto {
  nombre: string;
  categoria: string;
  precio: number;
  cantidad: number;
}

type Estado = 'agotado' | 'bajo' | 'disponible';

interface Fila extends Producto {
  estado: Estado;
}

@Component({
  selector: 'app-taller02',
  imports: [CurrencyPipe, DatePipe, UnidadesPipe],
  templateUrl: './taller02.html',
  styles: `
    .agotado {
      background-color: #fee2e2;
    }
    .agotado td {
      color: #991b1b;
      font-weight: 600;
    }
    .filtro {
      border: 1px solid #cbd5e1;
      border-radius: 0.5rem;
      background: #fff;
      color: #334155;
      padding: 0.35rem 0.9rem;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
    }
    .filtro.activo {
      background: #1e293b;
      border-color: #1e293b;
      color: #fff;
    }
    .etiqueta {
      border-radius: 999px;
      padding: 0.1rem 0.6rem;
      font-size: 0.72rem;
      font-weight: 700;
    }
    .etiqueta-agotado {
      background: #fecaca;
      color: #991b1b;
    }
    .etiqueta-bajo {
      background: #fde68a;
      color: #92400e;
    }
    .etiqueta-disponible {
      background: #bbf7d0;
      color: #065f46;
    }
  `,
})
export class Taller02 {
  hoy = new Date();

  categorias = ['Todas', 'Frutas', 'Verduras', 'Granos'];

  filtro = signal('Todas');

  productos = signal<Producto[]>([
    { nombre: 'Mango', categoria: 'Frutas', precio: 1800, cantidad: 12 },
    { nombre: 'Guayaba', categoria: 'Frutas', precio: 1200, cantidad: 0 },
    { nombre: 'Patilla', categoria: 'Frutas', precio: 6500, cantidad: 2 },
    { nombre: 'Tomate', categoria: 'Verduras', precio: 3200, cantidad: 9 },
    { nombre: 'Cebolla', categoria: 'Verduras', precio: 2800, cantidad: 1 },
    { nombre: 'Ahuyama', categoria: 'Verduras', precio: 4500, cantidad: 0 },
  ]);

  visibles = computed(() => {
    const categoria = this.filtro();
    if (categoria === 'Todas') return this.productos();
    return this.productos().filter((p) => p.categoria === categoria);
  });

  filas = computed<Fila[]>(() =>
    this.visibles().map((p) => ({ ...p, estado: this.estadoDe(p.cantidad) })),
  );

  private estadoDe(cantidad: number): Estado {
    if (cantidad === 0) return 'agotado';
    if (cantidad <= 2) return 'bajo';
    return 'disponible';
  }
}
