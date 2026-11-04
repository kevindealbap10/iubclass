import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AsyncValidatorFn, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Observable, Subject, Subscription, debounceTime, delay, distinctUntilChanged, finalize, interval, map, of, switchMap, take, tap, timer,
} from 'rxjs';
import { INVENTARIO, MINIMO, Producto, coincidencias, normalizar, pesos, retardoBusqueda, valorInventario } from '../inventario';
import { Cargando, GuiaEjemplo, Indicador, TarjetaProducto, estadoStock, segmentos } from '../compartido/ui';

// =============================================================================
//  S08 · EJEMPLO 9 · Tres ejercicios completos con el inventario
//  Diapositivas: por asignar
// -----------------------------------------------------------------------------
//  Los tres ejercicios no usan el contador de consultas de los otros ejemplos.
//
//  A · Autocompletado con selección (como una tienda en línea)
//    - Una tubería busca mientras el usuario escribe: map(trim), debounceTime(250),
//      distinctUntilChanged y switchMap. Se muestran hasta 5 sugerencias.
//    - Una segunda tubería, independiente, carga la ficha del producto elegido:
//      un Subject recibe el id elegido y switchMap pide la ficha. No hay un
//      subscribe dentro de otro subscribe: la selección es un flujo más.
//    - La ficha tarda 700 ms si el id es impar y 200 ms si es par. Si se elige
//      Mango (id 1, 700 ms) y enseguida Banano (id 8, 200 ms), la ficha final
//      debe ser Banano: switchMap cancela la petición de Mango.
//    - Estado del producto, como en la S03: 0 agotado · 1 o 2 bajo · 3 o más
//      disponible. Valor = precio por cantidad.
//
//    Resultados esperados
//      ma     4 sugerencias: Mango, Tomate, Ahuyama, Maíz
//      an     7 coincidencias: se muestran 5 (Mango, Banano, Zanahoria, Arroz,
//             Lenteja) y el aviso «2 más»
//      gu     1 sugerencia: Guayaba
//      a      sin sugerencias (menos de 2 caracteres)
//      Ficha  Mango · Frutas · $ 1.800 · 12 · disponible · valor $ 21.600
//             Banano · Frutas · $ 900 · 30 · disponible · valor $ 27.000
//             Guayaba · Frutas · $ 1.200 · 0 · agotado · valor $ 0
//             Cebolla · Verduras · $ 2.800 · 1 · bajo · valor $ 2.800
//      Elegir Mango y, antes de 700 ms, Banano: la ficha final es Banano.
//
//  B · Panel de reposición que se refresca solo
//    - timer(0, 2000) emite un número de ciclo cada 2 s. switchMap pide al
//      servidor simulado el inventario de ese ciclo y descarta la petición
//      anterior si aún no respondió. Se cancela con «Detener» y, si el
//      componente se destruye (al salir de la vista), con takeUntilDestroyed.
//    - Cada ciclo simula ventas: Mango baja 2 unidades y Banano baja 3 por ciclo,
//      sin pasar de 0. El servidor responde en 600 ms, salvo el ciclo 2, que
//      tarda 3000 ms: la petición del ciclo 3 sale a los 6 s y cancela la del 2.
//    - Un computed calcula el valor del inventario y la lista de productos por
//      reponer (cantidad 2 o menos). Las tarjetas cambian de color con el
//      estado (bajo en ámbar, agotado en rojo) y un contador regresivo indica
//      cuánto falta para el próximo refresco.
//
//    Resultados esperados (ciclo mostrado · valor · por reponer)
//      0   $ 322.000   5  (Guayaba, Patilla, Cebolla, Ahuyama, Lechuga)
//      1   $ 315.700   5
//      2   no se muestra: su respuesta se cancela; peticiones canceladas: 1
//      3   $ 303.100   5
//      4   $ 296.800   5
//      5   $ 290.500   6  (se suma Mango, que llega a 2 unidades)
//    Orden de ciclos mostrados: 0, 1, 3, 4, 5, ... Tras «Detener», la suscripción
//    queda cancelada y no se muestran más ciclos.
//
//  C · Formulario de alta con validación en vivo contra el servidor
//    - El formulario de alta de producto (S06 y S07) agrega un validador
//      ASÍNCRONO en el nombre: consulta al servidor simulado si el nombre ya
//      existe. El validador es una función que devuelve un Observable; Angular
//      se suscribe cuando los validadores síncronos pasan y CANCELA la
//      suscripción anterior si el valor cambia. Por eso timer(500) dentro del
//      validador funciona como un debounce: solo consulta cuando el usuario se
//      detuvo 500 ms.
//    - statusChanges es el Observable del estado del control. Emite 'VALID',
//      'INVALID' o 'PENDING' (hay un validador asíncrono sin terminar) y
//      'DISABLED'. valueChanges dice qué se escribió; statusChanges dice si
//      sirve.
//    - El botón «Agregar» se deshabilita mientras el formulario es inválido o
//      está en PENDING.
//
//    Resultados esperados (nombre · estado final · consultas al servidor)
//      Pe            INVALID (mínimo 3 caracteres) · no consulta: 0
//      Pera          PENDING 500 ms y luego VALID · 1 consulta
//      Mango         PENDING 500 ms y luego INVALID (nombreExistente) · 1 consulta
//      «mango » con espacio final y minúsculas: el mismo INVALID
//      Mango, letra por letra con 80 ms entre letras: una sola consulta
//
//  Qué error previene
//    - Anidar subscribe dentro de subscribe: las respuestas se cruzan y la
//      ficha mostrada puede ser la de una selección anterior.
//    - Una consulta de refresco que se acumula si el servidor responde más lento
//      que el periodo.
//    - Un refresco que sigue corriendo después de salir de la pantalla.
//    - Validar contra el servidor en cada tecla, o dejar enviar el formulario
//      mientras la validación asíncrona sigue pendiente.
//
//  En su proyecto
//    - A: la búsqueda de una tienda en línea o de un directorio, con ficha.
//    - B: un tablero que se actualiza solo y se detiene al cambiar de pantalla.
//    - C: un alta que avisa al instante si el nombre, el correo o el documento
//      ya están registrados.
// =============================================================================

