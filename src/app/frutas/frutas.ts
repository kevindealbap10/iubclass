import { Component, signal, computed } from '@angular/core';

interface Fruta {
  nombre: string;
  precio: number;
  cantidad: number;
}

@Component({
  selector: 'app-frutas',
  standalone: true,
  templateUrl: './frutas.html',
  styleUrl: './frutas.css',
})
export class FrutasComponent {
  frutas = signal<Fruta[]>([
    { nombre: 'Mango',    precio: 1800, cantidad: 12 },
    { nombre: 'Guayaba',  precio: 1200, cantidad: 8  },
    { nombre: 'Patilla',  precio: 6500, cantidad: 2  },
    { nombre: 'Maracuyá', precio: 3400, cantidad: 5  },
    { nombre: 'Níspero',  precio: 2900, cantidad: 4  },
  ]);

  // computed: se recalcula solo cuando frutas() cambia
  totalDinero = computed(() =>
    this.frutas().reduce((acc, f) => acc + f.precio * f.cantidad, 0)
  );

  totalUnidades = computed(() =>
    this.frutas().reduce((acc, f) => acc + f.cantidad, 0)
  );

  esMayorista = computed(() => this.totalDinero() > 50000);

  venderMango() {
    this.frutas.update(lista =>
      lista.map(f => f.nombre === 'Mango' ? { ...f, cantidad: f.cantidad - 1 } : f)
    ); // devuelve un arreglo NUEVO, no muta el original
  }
}