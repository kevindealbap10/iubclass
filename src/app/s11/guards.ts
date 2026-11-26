import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { SesionService } from './sesion.service';

// =============================================================================
//  S11 · Guards funcionales · Diapositivas 21 a 23
// -----------------------------------------------------------------------------
//  Un guard es una función que el router consulta antes de navegar.
//    true      -> la navegación sigue
//    UrlTree   -> el router redirige a esa dirección (aquí, al login con ?volver=)
//
//  canActivate: la ruta ya coincidió; el guard decide si se muestra.
//  canMatch:    el guard decide si la ruta coincide; si no, el código de esa
//               ruta diferida ni siquiera se descarga.
//
//  El guard protege la VISTA. Los datos los protege el servidor con el 401:
//  quien escriba la URL de la API en el navegador sin token recibe 401.
// =============================================================================

export const autenticadoGuard: CanActivateFn = (_ruta, estado) => {
  const sesion = inject(SesionService);
  return sesion.estaAutenticado()
    ? true
    : inject(Router).createUrlTree(['/s11/login'], { queryParams: { volver: estado.url } });
};

export const autenticadoMatch: CanMatchFn = (_ruta, segmentos) => {
  const sesion = inject(SesionService);
  const destino = '/s11/' + segmentos.map((s) => s.path).join('/');
  return sesion.estaAutenticado()
    ? true
    : inject(Router).createUrlTree(['/s11/login'], { queryParams: { volver: destino } });
};