// ---- Ejercicio A -------------------------------------------------------------
function obtenerFicha(id: number): Observable<Producto | undefined> {
  const producto = INVENTARIO.find((p) => p.id === id);
  return of(producto).pipe(delay(id % 2 === 1 ? 700 : 200));
}

// ---- Ejercicio B -------------------------------------------------------------
export function inventarioEnCiclo(n: number): Producto[] {
  return INVENTARIO.map((p) => {
    if (p.nombre === 'Mango') return { ...p, cantidad: Math.max(0, p.cantidad - 2 * n) };
    if (p.nombre === 'Banano') return { ...p, cantidad: Math.max(0, p.cantidad - 3 * n) };
    return p;
  });
}

function servidorReposicion(n: number): Observable<Producto[]> {
  return of(inventarioEnCiclo(n)).pipe(delay(n === 2 ? 3000 : 600));
}

const PERIODO = 2000;

@Component({
  selector: 'app-ejemplo-vida-real',
  imports: [ReactiveFormsModule, Cargando, GuiaEjemplo, Indicador, TarjetaProducto],
  template: `
    <app-guia-ejemplo
      [observar]="[
        'A: escriba «an»: salen 5 sugerencias y «2 más». Elija Mango y, enseguida, Banano: la ficha final es Banano.',
        'B: con «Iniciar refresco» el ciclo 2 nunca se muestra; la petición cancelada suma 1. Las tarjetas cambian de color con el estado.',
        'C: «Pera» pasa por PENDING y llega a VALID; «Mango» llega a INVALID porque ya existe. Escrito letra por letra, hace una sola consulta.'
      ]"
      proyecto="A: búsqueda de una tienda en línea o directorio, con ficha. B: tablero que se actualiza solo y se detiene al salir. C: alta que avisa al instante si el nombre, correo o documento ya existen." />

    <!-- ===================== A ===================== -->
    <h5>A · Autocompletado con selección</h5>
    <label class="campo">
      Buscar producto
      <input [formControl]="busqueda" placeholder="ma, an, gu..." autocomplete="off" role="combobox"
             [attr.aria-expanded]="sugerencias().length > 0" aria-controls="lista-sugerencias" />
    </label>
    <div class="botones">
      <button class="sec" (click)="elegirRapido()">Elegir Mango y, a los 100 ms, Banano</button>
      @for (t of ['ma', 'an', 'gu']; track t) { <button class="sec" (click)="busqueda.setValue(t)">{{ t }}</button> }
    </div>
    <div class="estado">@if (buscandoSugerencias()) { <app-cargando texto="Buscando sugerencias…" /> }</div>

    @if (visibles().length) {
      <ul id="lista-sugerencias" class="sugerencias" role="listbox">
        @for (p of visibles(); track p.id) {
          <li role="option" [attr.aria-selected]="ficha()?.id === p.id">
            <button (click)="elegir(p.id)">
              <span class="nom">{{ antes(p) }}<mark>{{ coincide(p) }}</mark>{{ despues(p) }}</span>
              <span class="cat">{{ p.categoria }}</span>
              <span class="precio">{{ pesos(p.precio) }}</span>
              <span [class]="'badge ' + estado(p)">{{ estado(p) }}</span>
            </button>
          </li>
        }
        @if (restantes() > 0) { <li class="mas">{{ restantes() }} más. Escriba más letras para acotar.</li> }
      </ul>
    } @else if (texto().length >= minimo && !buscandoSugerencias()) {
      <p class="aviso">Sin coincidencias.</p>
    }

    @if (cargandoFicha()) { <app-cargando texto="Cargando ficha…" /> }
    @if (ficha(); as f) {
      <div class="ficha">
        <app-producto [producto]="f" />
        <dl>
          <dt>Estado</dt><dd>{{ estado(f) }}</dd>
          <dt>Precio</dt><dd>{{ pesos(f.precio) }}</dd>
          <dt>Existencias</dt><dd>{{ f.cantidad }} {{ f.cantidad === 1 ? 'unidad' : 'unidades' }}</dd>
          <dt>Valor en inventario</dt><dd>{{ pesos(f.precio * f.cantidad) }}</dd>
        </dl>
      </div>
    }

    <!-- ===================== B ===================== -->
    <h5 class="separado">B · Panel de reposición</h5>
    <div class="botones">
      <button (click)="iniciar()" [disabled]="activa()">Iniciar refresco</button>
      <button (click)="detener()" [disabled]="!activa()">Detener</button>
      <button class="sec" (click)="reiniciar()">Reiniciar</button>
    </div>
    <div class="indicadores">
      <app-indicador [valor]="ciclo() ?? '—'" rotulo="Ciclo mostrado" />
      <app-indicador [valor]="pesos(valor())" rotulo="Valor del inventario" tono="aviso" />
      <app-indicador [valor]="reponer().length" rotulo="Por reponer" [tono]="reponer().length > 0 ? 'alerta' : 'bien'" />
      <app-indicador [valor]="canceladas()" rotulo="Peticiones canceladas" />
      <app-indicador [valor]="activa() ? 'activa' : 'cancelada'" rotulo="Suscripción" [tono]="activa() ? 'bien' : 'neutro'" />
    </div>
    <div class="cuenta">
      <span>{{ activa() ? 'Próximo refresco en ' + (restante() / 1000).toFixed(1) + ' s' : 'Refresco detenido' }}</span>
      <span class="pista"><span class="relleno" [style.width.%]="activa() ? (restante() / 2000) * 100 : 0"></span></span>
    </div>
    @if (agotados().length) {
      <div class="toast" role="alert"><strong>Reposición urgente</strong> {{ agotados().length }} productos agotados: {{ nombres(agotados()) }}.</div>
    }
    <p class="estado2">Ciclos mostrados: <code>{{ mostrados().join(', ') || '—' }}</code></p>
    @if (valores().length > 1) {
      <svg class="linea" viewBox="0 0 300 60" role="img" aria-label="Valor del inventario por ciclo mostrado">
        <polyline [attr.points]="puntos()" fill="none" stroke="#2563eb" stroke-width="2.5" />
      </svg>
    }
    <div class="cuadricula">
      @for (p of reponer(); track p.id) { <app-producto [producto]="p" /> }
    </div>

    <!-- ===================== C ===================== -->
    <h5 class="separado">C · Alta de producto con validación en vivo</h5>
    <form [formGroup]="alta" (ngSubmit)="agregar()" novalidate>
      <div class="rejilla">
        <label>
          Nombre
          <input formControlName="nombre" autocomplete="off" />
          <span [class]="'estatus ' + estadoNombre()">{{ estadoNombre() }}</span>
          @if (alta.controls.nombre.pending) { <app-cargando texto="Consultando al servidor…" /> }
          @if (alta.controls.nombre.touched || alta.controls.nombre.dirty) {
            @if (alta.controls.nombre.hasError('required')) { <small>El nombre es obligatorio.</small> }
            @if (alta.controls.nombre.hasError('minlength')) { <small>Mínimo 3 caracteres.</small> }
            @if (alta.controls.nombre.hasError('nombreExistente')) { <small>Ya existe un producto llamado «{{ alta.controls.nombre.value.trim() }}».</small> }
            @if (alta.controls.nombre.valid) { <small class="ok">Nombre disponible.</small> }
          }
        </label>
        <label>
          Categoría
          <select formControlName="categoria">
            <option value="">Seleccione</option>
            <option>Frutas</option><option>Verduras</option><option>Granos</option>
          </select>
        </label>
        <label>Precio <input type="number" formControlName="precio" /></label>
        <label>Cantidad <input type="number" formControlName="cantidad" /></label>
      </div>
      <div class="botones">
        <button type="submit" [disabled]="alta.invalid || alta.pending">Agregar</button>
        <button type="button" class="sec" (click)="escribirNombre('Pera')">Escribir «Pera»</button>
        <button type="button" class="sec" (click)="escribirNombre('Mango')">Escribir «Mango»</button>
        <button type="button" class="sec" (click)="escribirNombre('mango ')">Escribir «mango »</button>
        <button type="button" class="sec" (click)="escribirNombre('Pe')">Escribir «Pe»</button>
        <button type="button" class="sec" (click)="mangoPorLetras()">Mango letra por letra</button>
        <button type="button" class="sec" (click)="reiniciarAlta()">Reiniciar</button>
      </div>
    </form>
    <div class="indicadores">
      <app-indicador [valor]="consultasNombre()" rotulo="Consultas al servidor" tono="aviso" />
      <app-indicador [valor]="emisionesEstado()" rotulo="Emisiones de statusChanges" />
    </div>
    <p class="estado2">Secuencia de estados del nombre: <code>{{ secuencia().join(' → ') || '—' }}</code></p>
    @if (creados().length) {
      <h6>Agregados en esta página</h6>
      <div class="cuadricula">
        @for (p of creados(); track p.id) { <app-producto [producto]="p" /> }
      </div>
    }
  `,
  styles: `
    h5 { font-size: .85rem; font-weight: 700; color: #0f172a; margin-bottom: .5rem; }
    h6 { margin: .8rem 0 .3rem; font-size: .8rem; font-weight: 700; }
    .separado { margin-top: 1.8rem; padding-top: 1rem; border-top: 1px dashed #cbd5e1; }
    .campo, label { display: block; font-size: .85rem; font-weight: 600; }
    input, select { display: block; width: 100%; max-width: 18rem; margin-top: .2rem; border: 1px solid #cbd5e1; border-radius: .4rem; padding: .3rem .5rem; font-size: .9rem; }
    .botones { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .5rem; }
    button { border-radius: .4rem; background: #1e293b; color: #fff; padding: .35rem .8rem; font-size: .85rem; }
    button.sec { background: #e2e8f0; color: #0f172a; }
    button:disabled { opacity: .4; }
    .estado { min-height: 1.5rem; margin: .3rem 0; }
    .estado2 { margin: .5rem 0 .2rem; font-size: .85rem; }
    .indicadores { display: flex; flex-wrap: wrap; gap: .6rem; margin: .7rem 0; }
    .aviso { margin: .5rem 0; font-size: .85rem; color: #92400e; }
    /* A */
    .sugerencias { list-style: none; padding: 0; margin: .3rem 0 .6rem; max-width: 34rem; border: 1px solid #cbd5e1; border-radius: .6rem; overflow: hidden; background: #fff; box-shadow: 0 4px 12px rgb(15 23 42 / .08); }
    .sugerencias li + li { border-top: 1px solid #f1f5f9; }
    .sugerencias button { display: grid; grid-template-columns: 1fr auto auto auto; gap: .8rem; align-items: center; width: 100%; background: #fff; color: #0f172a; border-radius: 0; text-align: left; padding: .45rem .8rem; }
    .sugerencias button:hover, .sugerencias button:focus-visible { background: #fffbeb; }
    .nom { font-weight: 600; }
    mark { background: #fde68a; color: inherit; border-radius: .2rem; }
    .cat { font-size: .65rem; text-transform: uppercase; letter-spacing: .08em; color: #64748b; }
    .precio { font-size: .8rem; color: #334155; }
    .badge { font-size: .65rem; font-weight: 700; padding: .1rem .5rem; border-radius: 1rem; }
    .badge.disponible { background: #dcfce7; color: #166534; }
    .badge.bajo { background: #fef3c7; color: #92400e; }
    .badge.agotado { background: #fee2e2; color: #991b1b; }
    .mas { padding: .4rem .8rem; font-size: .75rem; color: #64748b; }
    .ficha { display: grid; grid-template-columns: 12rem 1fr; gap: 1rem; align-items: start; margin-top: .5rem; max-width: 34rem; }
    dl { display: grid; grid-template-columns: auto 1fr; gap: .2rem .8rem; font-size: .85rem; }
    dt { color: #64748b; } dd { font-weight: 600; }
    /* B */
    .cuenta { display: flex; align-items: center; gap: .8rem; font-size: .85rem; margin: .4rem 0; }
    .pista { flex: 1; max-width: 16rem; height: .5rem; background: #e2e8f0; border-radius: 1rem; overflow: hidden; }
    .relleno { display: block; height: 100%; background: #2563eb; border-radius: 1rem; }
    .toast { margin: .6rem 0; padding: .55rem .8rem; border-radius: .5rem; font-size: .85rem; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
    .linea { width: 100%; max-width: 20rem; height: 3.5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: .4rem; }
    .cuadricula { display: grid; grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr)); gap: .6rem; margin-top: .6rem; }
    /* C */
    .rejilla { display: grid; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); gap: .8rem; }
    small { display: block; margin-top: .2rem; font-size: .75rem; font-weight: 400; color: #b91c1c; }
    small.ok { color: #15803d; }
    .estatus { display: inline-block; margin-top: .3rem; font-size: .65rem; font-weight: 800; letter-spacing: .08em; padding: .1rem .5rem; border-radius: 1rem; }
    .estatus.VALID { background: #dcfce7; color: #166534; }
    .estatus.INVALID { background: #fee2e2; color: #991b1b; }
    .estatus.PENDING { background: #fef3c7; color: #92400e; }
  `,
})
export class EjemploVidaReal {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly pesos = pesos;
  protected readonly minimo = MINIMO;
  protected readonly estado = (p: Producto) => estadoStock(p.cantidad);
  protected readonly nombres = (ps: Producto[]) => ps.map((p) => p.nombre).join(', ');

