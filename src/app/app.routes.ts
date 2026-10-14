import { Routes } from '@angular/router';
import { Tablero } from './tablero/tablero';
import { Acerca } from './acerca/acerca';
import { S03 } from './s03/s03';
import { Frutas } from './frutas/frutas.component';
import { Taller02 } from './taller02/taller02';
import { Inventario } from './parcial1/inventario';

// El mapa de rutas de la aplicación: qué componente se muestra en cada URL.
// Esto se ve completo en la S09. Hoy solo dejamos el esqueleto para que la
// aplicación tenga dónde crecer: dos vistas y una redirección.
export const routes: Routes = [
  { path: '', redirectTo: 'tablero', pathMatch: 'full' },
  { path: 'tablero', component: Tablero },
  { path: 'taller01', component: Frutas }, // Taller 01 · el puesto de frutas
  { path: 'taller02', component: Taller02 }, // Taller 02 · inventario con filtros
  { path: 'parcial1', component: Inventario }, // Parcial 1 · inventario con componentes que se comunican
  { path: 's03', component: S03 }, // ejemplos de la sesión S03
  { path: 'acerca', component: Acerca },
  { path: '**', redirectTo: 'tablero' }, // cualquier otra URL vuelve al tablero
];
