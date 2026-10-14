import { Component, computed, signal } from '@angular/core';

// El modelo: la FORMA que tiene cada fruta. TypeScript nos avisa si escribimos
// f.precoi en vez de f.precio.
interface Fruta {
  nombre: string;
  precio: number;
  cantidad: number;
}

@Component({
  selector: 'app-frutas',
  templateUrl: './frutas.component.html',
})
export class Frutas {
  // ===========================================================================
  //  EL ESTADO — una sola signal, leída SIEMPRE con paréntesis: frutas()
  // ===========================================================================
  frutas = signal<Fruta[]>([
    { nombre: 'Mango', precio: 1800, cantidad: 12 },
    { nombre: 'Guayaba', precio: 1200, cantidad: 8 },
    { nombre: 'Patilla', precio: 6500, cantidad: 2 },
    { nombre: 'Maracuyá', precio: 3400, cantidad: 5 },
    { nombre: 'Níspero', precio: 2900, cantidad: 4 },
  ]);

  // Subtotal de una fila. Es una función pura: misma entrada, misma salida.
  // Se calcula, nunca se escribe a mano en la plantilla.
  subtotal = (f: Fruta): number => f.precio * f.cantidad;

  // ===========================================================================
  //  LOS VALORES DERIVADOS — computed(). No se guardan: se deducen del estado.
  //  Cada uno queda suscrito a las signals que lee y se recalcula solo.
  // ===========================================================================

  // Requisito 2 · Total en dinero: suma de los subtotales.
  totalDinero = computed(() =>
    this.frutas().reduce((suma, f) => suma + this.subtotal(f), 0),
  );

  // Requisito 4 · Total de unidades: suma de las CANTIDADES, no de los precios.
  totalUnidades = computed(() =>
    this.frutas().reduce((suma, f) => suma + f.cantidad, 0),
  );

  // Requisito 5 · La CONDICIÓN del mensaje también es un computed.
  esMayorista = computed(() => this.totalDinero() > 50000);

  // Reto 1 · Productos agotados: filter devuelve arreglo NUEVO; .length cuenta.
  agotados = computed(
    () => this.frutas().filter((f) => f.cantidad === 0).length,
  );

  // Reto 2 · ¿Hay inventario bajo? (alguna cantidad entre 1 y 2, incluidas).
  inventarioBajo = computed(() =>
    this.frutas().some((f) => f.cantidad >= 1 && f.cantidad <= 2),
  );

  // Reto 3 · El más caro con reduce. El valor inicial es null: con la lista
  // vacía devuelve null y la plantilla maneja ese caso con @if / @else.
  masCaro = computed<Fruta | null>(() =>
    this.frutas().reduce<Fruta | null>(
      (masCaro, f) => (masCaro === null || f.precio > masCaro.precio ? f : masCaro),
      null,
    ),
  );

  // Reto 5 · Orden por subtotal (de mayor a menor).
  // OJO: NUNCA [...].sort() directo sobre this.frutas(): sort modifica el arreglo.
  // Primero se COPIA con el operador de propagación [...lista]; la copia sí
  // puede ordenarse sin tocar el estado de la signal.
  porSubtotal = computed(() =>
    [...this.frutas()].sort((a, b) => this.subtotal(b) - this.subtotal(a)),
  );

  // Qué se muestra en la tabla ahora: el orden natural del puesto, o el orden
  // por subtotal. alternarOrden() decide.
  orden = signal<'natural' | 'subtotal'>('natural');

  filas = computed(() =>
    this.orden() === 'subtotal' ? this.porSubtotal() : this.frutas(),
  );

  // ===========================================================================
  //  LOS MÉTODOS — siempre con .update() devolviendo un arreglo NUEVO.
  //  Nunca this.frutas()[0].cantidad-- : eso muta por dentro y la signal
  //  no se entera (los datos cambian en consola, pero la pantalla no).
  // ===========================================================================

  // Requisito 3 · Vender una unidad de una fruta.
  vender(nombre: string) {
    this.frutas.update((lista) =>
      lista.map((f) =>
        f.nombre === nombre && f.cantidad > 0
          ? { ...f, cantidad: f.cantidad - 1 } // fruta NUEVA con una menos
          : f, //                                  las demás, tal cual
      ),
    );
  }

  // Reto 4 · Vender todo lo que queda: la cantidad pasa a 0.
  venderTodo(nombre: string) {
    this.frutas.update((lista) =>
      lista.map((f) => (f.nombre === nombre ? { ...f, cantidad: 0 } : f)),
    );
  }

  alternarOrden() {
    this.orden.update((o) => (o === 'natural' ? 'subtotal' : 'natural'));
  }
}