  // ---- A ---------------------------------------------------------------------
  protected readonly busqueda = this.fb.control('');
  protected readonly texto = toSignal(this.busqueda.valueChanges.pipe(map((t) => t.trim())), { initialValue: '' });
  protected readonly buscandoSugerencias = signal(false);

  protected readonly sugerencias = toSignal(
    this.busqueda.valueChanges.pipe(
      map((t) => t.trim()),
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((t) => {
        if (t.length < MINIMO) {
          this.buscandoSugerencias.set(false);
          return of<Producto[]>([]);
        }
        // El indicador se enciende dentro del switchMap: así se enciende después de cancelar la petición anterior.
        this.buscandoSugerencias.set(true);
        return of(coincidencias(t)).pipe(delay(retardoBusqueda(t)), finalize(() => this.buscandoSugerencias.set(false)));
      }),
    ),
    { initialValue: [] as Producto[] },
  );
  protected readonly visibles = computed(() => this.sugerencias().slice(0, 5));
  protected readonly restantes = computed(() => Math.max(0, this.sugerencias().length - 5));
  protected readonly antes = (p: Producto) => segmentos(p.nombre, this.texto()).antes;
  protected readonly coincide = (p: Producto) => segmentos(p.nombre, this.texto()).coincide;
  protected readonly despues = (p: Producto) => segmentos(p.nombre, this.texto()).despues;

