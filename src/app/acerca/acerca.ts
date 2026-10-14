import { Component } from '@angular/core';

// Componente mínimo: sirve para tener una SEGUNDA vista y poder navegar.
// La plantilla va aquí adentro (template) en vez de en un archivo aparte,
// porque son ocho líneas. Con veinte o más, archivo aparte.
@Component({
  selector: 'app-acerca',
  template: `
    <h2 class="text-2xl font-bold text-slate-900">Acerca del módulo</h2>
    <p class="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
      COM30 · Programación con Frameworks para Web. Construimos una aplicación de
      una sola página con Angular 22: componentes y plantillas, formularios,
      navegación y conexión con un servidor.
    </p>
    <p class="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
      Esta segunda vista existe solo para demostrar que la navegación funciona
      sin recargar la página. Miren la barra de arriba al cambiar de vista: la
      URL cambia, pero el navegador no parpadea. Eso es una SPA.
    </p>
  `,
})
export class Acerca {}
