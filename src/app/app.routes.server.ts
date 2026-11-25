import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // S09 · rutas con :id: se generan en el navegador, no al compilar
  { path: 's09/**', renderMode: RenderMode.Client },
  // S10 · las peticiones HTTP se hacen en el navegador, no al compilar
  { path: 's10/**', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