  private readonly seleccion$ = new Subject<number>();
  protected readonly cargandoFicha = signal(false);
  protected readonly ficha = toSignal(
    this.seleccion$.pipe(
      switchMap((id) => {
        this.cargandoFicha.set(true);
        return obtenerFicha(id).pipe(finalize(() => this.cargandoFicha.set(false)));
      }),
    ),
    { initialValue: undefined },
  );

  protected elegir(id: number): void {
    this.seleccion$.next(id);
  }

  protected elegirRapido(): void {
    this.elegir(1);
    setTimeout(() => this.elegir(8), 100);
  }

  // ---- B ---------------------------------------------------------------------
  protected readonly activa = signal(false);
  protected readonly ciclo = signal<number | null>(null);
  protected readonly inventario = signal<Producto[]>(INVENTARIO);
  protected readonly mostrados = signal<number[]>([]);
  protected readonly valores = signal<number[]>([]);
  protected readonly canceladas = signal(0);
  protected readonly restante = signal(PERIODO);
  protected readonly valor = computed(() => valorInventario(this.inventario()));
  protected readonly reponer = computed(() => this.inventario().filter((p) => p.cantidad <= 2));
  protected readonly agotados = computed(() => this.inventario().filter((p) => p.cantidad === 0));
  protected readonly puntos = computed(() => {
    const v = this.valores();
    const max = Math.max(...v);
    const min = Math.min(...v);
    return v.map((x, i) => `${(i / Math.max(1, v.length - 1)) * 290 + 5},${55 - ((x - min) / Math.max(1, max - min)) * 48}`).join(' ');
  });
  private suscripcion?: Subscription;

