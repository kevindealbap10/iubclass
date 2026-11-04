import { Component, computed, signal } from '@angular/core';
import { FormField, form, min, minLength, required, submit } from '@angular/forms/signals';
import { INVENTARIO, Producto, pesos } from '../inventario';
import { GuiaEjemplo, TarjetaProducto } from '../compartido/ui';

// =============================================================================
//  S08 · EJEMPLO 6 · Signal Forms: el alta de producto en la API nueva
//  Diapositivas 27 a 29
// -----------------------------------------------------------------------------
//  Qué muestra
//    - El mismo formulario de alta de producto de las sesiones anteriores
//      (nombre, categoría, precio y cantidad), escrito con Signal Forms.
//    - El modelo es una signal. form(modelo, esquema) devuelve un árbol de
//      campos; cada campo se lee llamándolo: f.nombre() es su estado.
//    - Las reglas van en el esquema, con funciones que reciben la ruta del campo:
//        required(ruta.nombre, { message })
//        minLength(ruta.nombre, 3, { message })
//        min(ruta.precio, 1, { message })
//    - La directiva [formField]="f.nombre" enlaza el control HTML con el campo
//      en ambos sentidos. No hay FormGroup, FormControl ni ReactiveFormsModule.
//    - submit(f, accion) marca todos los campos como tocados y ejecuta la
//      acción solo si el formulario es válido.
//
//  Nombres usados, verificados en @angular/forms 22.1.7 (import desde
//  '@angular/forms/signals')
//    form, required, minLength, min, submit, FormField (selector [formField]).
//  Estado de un campo, funciones sin argumentos: value, touched, dirty, valid,
//  invalid, errors. Cada error trae kind y message.
//
//  Comparación con formularios reactivos (S07)
//    reactivo (S07)                          Signal Forms (S08)
//    FormBuilder + group({...})              signal(modelo) + form(modelo, esquema)
//    Validators.required                     required(ruta.campo)
//    formControlName="nombre"                [formField]="f.nombre"
//    c.invalid && (c.touched || c.dirty)     f.nombre().invalid() && f.nombre().touched()
//    c.hasError('required')                  errors().some(e => e.kind === 'required')
//    markAllAsTouched() + valid              submit(f, accion)
//    getRawValue()                           modelo()
//
//  Qué observar
//    - El panel de estado cambia al escribir y al salir del campo: touched pasa
//      a true con el evento blur, igual que en reactivos.
//    - Pulse «Agregar» con el formulario vacío: aparecen tres mensajes (nombre, categoría y precio; la cantidad 0 es válida) y
//      no se agrega nada. Con datos válidos se agrega y el formulario se limpia.
//
//    - La tarjeta de vista previa se arma con computed sobre la signal modelo:
//      cambia al escribir, sin suscripciones ni eventos.
//
//  En su proyecto
//    - Un formulario de alta cuya vista previa y cuyo estado de validez se
//      derivan de una sola signal.
//
//  Estado del tema
//    Cierre de la sesión, no evaluable. El Taller 07 usa formularios reactivos.
// =============================================================================

