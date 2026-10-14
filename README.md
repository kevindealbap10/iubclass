# COM30 · Programación con Frameworks para Web

Proyecto de la clase, construido sesión por sesión con Angular 22. Cada sesión se publica en un
commit propio.

> **Institución Universitaria de Barranquilla · 2026-III**
> Docente: Kevin Erney De Alba Pomárico · `kerneydealba@unibarranquilla.edu.co`

---

## Contenido por sesión

| Sesión | Ruta en la aplicación | Código | Documento |
|---|---|---|---|
| **S02** · Bindings, signals y computed | `/tablero` | `src/app/tablero/` | `CLASE_S02_PASOS.md` |
| **S03** · Control de flujo, pipes y estilos | `/s03` | `src/app/s03/` | `CLASE_S03.md` |

Versiones de un solo archivo para StackBlitz: `_para-stackblitz/main.ts` (S02) y
`_para-stackblitz/s03-main.ts` (S03).

La configuración regional es-CO (formato $ 1.800 y 3,14) está en `src/app/app.config.ts`.

---

## Cómo trabajar sobre este proyecto

Este repositorio es de consulta. Cada estudiante trabaja sobre su propia copia (fork).

### 1 · Fork

Botón **Fork**, arriba a la derecha. La dirección del fork, con el usuario propio en la URL, es
la que se entrega en los talleres.

### 2 · Actualizar el fork cuando se publica una sesión nueva

En la página del fork en GitHub: **Sync fork** → **Update branch**. Con Angular CLI, después:

```bash
git pull
```

### 3 · Abrir el proyecto

**Con Angular CLI:**

```bash
git clone https://github.com/USUARIO/iubclass.git
cd iubclass
npm install          # reconstruye node_modules
ng serve             # http://localhost:4200
```

**En StackBlitz:** abrir `https://stackblitz.com/github/USUARIO/iubclass`. Si no arranca, copiar
el archivo de `_para-stackblitz/` de la sesión y pegarlo dentro de `src/main.ts` de un proyecto
nuevo. Se reemplaza el **contenido** del archivo; el archivo no se elimina.

### 4 · Guardar el trabajo

```bash
git add .
git commit -m "Taller 02 · paso 2, filtro por categoría"
git push
```

Un `commit` por cada paso que funcione, no uno solo al final.

---

## Trabajo vigente

### Taller 02 · Listado con filtros, estados y pipe propio

Cierre: **miércoles 30 de septiembre de 2026, 16:59**, en el aula virtual.

- Enunciado oficial, datos de prueba y rúbrica: `COM30_S03_taller02.docx`, en el aula.
- Orden de trabajo y relación con los ejemplos de la clase: **`GUIA_TALLER_02.md`**.

Los ejemplos de `src/app/s03/` muestran las técnicas con otros datos y otros criterios. El taller
aplica esas técnicas a un caso distinto.

---

## Errores frecuentes y su significado

| Lo que se observa | Causa |
|---|---|
| En pantalla aparece el texto de una función | Falta el paréntesis al leer la signal: `{{ total }}` en vez de `{{ total() }}` |
| El botón no hace nada y no hay error | `(click)="vender"` sin paréntesis: nombra la función, no la invoca |
| La consola muestra el dato nuevo y la pantalla el anterior | Se modificó el estado con `push` o `++`. Se corrige con `update()` y un valor nuevo |
| `NG5002: @for loop must have a "track" expression` | Falta `track` en el `@for` |
| `NG8004: No pipe found with name '...'` | El pipe no está en `imports` del componente |
| `NG0701: Missing locale data for the locale "es-CO"` | Se declaró `LOCALE_ID` sin `registerLocaleData` |
| Al filtrar, el contenido de un campo queda en otra fila | `track $index` en una lista que se filtra (ejemplo 3 de la S03) |
| `Property 'value' does not exist on type 'EventTarget'` | Falta `as HTMLInputElement` sobre `$event.target` |

Un error con código (`NG5002`, `NG8004`) se busca con el código incluido en
[angular.dev](https://angular.dev).

---

## Versiones

Angular **22.1** · TypeScript **6.0** · Tailwind CSS **4.1** · Node **22.22.3 o superior**

La documentación de referencia es **angular.dev**. Un tutorial que use `$scope`, `*ngIf` como
sintaxis principal o `app.component.ts` corresponde a versiones anteriores.
