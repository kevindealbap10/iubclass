# COM30 · Guía de trabajo del Taller 08

**Rutas y navegación sobre su proyecto del Taller 07 · entrega única: martes 17 de noviembre de 2026, 23:59**

Esta guía ordena el trabajo en las cuatro etapas del enunciado (`COM30_S09_taller08.docx`, en el aula) e indica, para cada
una, qué archivo de la sesión S09 contiene la técnica y **qué cambia en su proyecto**. Los ejemplos de la clase usan el
inventario de productos; el taller se resuelve sobre el escenario de su Taller 07. La técnica se consulta; la solución se
escribe sobre sus datos.

---

## Antes de empezar

1. **Proyecto del Taller 07.** Abra su proyecto en Visual Studio Code y compruebe que arranca: `npm install` y
   `npx ng serve`. Los commits del taller llevan el prefijo «T08: …». Quien no entregó el Taller 07 parte del Taller 06.
2. **Referencia.** En el repositorio de la clase (Sync fork, `git pull`), la ruta `/s09` y `CLASE_S09.md`.
3. **Tabla A.** Escriba primero, en el enunciado, sus rutas: ruta, vista y parámetro. Ponga las rutas fijas
   (`/<recurso>/nueva`) **antes** de las de parámetro (`/<recurso>/:id`) y el comodín al final.

---

## E1 · Mapa (18:40 a 19:10)

| | |
|---|---|
| **Construya** | `withComponentInputBinding()` en `app.config.ts`; en `app.routes.ts`, la redirección de la ruta vacía, listado, alta, detalle, la vista diferida y `**`, cada una con `title`. Menú con `routerLink` y `routerLinkActive`. |
| **Consulte** | `src/app/s09/s09.routes.ts` y `src/app/s09/s09.ts`. |
| **Qué cambia en su proyecto** | Sus rutas cuelgan de la raíz de la aplicación, sin una ruta padre como `/s09`. El nombre del recurso es el de su escenario. |
| **Compruebe** | C1: `/` redirige al listado. C7: una dirección inventada muestra la 404. |

## E2 · Detalle (19:10 a 19:45)

| | |
|---|---|
| **Construya** | Componente de detalle con `input.required<string>()` del mismo nombre que el parámetro y un `computed` que busca el registro en el servicio. `@if` / `@else` con el mensaje de código inexistente. Cada fila del listado enlaza al detalle. |
| **Consulte** | `src/app/s09/detalle/detalle.ts`. |
| **Qué cambia en su proyecto** | Si su código es texto (R05), se compara como texto; si es número, se convierte con `Number()`. |
| **Compruebe** | C5 y C6. |

## E3 · Filtro en la dirección (19:45 a 20:15)

| | |
|---|---|
| **Construya** | En el listado, `input<string>()` del parámetro de consulta (`estado` u otro de su escenario), enlaces de filtro con `routerLink="."` y `[queryParams]`, `computed` con los visibles y `@empty`. |
| **Consulte** | `src/app/s09/lista/lista.ts`. |
| **Qué cambia en su proyecto** | El filtro del Taller 07 que estaba en una signal pasa a la dirección. La búsqueda reactiva del Taller 07 puede quedarse como está. |
| **Compruebe** | C2, C3 (F5) y C4. |

## E4 · Alta y vista diferida (20:15 a 20:50)

| | |
|---|---|
| **Construya** | La vista de alta con el formulario reactivo de su proyecto; al guardar un alta válida, el servicio agrega el registro y devuelve su código, y el componente llama a `router.navigate` con el detalle. Una vista con `loadComponent`. |
| **Consulte** | `irA()` en `src/app/s09/detalle/detalle.ts` y la ruta `resumen` en `s09.routes.ts`. |
| **Qué cambia en su proyecto** | En la clase se navega desde un cuadro de texto; en su proyecto, después de guardar. |
| **Compruebe** | C8 y C9 (F12 > Red, filtro JS). |

---

## Antes de entregar

- `npx ng build` sin errores.
- README con la tabla de rutas.
- Tablas A y B completas en el enunciado, con las dos capturas (C5 con la dirección visible y F12 > Red de C9).
- `COM30_Taller08_Apellido.pdf` en la actividad «Taller 08», con el enlace del repositorio en el texto en línea.