  protected iniciar(): void {
    this.detener();
    this.activa.set(true);
    const inicio = performance.now();
    this.suscripcion = new Subscription();
    this.suscripcion.add(
      timer(0, PERIODO)
        .pipe(
          switchMap((n) => {
            let recibida = false;
            return servidorReposicion(n).pipe(
              tap(() => (recibida = true)),
              // Si la petición termina sin haber respondido, fue cancelada.
              finalize(() => {
                if (!recibida) this.canceladas.update((c) => c + 1);
              }),
              map((inventario) => ({ n, inventario })),
            );
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(({ n, inventario }) => {
          this.ciclo.set(n);
          this.inventario.set(inventario);
          this.mostrados.update((lista) => [...lista, n]);
          this.valores.update((lista) => [...lista, valorInventario(inventario)]);
        }),
    );
    // Contador regresivo: otro flujo, cancelado junto con el refresco.
    this.suscripcion.add(
      interval(100)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.restante.set(PERIODO - ((performance.now() - inicio) % PERIODO))),
    );
  }

  protected detener(): void {
    this.suscripcion?.unsubscribe();
    this.activa.set(false);
  }

  protected reiniciar(): void {
    this.detener();
    this.ciclo.set(null);
    this.inventario.set(INVENTARIO);
    this.mostrados.set([]);
    this.valores.set([]);
    this.canceladas.set(0);
    this.restante.set(PERIODO);
  }

  // ---- C ---------------------------------------------------------------------
  protected readonly consultasNombre = signal(0);
  protected readonly creados = signal<Producto[]>([]);
  protected readonly secuencia = signal<string[]>([]);
  protected readonly emisionesEstado = signal(0);

  /**
   * Validador asíncrono: devuelve un Observable. Angular lo suscribe solo cuando
   * los validadores síncronos pasan y lo cancela si el valor cambia antes de que
   * termine; por eso timer(500) hace de debounce.
   */
  private readonly nombreDisponible: AsyncValidatorFn = (control) =>
    timer(500).pipe(
      tap(() => this.consultasNombre.update((n) => n + 1)), // llegó al servidor
      map(() => (INVENTARIO.some((p) => normalizar(p.nombre) === normalizar(String(control.value))) ? { nombreExistente: true } : null)),
    );

  protected readonly alta = this.fb.group({
    nombre: this.fb.control('', { validators: [Validators.required, Validators.minLength(3)], asyncValidators: [this.nombreDisponible] }),
    categoria: this.fb.control('', Validators.required),
    precio: this.fb.control(0, Validators.min(1)),
    cantidad: this.fb.control(0, Validators.min(0)),
  });

  /** statusChanges como signal: 'VALID', 'INVALID' o 'PENDING'. */
  protected readonly estadoNombre = toSignal(this.alta.controls.nombre.statusChanges, { initialValue: this.alta.controls.nombre.status });

  constructor() {
    this.alta.controls.nombre.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((s) => {
      this.emisionesEstado.update((n) => n + 1);
      // Se anota solo cuando el estado cambia de verdad.
      this.secuencia.update((lista) => (lista[lista.length - 1] === s ? lista : [...lista, s]));
    });
  }

  protected escribirNombre(texto: string): void {
    this.reiniciarAlta();
    this.alta.controls.nombre.setValue(texto);
    this.alta.controls.nombre.markAsDirty();
  }

  protected mangoPorLetras(): void {
    this.reiniciarAlta();
    interval(80)
      .pipe(take('Mango'.length), takeUntilDestroyed(this.destroyRef))
      .subscribe((i) => {
        this.alta.controls.nombre.setValue('Mango'.slice(0, i + 1));
        this.alta.controls.nombre.markAsDirty();
      });
  }

  protected reiniciarAlta(): void {
    this.alta.reset({ nombre: '', categoria: '', precio: 0, cantidad: 0 });
    this.consultasNombre.set(0);
    this.emisionesEstado.set(0);
    this.secuencia.set([]);
  }

  protected agregar(): void {
    if (this.alta.invalid || this.alta.pending) return;
    const v = this.alta.getRawValue();
    this.creados.update((lista) => [
      ...lista,
      { id: INVENTARIO.length + lista.length + 1, nombre: v.nombre.trim(), categoria: v.categoria as Producto['categoria'], precio: v.precio, cantidad: v.cantidad },
    ]);
    this.reiniciarAlta();
  }
}
