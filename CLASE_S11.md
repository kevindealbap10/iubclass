# Sesión S11 · Interceptores, rutas protegidas y despliegue

Miércoles 2 de diciembre de 2026 · ruta `/s11` · autenticación con token contra `https://dummyjson.com/auth` o
contra el servidor propio de la clase (`npm run api`, base `/api`).

## Arranque

```
# En GitHub: Sync fork > Update branch
git pull
npm install

# Terminal 1
npx ng serve
# Terminal 2 (servidor propio con /auth)
npm run api

# http://localhost:4200/s11 con F12 > Red (filtro Fetch/XHR)
```

En StackBlitz: `stackblitz.com/github/USUARIO/iubclass`, `npm run api` en una segunda terminal (botón «+» del panel
de terminales) y `/s11` en la vista previa. Si el servidor propio no arranca, el selector «dummyjson» funciona igual.

Usuarios de prueba (los mismos en dummyjson y en el servidor propio):

| Usuario | Clave | Nombre |
|---|---|---|
| `emilys` | `emilyspass` | Emily Johnson |
| `michaelw` | `michaelwpass` | Michael Williams |
| `sophiab` | `sophiabpass` | Sophia Brown |

## Archivos

| Archivo | Diapositivas | Qué muestra |
|---|---|---|
| `src/app/app.config.ts` | 9, 30, 31 | `provideHttpClient(withInterceptors([...]))` y, comentadas, `withHashLocation()` y `withPreloading()` |
| `src/app/s11/interceptores.ts` | 7 a 12, 24, 25 | `tokenInterceptor`, `registroInterceptor`, `reintentoInterceptor` y `renovacionInterceptor` |
| `src/app/s11/sesion.service.ts` | 15, 16 | Sesión en una signal privada, `computed` de solo lectura, `localStorage`, `renovar()` |
| `src/app/s11/guards.ts` | 21 a 23 | `CanActivateFn` y `CanMatchFn` que redirigen al login con `?volver=` |
| `src/app/s11/login/login.ts` | 17, 18 | Formulario reactivo de ingreso, mensaje del 400 y vuelta a `?volver=` |
| `src/app/s11/perfil/perfil.ts` | 21, 24, 25 | Ruta con `canActivate`; `GET /auth/me` sin escribir la cabecera; «Token alterado» |
| `src/app/s11/tareas/tareas-protegidas.ts` | 22, 23 | Ruta con `canMatch`; `GET /auth/todos` |
| `src/app/s11/s11.ts` y `s11.routes.ts` | 5 | Vista padre: origen, estado de la sesión, menú y bitácora de peticiones |
| `api/servidor.mjs` | 23 | `/auth/login`, `/auth/me`, `/auth/refresh` y `/auth/<recurso>` protegidas con Bearer |

## Resultados que deben verse

| Acción | Resultado |
|---|---|
| `/s11/perfil` sin sesión | la barra queda en `/s11/login?volver=%2Fs11%2Fperfil` y no sale ninguna petición a `/auth/me` |
| Clave de 6 caracteres | el botón «Entrar» sigue deshabilitado |
| `emilys` con clave errada | POST `/auth/login` → 400 · «Invalid credentials» |
| `emilys / emilyspass` | 200 · vuelve a `/s11/perfil` · Emily Johnson · emily.johnson@x.dummyjson.com · admin |
| F12 > Red > `me` > Encabezados | `Authorization: Bearer eyJhbGciOiJIU…`; el POST de login no la lleva |
| `/s11/tareas` con sesión | 254 tareas · página 1 con 2 completas |
| Token de 1 minuto y «Recargar» pasado el minuto | bitácora: GET `/auth/me` 401 → POST `/auth/refresh` 200 → GET `/auth/me` 200; la hora de vencimiento cambia |
| «Token alterado» y «Recargar» (servidor propio) | 401 «invalid token», la sesión se cierra y el login muestra «La sesión se cerró: invalid token» |
| `/s11/tareas` sin sesión, en la compilación de producción | se descarga el archivo del login y no el de `tareas-protegidas` |
| `http://localhost:4200/api/auth/todos` en una pestaña nueva | 401 `{"message":"Access Token is required"}` |

## El servidor propio con autenticación

`api/servidor.mjs` imita la autenticación de dummyjson sin dependencias: firma los tokens JWT con HMAC SHA-256
(`node:crypto`). Las rutas públicas de la S10 no cambian: el Taller 09 sigue funcionando igual.

| Petición | Respuesta |
|---|---|
| `POST /auth/login` `{ username, password, expiresInMins }` | 200 con el usuario, `accessToken` y `refreshToken` · 400 «Invalid credentials» · 400 «Username and password required» |
| `GET /auth/me` con `Authorization: Bearer <accessToken>` | 200 con el usuario |
| `POST /auth/refresh` `{ refreshToken, expiresInMins }` | 200 con tokens nuevos · 401 «Refresh token required» |
| `GET /auth/products/1` (cualquier ruta pública con el prefijo `/auth`) | la misma respuesta de `/products/1`, pero exige el token |
| sin token · token vencido · token alterado | 401 «Access Token is required» · 401 «Token Expired!» · 401 «invalid token» |

Diferencias deliberadas con dummyjson: un token alterado responde 401 (dummyjson responde 500) y el `refreshToken`
no sirve como token de acceso. `expiresInMins` acepta fracciones (`0.25` son 15 segundos) para ver el vencimiento sin
esperar un minuto.

Error frecuente: si `npm run api` se dejó corriendo desde la S10, hay que detenerlo (Ctrl+C) y volver a iniciarlo para
que tome las rutas `/auth`. Sin reiniciar, `/api/auth/login` responde 404 «Ruta no encontrada».

## Compilar y publicar

```
npx ng build
# Output location: dist/iubClase
#   browser/                 lo que se publica (HTML, JS, CSS)
#   browser/index.csr.html   la página que debe responder el servidor en las rutas del router
```

Comprobado con un servidor de archivos estáticos sobre `dist/iubClase/browser`: sin configuración, `/tablero` responde
200 (está prerenderizada) y `/s10/tareas` y `/s11/tareas` responden 404 al recargar. Con *fallback* a
`index.csr.html`, las dos responden 200. La alternativa sin tocar el servidor es `withHashLocation()` en
`app.config.ts`: las direcciones pasan a ser `/#/s10/tareas`.
