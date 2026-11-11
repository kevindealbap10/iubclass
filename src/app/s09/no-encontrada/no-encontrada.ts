import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

// =============================================================================
//  S09 · Ejemplo 4 · Vista 404 · ruta comodín ** · Diapositiva 23
// -----------------------------------------------------------------------------
//  ** coincide con cualquier dirección que ninguna ruta anterior atendió.
//  Por eso va SIEMPRE al final del arreglo de rutas.
//
//  Resultado: /s09/ofertas -> «La dirección /s09/ofertas no existe».
//  Compárese con /s09/productos/99: esa ruta sí existe; falta el registro.
// =============================================================================

@Component({
  selector: 'app-no-encontrada',
  imports: [RouterLink],
  template: `
    <div class="max-w-md rounded-xl bg-red-50 p-4 text-red-800">
      <p class="text-3xl font-black">404</p>
      <p data-testid="404">La dirección <b class="font-mono">{{ url }}</b> no existe.</p>
      <a routerLink="/s09/productos" class="mt-2 inline-block font-semibold underline">Ir al listado</a>
    </div>
  `,
})
export class NoEncontrada {
  readonly url = inject(Router).url;
}
