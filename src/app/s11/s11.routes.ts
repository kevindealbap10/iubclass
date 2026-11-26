import { Routes } from '@angular/router';
import { S11 } from './s11';
import { autenticadoGuard, autenticadoMatch } from './guards';

// =============================================================================
//  S11 · Mapa de rutas de la sesión · se carga con loadChildren desde app.routes.ts
//    /s11          -> redirige a /s11/perfil (si no hay sesión, el guard lleva al login)
//    /s11/login    -> Login            pública
//    /s11/perfil   -> PerfilVista      canActivate: la ruta coincide y el guard decide
//    /s11/tareas   -> TareasProtegidas canMatch: sin sesión, la ruta no coincide y el
//                                      componente no se descarga
// =============================================================================

export const S11_ROUTES: Routes = [
  {
    path: '',
    component: S11,
    children: [
      { path: '', redirectTo: 'perfil', pathMatch: 'full' },
      { path: 'login', title: 'S11 · Login', loadComponent: () => import('./login/login').then((m) => m.Login) },
      {
        path: 'perfil', title: 'S11 · Perfil', canActivate: [autenticadoGuard],
        loadComponent: () => import('./perfil/perfil').then((m) => m.PerfilVista),
      },
      {
        path: 'tareas', title: 'S11 · Tareas', canMatch: [autenticadoMatch],
        loadComponent: () => import('./tareas/tareas-protegidas').then((m) => m.TareasProtegidas),
      },
    ],
  },
];
