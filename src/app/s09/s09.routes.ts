import { Routes } from '@angular/router';
import { S09 } from './s09';
import { ListaProductos } from './lista/lista';
import { DetalleProducto } from './detalle/detalle';
import { NoEncontrada } from './no-encontrada/no-encontrada';
import { PanelFicha } from './panel/panel-ficha';

// =============================================================================
//  S09 · Mapa de rutas de la sesión · se carga con loadChildren desde app.routes.ts
// -----------------------------------------------------------------------------
//  S09 es la ruta PADRE: dibuja el encabezado, el menú y la barra de dirección,
//  y deja un <router-outlet /> para sus HIJAS. Cada hija se lee pegada a /s09:
//
//    /s09                     -> redirige a /s09/productos
//    /s09/productos           -> ListaProductos      (filtro con ?categoria=)
//    /s09/productos/:id       -> DetalleProducto     (:id llega a un input())
//    /s09/resumen             -> Resumen             (loadComponent: carga diferida)
//    /s09/cualquier-otra-cosa -> NoEncontrada        (comodín **, siempre al final)
//
//  Ruta SECUNDARIA (outlet con nombre «panel»), se muestra junto a la principal:
//    /s09/(productos//panel:ficha/8) -> ListaProductos + PanelFicha
//
//  El orden importa: el enrutador recorre la lista de arriba abajo y se queda
//  con la primera ruta que coincide. Si ** estuviera primero, todo sería 404.
// =============================================================================

export const S09_ROUTES: Routes = [
  {
    path: '',
    component: S09,
    children: [
      { path: '', redirectTo: 'productos', pathMatch: 'full' },
      { path: 'productos', component: ListaProductos, title: 'S09 · Productos' },
      { path: 'productos/:id', component: DetalleProducto, title: 'S09 · Detalle' },
      {
        path: 'resumen',
        title: 'S09 · Resumen',
        // El archivo resumen.ts no viaja en el paquete inicial: se descarga la
        // primera vez que alguien entra a /s09/resumen (F12 > Red lo muestra).
        loadComponent: () => import('./resumen/resumen').then((m) => m.Resumen),
      },
      // ruta secundaria: va al <router-outlet name="panel" />, no al principal
      { path: 'ficha/:id', component: PanelFicha, outlet: 'panel' },
      { path: '**', component: NoEncontrada, title: 'S09 · No encontrada' },
    ],
  },
];