@Component({
  selector: 'app-ejemplo-signal-forms',
  imports: [FormField, GuiaEjemplo, TarjetaProducto],
  template: `
    <app-guia-ejemplo
      [observar]="[
        'Al pulsar Agregar con el formulario vacío aparecen tres mensajes (nombre, categoría y precio; la cantidad 0 es válida) y no se agrega nada.',
        'El panel de estado cambia al escribir (dirty) y al salir del campo (touched).',
        'La tarjeta de vista previa se arma sola desde la signal modelo.'
      ]"
      proyecto="Formulario de alta con vista previa y validación derivados de una sola signal, sin FormGroup." />

    <form (submit)="agregar($event)" novalidate>
      <div class="rejilla">
        <label>
          Nombre
          <input [formField]="f.nombre" />
          @if (f.nombre().invalid() && f.nombre().touched()) {
            @for (e of f.nombre().errors(); track e.kind) { <small>{{ e.message }}</small> }
          }
        </label>

        <label>
          Categoría
          <select [formField]="f.categoria">
            <option value="">Seleccione</option>
            <option>Frutas</option>
            <option>Verduras</option>
            <option>Granos</option>
          </select>
          @if (f.categoria().invalid() && f.categoria().touched()) {
            @for (e of f.categoria().errors(); track e.kind) { <small>{{ e.message }}</small> }
          }
        </label>

        <label>
          Precio
          <input type="number" [formField]="f.precio" />
          @if (f.precio().invalid() && f.precio().touched()) {
            @for (e of f.precio().errors(); track e.kind) { <small>{{ e.message }}</small> }
          }
        </label>

        <label>
          Cantidad
          <input type="number" [formField]="f.cantidad" />
          @if (f.cantidad().invalid() && f.cantidad().touched()) {
            @for (e of f.cantidad().errors(); track e.kind) { <small>{{ e.message }}</small> }
          }
        </label>
      </div>
      <button type="submit">Agregar</button>
    </form>

    <h5 class="vista">Vista previa</h5>
    <div class="previa"><app-producto [producto]="vistaPrevia()" /></div>

    <table class="estado">
      <thead><tr><th>Campo</th><th>value</th><th>touched</th><th>dirty</th><th>invalid</th><th>errores</th></tr></thead>
      <tbody>
        @for (fila of filas(); track fila.campo) {
          <tr><td>{{ fila.campo }}</td><td>{{ fila.valor }}</td><td>{{ fila.touched }}</td><td>{{ fila.dirty }}</td><td>{{ fila.invalid }}</td><td>{{ fila.errores }}</td></tr>
        }
      </tbody>
    </table>

    <p class="resumen">Productos agregados en esta página: <strong>{{ agregados().length }}</strong></p>
    <ul>
      @for (p of agregados(); track p.id) {
        <li>{{ p.nombre }} · {{ p.categoria }} · {{ pesos(p.precio) }} · {{ p.cantidad }} unidades</li>
      }
    </ul>
  `,
  styles: `
    .rejilla { display: grid; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); gap: .7rem; }
    label { display: block; font-size: .85rem; font-weight: 600; }
    input, select { display: block; width: 100%; margin-top: .2rem; border: 1px solid #cbd5e1; border-radius: .4rem; padding: .3rem .5rem; font-size: .9rem; }
    small { display: block; color: #b91c1c; font-weight: 400; margin-top: .15rem; }
    button { margin-top: .8rem; border-radius: .4rem; background: #1e293b; color: #fff; padding: .4rem .9rem; font-size: .85rem; }
    .estado { margin-top: 1rem; border-collapse: collapse; font-size: .8rem; font-family: ui-monospace, Consolas, monospace; }
    .estado th, .estado td { border: 1px solid #e2e8f0; padding: .2rem .6rem; text-align: left; }
    .estado th { background: #f1f5f9; }
    .resumen { margin-top: .8rem; font-size: .85rem; }
    .vista { margin-top: 1rem; font-size: .8rem; font-weight: 700; }
    .previa { max-width: 13rem; margin-top: .3rem; }
  `,
})
export class EjemploSignalForms {
  protected readonly pesos = pesos;

  // El modelo es una signal; el formulario escribe y lee sobre ella.
  protected readonly modelo = signal({ nombre: '', categoria: '', precio: 0, cantidad: 0 });

  protected readonly f = form(this.modelo, (ruta) => {
    required(ruta.nombre, { message: 'El nombre es obligatorio.' });
    minLength(ruta.nombre, 3, { message: 'El nombre tiene mínimo 3 caracteres.' });
    required(ruta.categoria, { message: 'Seleccione una categoría.' });
    min(ruta.precio, 1, { message: 'El precio debe ser mayor que 0.' });
    min(ruta.cantidad, 0, { message: 'La cantidad no puede ser negativa.' });
  });

  protected readonly agregados = signal<Producto[]>([]);

  protected readonly vistaPrevia = computed<Producto>(() => {
    const m = this.modelo();
    return {
      id: 0,
      nombre: m.nombre || 'Nombre del producto',
      categoria: (m.categoria || 'Frutas') as Producto['categoria'],
      precio: Number(m.precio) || 0,
      cantidad: Number(m.cantidad) || 0,
    };
  });

  /** Una fila por campo para comparar los estados mientras se escribe. */
  protected readonly filas = () =>
    (['nombre', 'categoria', 'precio', 'cantidad'] as const).map((campo) => {
      const e = this.f[campo]();
      return {
        campo,
        valor: JSON.stringify(e.value()),
        touched: e.touched(),
        dirty: e.dirty(),
        invalid: e.invalid(),
        errores: e.errors().map((x) => x.kind).join(', ') || '—',
      };
    });

  protected agregar(evento: Event): void {
    evento.preventDefault();
    // submit marca todos los campos como tocados y llama a la acción solo si es válido.
    submit(this.f, async () => {
      const m = this.modelo();
      this.agregados.update((lista) => [
        ...lista,
        { id: INVENTARIO.length + lista.length + 1, nombre: m.nombre, categoria: m.categoria as Producto['categoria'], precio: m.precio, cantidad: m.cantidad },
      ]);
      this.f().reset({ nombre: '', categoria: '', precio: 0, cantidad: 0 });
      return undefined;
    });
  }
}
