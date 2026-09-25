import { Component, computed, signal } from '@angular/core';

interface Producto {
  nombre: string;
  precio: number;
  cantidad: number;
}

@Component({
  selector: 'app-tablero',
  templateUrl: './tablero.html',
})
export class Tablero {
  vendedor = signal('Don Efraín');

  filtro = signal('');

  productos = signal<Producto[]>([
    { nombre: 'Yuca', precio: 2800, cantidad: 3 },
    { nombre: 'Ñame', precio: 4200, cantidad: 2 },
    { nombre: 'Plátano', precio: 1500, cantidad: 6 },
    { nombre: 'Mango', precio: 1800, cantidad: 12 },
    { nombre: 'Guayaba', precio: 1200, cantidad: 0 },
  ]);

  total = computed(() =>
    this.productos().reduce((suma, p) => suma + p.precio * p.cantidad, 0),
  );

  unidades = computed(() =>
    this.productos().reduce((suma, p) => suma + p.cantidad, 0),
  );

  visibles = computed(() => {
    const texto = this.filtro().toLowerCase().trim();
    if (texto === '') return this.productos();
    return this.productos().filter((p) => p.nombre.toLowerCase().includes(texto));
  });

  // ===========================================================================
  //  RETO S02 · los cinco puntos
  // ===========================================================================

  // Punto 1 · contar los productos agotados
  agotados = computed(() =>
    this.productos().filter((p) => p.cantidad === 0).length,
  );

  // Punto 2 · aviso de inventario bajo (cantidad entre 1 y 2, ambos incluidos)
  hayInventarioBajo = computed(() =>
    this.productos().some((p) => p.cantidad >= 1 && p.cantidad <= 2),
  );

  // Punto 3 · el producto más caro (ojo con la lista vacía)
  productoMasCaro = computed(() => {
    const lista = this.productos();
    if (lista.length === 0) return null;
    return lista.reduce((masCaro, p) => (p.precio > masCaro.precio ? p : masCaro), lista[0]);
  });

  // Punto 5 · ordenar por subtotal de mayor a menor, SIN mutar la signal
  // [...this.productos()] copia el arreglo antes de ordenar la copia.
  ordenados = computed(() =>
    [...this.productos()].sort(
      (a, b) => (b.precio * b.cantidad) - (a.precio * a.cantidad),
    ),
  );

  // ===========================================================================
  //  MÉTODOS
  // ===========================================================================

  vender(nombre: string) {
    this.productos.update((lista) =>
      lista.map((p) =>
        p.nombre === nombre && p.cantidad > 0
          ? { ...p, cantidad: p.cantidad - 1 }
          : p,
      ),
    );
  }

  reabastecer(nombre: string) {
    this.productos.update((lista) =>
      lista.map((p) => (p.nombre === nombre ? { ...p, cantidad: p.cantidad + 10 } : p)),
    );
  }

  // Punto 4 · vender todo lo que queda de un producto (deja su cantidad en 0)
  venderTodo(nombre: string) {
    this.productos.update((lista) =>
      lista.map((p) => (p.nombre === nombre ? { ...p, cantidad: 0 } : p)),
    );
  }

  onFiltrar(e: Event) {
    const caja = e.target as HTMLInputElement;
    this.filtro.set(caja.value);
  }

  limpiarFiltro() {
    this.filtro.set('');
  }
}