import { Routes } from '@angular/router';
import { S10 } from './s10';

// =============================================================================
//  S10 · Mapa de rutas de la sesión · se carga con loadChildren desde app.routes.ts
//    /s10          -> redirige a /s10/tareas
//    /s10/tareas   -> ListaTareas   (httpResource, HttpParams)
//    /s10/editor   -> EditorTareas  (post, patch, delete)
//    /s10/buscar   -> BuscarTarea   (get por id, ?id=, catchError)
// =============================================================================

export const S10_ROUTES: Routes = [
  {
    path: '',
    component: S10,
    children: [
      { path: '', redirectTo: 'tareas', pathMatch: 'full' },
      { path: 'tareas', title: 'S10 · Lectura', loadComponent: () => import('./lectura/lista-tareas').then((m) => m.ListaTareas) },
      { path: 'editor', title: 'S10 · Escritura', loadComponent: () => import('./escritura/editor-tareas').then((m) => m.EditorTareas) },
      { path: 'buscar', title: 'S10 · Buscar', loadComponent: () => import('./buscar/buscar-tarea').then((m) => m.BuscarTarea) },
    ],
  },
];
