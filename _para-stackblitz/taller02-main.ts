import { Component, computed, signal, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CurrencyPipe, DatePipe, registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';

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

@Pipe({ name: 'unidades' })
export class UnidadesPipe implements PipeTransform {
  transform(cantidad: number): string {
    if (cantidad === 0) return 'sin existencias';
    if (cantidad === 1) return '1 unidad';
    return `${cantidad} unidades`;
  }
}

@Component({
  selector: 'app-root',
  imports: [CurrencyPipe, DatePipe, UnidadesPipe],
  template: `
    <div class="envoltura">
      <h1>Inventario · {{ hoy | date: 'fullDate' }}</h1>
      <p class="pie">Taller 02 · filtros, estados y pipe propio</p>

      <div class="filtros">
        @for (categoria of categorias; track categoria) {
          <button
            type="button"
            class="filtro"
            [class.activo]="filtro() === categoria"
            (click)="filtro.set(categoria)"
          >
            {{ categoria }}
          </button>
        }
      </div>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th class="derecha">Precio</th>
            <th class="derecha">Existencias</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          @for (p of filas(); track p.nombre) {
            <tr [class.agotado]="p.estado === 'agotado'">
              <td class="fuerte">{{ p.nombre }}</td>
              <td class="derecha">{{ p.precio | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</td>
              <td class="derecha">{{ p.cantidad | unidades }}</td>
              <td>
                @switch (p.estado) {
                  @case ('agotado') {
                    <span class="etiqueta etiqueta-agotado">Agotado</span>
                  }
                  @case ('bajo') {
                    <span class="etiqueta etiqueta-bajo">Bajo</span>
                  }
                  @case ('disponible') {
                    <span class="etiqueta etiqueta-disponible">Disponible</span>
                  }
                  @default {
                    <span class="etiqueta etiqueta-disponible">—</span>
                  }
                }
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="4" class="vacio">No hay productos en esta categoría</td>
            </tr>
          }
        </tbody>
      </table>

      <p class="pie">Mostrando {{ filas().length }} de {{ productos().length }} productos.</p>
    </div>
  `,
  styles: `
    .envoltura {
      max-width: 46rem;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      font-family: system-ui, sans-serif;
      color: #0f172a;
    }
    h1 {
      font-size: 1.6rem;
      font-weight: 700;
    }
    .pie {
      font-size: 0.8rem;
      color: #64748b;
    }
    .filtros {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1.25rem 0;
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
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      overflow: hidden;
      font-size: 0.9rem;
    }
    thead {
      background: #1e293b;
      color: #fff;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    th,
    td {
      padding: 0.6rem 0.9rem;
      text-align: left;
    }
    tbody tr {
      border-top: 1px solid #e2e8f0;
    }
    .fuerte {
      font-weight: 600;
    }
    .derecha {
      text-align: right;
    }
    .agotado {
      background-color: #fee2e2;
    }
    .agotado td {
      color: #991b1b;
      font-weight: 600;
    }
    .vacio {
      text-align: center;
      padding: 2rem;
      color: #94a3b8;
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
export class App {
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

registerLocaleData(localeEsCo);
bootstrapApplication(App, { providers: [{ provide: LOCALE_ID, useValue: 'es-CO' }] });
