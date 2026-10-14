# Parcial 1 · Inventario con componentes que se comunican

**Institución Universitaria de Barranquilla**
**Asignatura:** COM30 · Programación con Frameworks para Web (2026-III)
**Estudiante:** Jasseff Fabian Donado Campo
**Código:** [Código]
**Fecha:** 14 de octubre de 2026
**Enlace del Fork:** https://github.com/JassDonado/iubclass

Ruta en la aplicación: `/parcial1` · Código: `src/app/parcial1/`

---

## 1 · Contrato de Componentes (R1)

| Componente | Inputs (nombre y tipo) | Outputs (nombre y dato) | Estado propio |
| :--- | :--- | :--- | :--- |
| **FichaProducto** | `producto: input.required<Producto>()` | `retirar = output<string>()` | Ninguno (maneja estado visual mediante `computed`) |
| **Inventario** | — | — | `lista = signal<Producto[]>([...])` |

- `src/app/parcial1/ficha-producto.ts` — componente hijo (`app-ficha`).
- `src/app/parcial1/inventario.ts` — componente padre (`app-inventario`).

---

## 2 · Evidencias

- **Captura 1 · Paso P3:** valor total `$ 192.000` y el Teclado en estado *Disponible* con 3 unidades.
- **Captura 2 · Paso P5:** mensaje `@empty`, valor total `$ 0` y `0` unidades.

---

## 3 · Análisis de un Fallo y su Corrección (R5)

### 3.1 · ¿Qué valor muestra Inventario como valor total tras las tres pulsaciones y por qué?

- **Respuesta:** El valor total **no cambia** (permanece en el valor inicial del estado P1) o no se
  actualiza de manera reactiva en el componente padre.
- **Motivo:** El componente defectuoso muta directamente la propiedad interna del objeto recibido
  por input (`this.producto().existencias -= 1`). Como Angular Signals detecta cambios por
  inmutabilidad (nuevas referencias o uso de `update`), la señal del padre (`lista`) no percibe la
  modificación interna de las propiedades del objeto mutado, por lo que los `computed` no se
  recalculan y la interfaz no se sincroniza.

### 3.2 · Corrección del hijo y método del padre que recibe el aviso

**Componente hijo (`FichaProducto` corregido):** en lugar de mutar el input, emite un evento con el
nombre del producto.

```typescript
export class FichaProducto {
  producto = input.required<Producto>();
  retirar = output<string>();

  retirarUnidad() {
    this.retirar.emit(this.producto().nombre);
  }
}
```

**Método del componente padre (`Inventario`):** se reconstruye la lista con `update()` y un objeto
nuevo (`{ ...p, existencias: p.existencias - 1 }`), sin mutar el objeto original.

```typescript
manejarRetiro(nombre: string) {
  this.lista.update(productos =>
    productos.map(p =>
      p.nombre === nombre ? { ...p, existencias: p.existencias - 1 } : p
    )
  );
}
```
