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
    { nombre: 'Mango', precio: 1800, cantidad: 12 },
    { nombre: 'Guayaba', precio: 1200, cantidad: 8 },
    { nombre: 'Patilla', precio: 6500, cantidad: 2 },
    { nombre: 'Maracuyá', precio: 3400, cantidad: 5 },
    { nombre: 'Níspero', precio: 2900, cantidad: 4 },
  ]);


  total = computed(() =>
    this.productos().reduce((suma, p) => suma + p.precio * p.cantidad, 0),
  );

  
  unidades = computed(() =>
    this.productos().reduce((suma, p) => suma + p.cantidad, 0),
  );

 ordenados = computed(() =>[... this.productos()].sort((a,b) => 
  (b.precio * b.cantidad) - (a.precio * a.cantidad)
));
  
  visibles = computed(() => {
    const texto = this.filtro().toLowerCase().trim();
    if (texto === '') return this.ordenados();
    return this.ordenados().filter((p) => p.nombre.toLowerCase().includes(texto));
  });

  
  vender(nombre: string) {
    this.productos.update((lista) =>
      lista.map((p) =>
        p.nombre === nombre && p.cantidad > 0
          ? { ...p, cantidad: p.cantidad - 1 }  
          : p,
      ),
    );
    
  }

  venderLote(nombre: string){
    this.productos.update((lista) =>
      lista.map((p) =>
        p.nombre === nombre && p.cantidad > 0 
          ? { ...p, cantidad: 0}
          : p,
      ),
    );
  }

  reabastecer(nombre: string) {
    this.productos.update((lista) =>
      lista.map((p) => (p.nombre === nombre ? { ...p, cantidad: p.cantidad + 10 } : p)),
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
