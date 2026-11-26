# Guía del Taller 10 · Inventario con acceso restringido

Esta guía ordena el trabajo y señala qué ejemplo de `/s11` consultar en cada paso. No contiene la solución: el taller
protege el inventario de productos de la categoría groceries, con criterios distintos a los del perfil y las tareas de
la clase.

Se trabaja en `src/app/taller10`, con las rutas `/taller10/ingreso` y `/taller10/inventario` cargadas con
`loadChildren` desde `app.routes.ts`. API: `https://dummyjson.com` (o `/api` con `npm run api`).

| Paso | Qué construir | Ejemplo a consultar | Qué cambia en el taller | Comprobación |
|---|---|---|---|---|
| 1 | Rutas de `/taller10` con `loadChildren` | `s11/s11.routes.ts` y la ruta `s11` de `app.routes.ts` | Dos rutas hijas: `ingreso` (pública) e `inventario` (protegida) | `/taller10/ingreso` abre |
| 2 | Servicio de sesión con signals | `s11/sesion.service.ts` | Sin renovación: basta iniciar, cerrar y guardar en `localStorage` con su propia clave | C6 y C8 |
| 3 | Formulario de ingreso | `s11/login/login.ts` | La clave mínima es de 6 caracteres; el destino por defecto es `/taller10/inventario` | C2, C3, C4 y C10 |
| 4 | Interceptor del token | `tokenInterceptor` en `s11/interceptores.ts` y `app.config.ts` | Agregue su interceptor a la lista existente de `withInterceptors`; filtre las peticiones `/auth/` distintas de `/auth/login` | C5 y C7 en F12 > Red > Encabezados |
| 5 | Inventario protegido | `s11/tareas/tareas-protegidas.ts` y el Taller 09 | `GET /auth/products/category/groceries?limit=0&select=title,price,stock`; contador «Reponer» (stock < 10) | C5 |
| 6 | Guard de la ruta | `autenticadoGuard` en `s11/guards.ts` | Redirige a `/taller10/ingreso` con `?volver=` | C1 |
| 7 | «Salir» y manejo del 401 | `S11.salir()` y `renovacionInterceptor` | No se renueva: ante un 401, cerrar la sesión y navegar al ingreso con el mensaje | C8 y C9 |
| 8 | Compilación | `CLASE_S11.md`, sección «Compilar y publicar» | Transcriba la carpeta de salida y el tamaño del paquete inicial | A3 |

Commit de avance: «T10: avance» con los pasos 1 a 3, hasta el miércoles 2 de diciembre de 2026, 23:59.

## Cómo probar C9 sin esperar demasiado

Envíe `expiresInMins: 1` en el ingreso (cambie el valor temporalmente en su servicio), espere un minuto y recargue el
inventario. Con el servidor propio también vale `expiresInMins: 0.25` (15 segundos). Devuelva el valor a 30 antes de
entregar.

## Entrega

Dos archivos en la actividad «Taller 10», con el enlace de su fork en el texto en línea, hasta el domingo 6 de
diciembre de 2026, 23:59:

- `COM30_Taller10_Apellido.zip`: el proyecto sin `node_modules`, `dist` ni `.angular` (menos de 10 MB).
- `COM30_Taller10_Apellido.pdf`: el enunciado con las tablas B y C y las dos capturas.
