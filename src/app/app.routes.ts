import { Routes } from '@angular/router';
import { Tablero } from './tablero/tablero';
import { Acerca } from './acerca/acerca';
import { S03 } from './s03/s03';
import { S04 } from './s04/s04';
import { S05 } from './s05/s05';
import { S06 } from './s06/s06';
import { S07 } from './s07/s07';

// El mapa de rutas de la aplicación: qué componente se muestra en cada URL.
// Esto se ve completo en la S09. Hoy solo dejamos el esqueleto para que la
// aplicación tenga dónde crecer: dos vistas y una redirección.
export const routes: Routes = [
  { path: '', redirectTo: 'tablero', pathMatch: 'full' },
  { path: 'tablero', component: Tablero },
  { path: 's03', component: S03 }, // ejemplos de la sesión S03
  { path: 's04', component: S04 }, // ejemplos de la sesión S04
  { path: 's05', component: S05 }, // ejemplos de la sesión S05
  { path: 's06', component: S06 }, // ejemplos de la sesión S06
  { path: 's07', component: S07 }, // ejemplos de la sesión S07
  // ejemplos de la sesión S08; carga diferida para no pasar el presupuesto del paquete inicial
  { path: 's08', loadComponent: () => import('./s08/s08').then((m) => m.S08) },
  { path: 'acerca', component: Acerca },
  { path: '**', redirectTo: 'tablero' }, // cualquier otra URL vuelve al tablero
];
