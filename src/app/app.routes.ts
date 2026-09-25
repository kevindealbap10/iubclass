import { Routes } from '@angular/router';
import { Tablero } from './tablero/tablero';
import { Acerca } from './acerca/acerca';
import { S03 } from './s03/s03';
import { FrutasComponent } from './frutas/frutas';

// El mapa de rutas de la aplicación: qué componente se muestra en cada URL.
// Esto se ve completo en la S09. Hoy solo dejamos el esqueleto para que la
// aplicación tenga dónde crecer: dos vistas y una redirección.
export const routes: Routes = [
  { path: '', redirectTo: 'tablero', pathMatch: 'full' },
  { path: 'tablero', component: Tablero },
  { path: 's03', component: S03 }, // ejemplos de la sesión S03
  { path: 'acerca', component: Acerca },
    { path: 'frutas', component: FrutasComponent },
  { path: '**', redirectTo: 'tablero' }, // cualquier otra URL vuelve al tablero
];
