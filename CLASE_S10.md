# Sesión S10 · HttpClient: conexión con el servidor

Miércoles 25 de noviembre de 2026 · ruta `/s10` · API pública `https://dummyjson.com/todos`.

## Arranque

```
# En GitHub: Sync fork > Update branch
git pull
npm install
npx ng serve
# http://localhost:4200/s10 con F12 > Red (filtro Fetch/XHR)
```

En StackBlitz: `stackblitz.com/github/USUARIO/iubclass` y `/s10` en la vista previa.

## Archivos

| Archivo | Diapositivas | Qué muestra |
|---|---|---|
| `src/app/app.config.ts` | 9 | `provideHttpClient()`; en Angular 22 HttpClient ya está en root y usa fetch |
| `src/app/s10/tarea.ts` | 11 | Interfaces `Tarea` y `PaginaTareas`: el contrato de datos |
| `src/app/s10/tareas.service.ts` | 10, 14, 15, 17, 22, 28, 29 | Única puerta al servidor: get, httpResource, post, patch, put, delete y `mensajeDe()` |
| `src/app/s10/lectura/lista-tareas.ts` | 17, 18 | httpResource con página como signal y tres estados |
| `src/app/s10/escritura/editor-tareas.ts` | 23, 24, 25 | Escrituras con estado local y bitácora de peticiones |
| `src/app/s10/buscar/buscar-tarea.ts` | 29, 30 | get por id, `?id=` en la dirección, 404 con mensaje |

## Resultados que deben verse

| Acción | Resultado |
|---|---|
| `/s10/tareas` | página 1 de 51 · 254 tareas · completas 2 de 5 |
| Siguiente | tareas 6 a 10 · completas 3 de 5 |
| F12 > Red > Sin conexión y Recargar | «No hay conexión con el servidor…» |
| Editor: Agregar | POST `/todos/add` → 201 · id 255 |
| Editor: marcar la tarea 1 | PATCH `/todos/1` → 200 |
| Editor: eliminar la tarea 5 | DELETE `/todos/5` → 200 · isDeleted true |
| Editor: marcar la tarea 255 | PATCH `/todos/255` → 404: la API simula las escrituras y no guardó el alta |
| `/s10/buscar?id=9999` | «No existe el registro solicitado (Todo with id '9999' not found).» |
