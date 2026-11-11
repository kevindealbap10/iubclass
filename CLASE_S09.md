# COM30 · Sesión S09 · Routing y navegación

**Miércoles 11 de noviembre de 2026 · ruta `/s09` · carpeta `src/app/s09/`**

## Cómo abrir los ejemplos

1. En GitHub: **Sync fork > Update branch**.
2. En la terminal de Visual Studio Code: `git pull`, `npm install`, `npx ng serve`.
3. En el navegador: `http://localhost:4200/s09`. La barra **URL** de la página muestra la dirección que el enrutador acaba de resolver.

## Archivos

| Archivo | Qué muestra | Diapositivas |
|---|---|---|
| `src/app/app.config.ts` | `provideRouter(routes, withComponentInputBinding())` | 9, 18 |
| `src/app/app.routes.ts` | la ruta `s09` con `loadChildren` | 9, 27 |
| `src/app/s09/s09.routes.ts` | mapa de rutas hijas: redirección, `:id`, `loadComponent`, `**` | 10, 27 |
| `src/app/s09/s09.ts` | menú con `routerLink` y `routerLinkActive`, barra URL y `<router-outlet />` | 11, 12 |
| `src/app/s09/detalle/detalle.ts` | `:id` en `input.required()`, `computed`, código inexistente y `router.navigate` | 19 – 21, 24 |
| `src/app/s09/lista/lista.ts` | `?categoria=` en `input()`, `queryParams` y enlaces relativos | 22, 23 |
| `src/app/s09/resumen/resumen.ts` | vista con carga diferida | 29 |
| `src/app/s09/no-encontrada/no-encontrada.ts` | vista 404 | 30 |
| `src/app/s09/panel/panel-ficha.ts` | ruta secundaria: `outlet: 'panel'` y `<router-outlet name="panel" />` | 39, 40 |
| `src/app/app.routes.server.ts` | `s09/**` con `RenderMode.Client` (rutas con `:id` y prerender) | 31 |

## Resultados esperados

| Dirección | Resultado |
|---|---|
| `/s09` | redirige a `/s09/productos` · 14 productos |
| `/s09/productos?categoria=Frutas` · `Verduras` · `Granos` | 5 · 5 · 4 (Arroz, Lenteja, Fríjol, Maíz) |
| `/s09/productos?categoria=Lacteos` | 0 y el mensaje de `@empty` |
| `/s09/productos/8` | Banano · Frutas · $ 900 · 30 unidades |
| `/s09/productos/99` y `/s09/productos/abc` | «No existe un producto con el código …» (no es la 404) |
| `/s09/resumen` | Frutas $ 89.600 · Verduras $ 63.100 · Granos $ 169.300 · Total $ 322.000 |
| `/s09/ofertas` | vista 404 con la dirección pedida |
| `/s09/(productos//panel:ficha/8)` | listado y, al lado, la ficha de Banano en el panel |
| `/s09/(resumen//panel:ficha/8)` | cambia la vista principal; el panel sigue abierto |
| `/s09/(productos//panel:ficha/99)` | el panel informa que el producto 99 no existe |

## Ejercicio de la diapositiva 13 · una ruta nueva

El repositorio queda con el resultado final (pasos 2 y 3). Para repetir el ejercicio, siga los cuatro pasos en
`src/app/s09/s09.routes.ts` y `src/app/s09/s09.ts`.

| Paso | Qué hacer | Qué debe observarse | Qué error previene |
|---|---|---|---|
| 1 | Mueva `{ path: 'ayuda', component: ListaProductos }` **debajo** de `{ path: '**', ... }` y abra `/s09/ayuda` | La vista 404: «La dirección /s09/ayuda no existe» | Ver que el comodín captura todo lo que está debajo |
| 2 | Devuelva la línea **encima** de `'**'` | `/s09/ayuda` muestra el listado de 14 productos | Rutas inalcanzables por el orden |
| 3 | En el `<nav>` de `s09.ts`: `<a routerLink="ayuda" routerLinkActive="activo" class="opcion">Ayuda</a>` | Al pulsar «Ayuda», la opción se pinta de azul | Enlaces que no marcan la vista actual |
| 4 | Cambie ese enlace por `<a href="/s09/ayuda" class="opcion">Ayuda</a>` y púlselo | La página parpadea: se recargó completa | Usar `href` en enlaces internos |

Al terminar, deshaga el paso 4 (vuelva a `routerLink`).

## Qué comprobar en el navegador

- Con el filtro Granos activo, **F5** conserva el filtro y **Atrás** lo deshace.
- En `/s09/productos/8`, la opción «Productos» del menú sigue resaltada; «Inicio» no, porque usa `{ exact: true }`.
- «Vista rápida» abre la ficha en el panel sin salir del listado; «Cerrar panel» quita solo el panel (`{ outlets: { panel: null } }`).
- F12 > Red, filtro JS: el archivo de `resumen` se descarga la primera vez que se abre la vista, y no otra vez.

La guía del Taller 08 está en `GUIA_TALLER_08.md`.
