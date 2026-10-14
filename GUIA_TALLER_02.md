# COM30 · Guía de trabajo del Taller 02

**Listado con filtros, estados y pipe propio · cierre: miércoles 30 de septiembre de 2026, 16:59**

Esta guía ordena el trabajo e indica, para cada requisito, qué ejemplo de la clase contiene la
técnica y **qué cambia en el taller**. Los ejemplos de `src/app/s03/` usan otros datos y otros
criterios a propósito: muestran cómo se hace, no el resultado del taller. El enunciado oficial,
con los datos de prueba y la rúbrica, es `COM30_S03_taller02.docx`, en el aula.

---

## Antes de empezar

1. **Actualice su fork.** En la página de su fork en GitHub, botón **Sync fork** → **Update
   branch**. Así recibe los ejemplos de la S03. Con Angular CLI, después ejecute `git pull`.
2. Cree un componente nuevo para el taller. No modifique los ejemplos de `src/app/s03/`: son la
   referencia de consulta.
3. Tenga a mano la **tabla 2 del enunciado** (resultados esperados). Cada paso de esta guía
   termina con una comprobación contra ella.

---

## Orden de trabajo

Se construye en este orden porque cada paso se apoya en el anterior. Haga `commit` al terminar
cada paso que funcione.

### Paso 1 · Datos y tabla · R1

| | |
|---|---|
| **Construya** | La interfaz del producto (nombre, categoría, precio, cantidad), la signal con los seis productos de la tabla 1 y la tabla con `@for`. |
| **Consulte** | Ejemplo 2 (`@for` y `@empty`) y ejemplo 3 (`track`). |
| **Qué cambia en el taller** | El producto tiene un campo más, la categoría. El mensaje de `@empty` es el que indica el enunciado. |
| **Compruebe** | Aparecen las 6 filas. Vacíe la lista una vez y confirme que aparece el mensaje de `@empty`; luego restaure los datos. |
| **Error típico** | `track $index`. La lista de este taller se filtra: es descuento. |

### Paso 2 · Filtro por categoría · R2

| | |
|---|---|
| **Construya** | Una signal con la categoría seleccionada, cuatro botones que la cambian con `set()` y un `computed` con la lista visible. El `@for` pasa a recorrer la lista visible. |
| **Consulte** | Ejemplo 3 (`visibles` como `computed` que depende de otra signal) y, de la S02, el buscador de `src/app/tablero/`, que filtra por texto. |
| **Qué cambia en el taller** | Se filtra por igualdad de categoría, no por texto contenido, y existe la opción «Todas», que no filtra. |
| **Compruebe** | Todas: 6 filas · Frutas: 3 · Verduras: 3 · **Granos: mensaje de `@empty`**. Si Granos nunca se probó, `@empty` no está verificado. |
| **Error típico** | Filtrar con un pipe en lugar de un `computed`: es descuento. |

### Paso 3 · Estado de cada producto · R3

| | |
|---|---|
| **Construya** | Un `computed` que agregue a cada producto visible su estado, y una columna que lo muestre con `@switch`. |
| **Consulte** | Ejemplo 4. Allí el caso es el **rango de precio**. |
| **Qué cambia en el taller** | El criterio es la **cantidad**, con los tres estados y límites que fija el enunciado. Los nombres de los casos también son otros. |
| **Compruebe** | Los dos productos con cantidad 0, los dos con cantidad baja y los dos disponibles de la tabla 2. |
| **Error típico** | Calcular el estado con un método invocado desde la plantilla. |

### Paso 4 · Formato de precio y fecha · R4

| | |
|---|---|
| **Construya** | El precio con `currency` y la fecha del día en el título con `date`. |
| **Consulte** | Ejemplo 6 y `src/app/app.config.ts` (configuración es-CO). |
| **Qué cambia en el taller** | Nada en la técnica. Tenga en cuenta dónde va la configuración regional en su entorno: `app.config.ts` con Angular CLI; `src/main.ts` en StackBlitz. |
| **Compruebe** | El precio del mango aparece como en la tabla 2. |
| **Error típico** | `NG8004: No pipe found`: falta el pipe en `imports`. |

### Paso 5 · Pipe propio · R5

| | |
|---|---|
| **Construya** | El pipe que pide el enunciado para la columna de existencias. |
| **Consulte** | Ejemplo 7. El pipe `peso` tiene la estructura completa: decorador `@Pipe`, `PipeTransform` y un `transform` con varias ramas. |
| **Qué cambia en el taller** | El pipe es otro: otro nombre, otra entrada y otros textos de salida. Las ramas que debe cubrir están en el enunciado. |
| **Compruebe** | Las tres salidas de la tabla 2, con una cantidad de 12, una de 1 y una de 0. |
| **Error típico** | Olvidar agregar el pipe a `imports` del componente. |

### Paso 6 · Estilo de la fila · R6

| | |
|---|---|
| **Construya** | La clase que resalta la fila, aplicada con `[class.nombre]`, y su estilo en `styles` del componente. |
| **Consulte** | Ejemplo 9. Allí se resaltan los productos de precio alto. |
| **Qué cambia en el taller** | La condición y el nombre de la clase son los del enunciado. |
| **Compruebe** | Las dos filas que la tabla 2 indica aparecen resaltadas, y ninguna otra. |

### Paso 7 · Evidencias y entrega

1. Capture la vista con el filtro Todas y con el filtro Granos.
2. Abra el enlace de su fork en una **ventana privada** del navegador: si no se ve sin iniciar
   sesión, tampoco se podrá revisar.
3. Diligencie el enunciado con el enlace y las capturas, guárdelo como
   `COM30_Taller02_Apellido.pdf` y súbalo a la actividad «Taller 02» del aula.

---

## Lista de verificación final

- [ ] Toda signal se lee con paréntesis en la plantilla.
- [ ] El `@for` usa `track` sobre un campo propio del producto, no `$index`.
- [ ] La lista visible y el estado son `computed`; ningún método se invoca desde la plantilla para calcularlos.
- [ ] Ningún `push`, `sort` sin copia ni `++` sobre el estado.
- [ ] Los cuatro filtros reproducen la tabla 2, incluido Granos.
- [ ] Las consultas se registran en el foro de la actividad, con el mensaje de error completo.
