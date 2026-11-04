import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

// =============================================================================
//  S08 · Diagrama de canicas (marble diagram) propio, con SVG
// -----------------------------------------------------------------------------
//  Dibuja una línea de tiempo por observable. Lo usan los ejemplos 1, 2, 4, 7 y 8.
//    next      círculo en el instante real de la emisión
//    omitido   círculo hueco: el valor entró a un operador y no pasó (filter)
//    complete  barra vertical: el observable terminó bien
//    error     cruz: el observable terminó con error
//    tramo     barra horizontal de una consulta, del instante en que sale al
//              instante en que responde. Una consulta cancelada por switchMap
//              se dibuja con línea cortada y un corte al final; una con error,
//              con cruz.
//  Los instantes se miden en milisegundos reales con performance.now(): la
//  separación entre dos círculos es el tiempo que pasó entre las dos emisiones.
//
//  RegistroCanicas guarda los eventos en signals; el componente <app-canicas>
//  los dibuja. Un ejemplo anota con emitir(), abrirTramo() y cerrarTramo().
// =============================================================================

export type TipoCanica = 'next' | 'omitido' | 'complete' | 'error';
export type EstadoTramo = 'en curso' | 'ok' | 'cancelada' | 'error';

export interface EventoCanica { t: number; tipo: TipoCanica; etiqueta: string }
export interface TramoCanica { id: number; t0: number; t1: number | null; estado: EstadoTramo; etiqueta: string }
export interface FilaCanica {
  id: string;
  nombre: string;
  inicio: number;
  eventos: EventoCanica[];
  tramos: TramoCanica[];
}

export class RegistroCanicas {
  readonly filas = signal<FilaCanica[]>([]);
  private origen: number | null = null;
  private siguienteTramo = 1;

  /**
   * compartido: todas las filas miden el tiempo desde el primer evento anotado
   * (un buscador: las pulsaciones y las respuestas conviven en un mismo eje).
   * porFila: cada fila mide desde que se creó (una ejecución por fila).
   */
  constructor(private readonly modo: 'compartido' | 'porFila', nombres: string[] = []) {
    this.reiniciar(nombres);
  }

  reiniciar(nombres?: string[]): void {
    this.origen = null;
    this.siguienteTramo = 1;
    if (nombres) {
      this.filas.set(nombres.map((nombre, i) => ({ id: `f${i}`, nombre, inicio: 0, eventos: [], tramos: [] })));
    } else if (this.modo === 'compartido') {
      this.filas.update((fs) => fs.map((f) => ({ ...f, eventos: [], tramos: [] })));
    } else {
      this.filas.set([]);
    }
  }

  renombrar(indice: number, nombre: string): void {
    this.filas.update((fs) => fs.map((f, i) => (i === indice ? { ...f, nombre } : f)));
  }

  /** Solo modo porFila: agrega una fila que mide desde este instante. Devuelve su índice. */
  filaNueva(nombre: string): number {
    const indice = this.filas().length;
    this.filas.update((fs) => [...fs, { id: `f${indice}-${Math.round(performance.now())}`, nombre, inicio: performance.now(), eventos: [], tramos: [] }]);
    return indice;
  }

  private tiempo(fila: FilaCanica): number {
    const ahora = performance.now();
    if (this.modo === 'porFila') return ahora - fila.inicio;
    if (this.origen === null) this.origen = ahora;
    return ahora - this.origen;
  }

  private modificar(indice: number, f: (fila: FilaCanica) => FilaCanica): void {
    this.filas.update((fs) => fs.map((fila, i) => (i === indice ? f(fila) : fila)));
  }

  emitir(indice: number, tipo: TipoCanica, etiqueta = ''): void {
    const fila = this.filas()[indice];
    if (!fila) return;
    const t = this.tiempo(fila);
    this.modificar(indice, (fl) => ({ ...fl, eventos: [...fl.eventos, { t, tipo, etiqueta }] }));
  }

  abrirTramo(indice: number, etiqueta: string): number {
    const fila = this.filas()[indice];
    const id = this.siguienteTramo++;
    if (!fila) return id;
    const t = this.tiempo(fila);
    this.modificar(indice, (fl) => ({ ...fl, tramos: [...fl.tramos, { id, t0: t, t1: null, estado: 'en curso', etiqueta }] }));
    return id;
  }

  /** Cierra el tramo solo si seguía abierto: el primer cierre gana (una respuesta no revive una cancelación). */
  cerrarTramo(indice: number, id: number, estado: Exclude<EstadoTramo, 'en curso'>): void {
    const fila = this.filas()[indice];
    if (!fila) return;
    const t = this.tiempo(fila);
    this.modificar(indice, (fl) => ({
      ...fl,
      tramos: fl.tramos.map((tr) => (tr.id === id && tr.estado === 'en curso' ? { ...tr, t1: t, estado } : tr)),
    }));
  }
}

const COLORES = ['#2563eb', '#7c3aed', '#0d9488', '#d97706', '#db2777', '#4f46e5'];

@Component({
  selector: 'app-canicas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure>
      <svg [attr.viewBox]="'0 0 ' + ancho + ' ' + alto()" role="img" [attr.aria-label]="resumen()">
        <!-- eje de tiempo -->
        @for (m of marcas(); track m) {
          <line [attr.x1]="x(m)" [attr.x2]="x(m)" y1="6" [attr.y2]="alto() - 22" class="rejilla" />
          <text [attr.x]="x(m)" [attr.y]="alto() - 6" class="marca">{{ segundos(m) }}</text>
        }
        @for (fila of registro().filas(); track fila.id; let i = $index) {
          <g [attr.transform]="'translate(0,' + diseno().filas[i].y + ')'">
            <text x="6" y="25" class="nombre">{{ fila.nombre }}</text>
            <line [attr.x1]="izq" [attr.x2]="ancho - 10" y1="22" y2="22" class="eje" />
            <path [attr.d]="'M' + (ancho - 10) + ' 22 l-7 -4 v8 z'" class="flecha" />

            @for (tr of fila.tramos; track tr.id; let k = $index) {
              <g [attr.transform]="'translate(0,' + diseno().filas[i].carriles[k] * 16 + ')'">
                <title>{{ tr.etiqueta }} · {{ tr.estado }}</title>
                <line [attr.x1]="x(tr.t0)" [attr.x2]="x(tr.t1 ?? limite())" y1="22" y2="22"
                      [attr.stroke]="color(tr.estado)" stroke-width="7" stroke-linecap="round"
                      [attr.stroke-dasharray]="tr.estado === 'cancelada' ? '4 5' : null"
                      [attr.opacity]="tr.estado === 'en curso' ? .45 : 1" />
                <circle [attr.cx]="x(tr.t0)" cy="22" r="3.5" fill="#fff" stroke="#0f172a" stroke-width="1.5" />
                @if (tr.estado === 'ok') {
                  <circle [attr.cx]="x(tr.t1!)" cy="22" r="11" fill="#16a34a" />
                  <text [attr.x]="x(tr.t1!)" y="26" class="dentro">✓</text>
                } @else if (tr.estado === 'cancelada') {
                  <line [attr.x1]="x(tr.t1!)" [attr.x2]="x(tr.t1!)" y1="10" y2="34" stroke="#64748b" stroke-width="3" />
                  <text [attr.x]="x(tr.t1!)" y="48" class="pie">cancelada</text>
                } @else if (tr.estado === 'error') {
                  <path [attr.d]="cruz(x(tr.t1!), 22)" class="cruz" />
                }
                <text [attr.x]="x(tr.t0)" y="9" class="etq">{{ tr.etiqueta }}</text>
              </g>
            }

            @for (ev of fila.eventos; track $index; let j = $index) {
              @switch (ev.tipo) {
                @case ('next') {
                  <circle [attr.cx]="px()[i][j]" cy="22" r="11" [attr.fill]="paleta(i)" />
                  <text [attr.x]="px()[i][j]" y="26" class="dentro">{{ corto(ev.etiqueta) }}</text>
                  <title>{{ ev.etiqueta }}</title>
                }
                @case ('omitido') {
                  <circle [attr.cx]="px()[i][j]" cy="22" r="9" fill="#fff" stroke="#94a3b8" stroke-width="2" stroke-dasharray="3 3" />
                  <text [attr.x]="px()[i][j]" y="25" class="omitido">{{ corto(ev.etiqueta) }}</text>
                  <title>{{ ev.etiqueta }} no pasa</title>
                }
                @case ('complete') {
                  <line [attr.x1]="px()[i][j]" [attr.x2]="px()[i][j]" y1="8" y2="36" stroke="#d97706" stroke-width="4" stroke-linecap="round" />
                  <title>complete</title>
                }
                @case ('error') {
                  <path [attr.d]="cruz(px()[i][j], 22)" class="cruz" />
                  <title>error {{ ev.etiqueta }}</title>
                }
              }
            }
          </g>
        }
      </svg>
      <figcaption>
        <span><i class="c next"></i>valor (next)</span>
        <span><i class="c omit"></i>descartado</span>
        <span><i class="b"></i>complete</span>
        <span><i class="x">✕</i>error</span>
        <span><i class="t ok"></i>consulta respondida</span>
        <span><i class="t cancel"></i>consulta cancelada</span>
      </figcaption>
    </figure>
  `,
  styles: `
    figure { margin: .6rem 0; overflow-x: auto; }
    svg { width: 100%; min-width: 640px; height: auto; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: .5rem; }
    .nombre { font: 600 11.5px ui-monospace, Consolas, monospace; fill: #0f172a; }
    .eje { stroke: #94a3b8; stroke-width: 1.5; }
    .flecha { fill: #94a3b8; }
    .rejilla { stroke: #e2e8f0; stroke-width: 1; }
    .marca { font: 10px system-ui, sans-serif; fill: #64748b; text-anchor: middle; }
    .dentro { font: 700 8.5px system-ui, sans-serif; fill: #fff; text-anchor: middle; }
    .omitido { font: 700 7.5px system-ui, sans-serif; fill: #64748b; text-anchor: middle; }
    .etq { font: 10px system-ui, sans-serif; fill: #334155; }
    .pie { font: 9px system-ui, sans-serif; fill: #64748b; text-anchor: middle; }
    .cruz { stroke: #dc2626; stroke-width: 4; stroke-linecap: round; fill: none; }
    figcaption { display: flex; flex-wrap: wrap; gap: .4rem 1rem; margin-top: .4rem; font-size: .72rem; color: #475569; }
    figcaption span { display: inline-flex; align-items: center; gap: .3rem; }
    .c { width: .8rem; height: .8rem; border-radius: 50%; display: inline-block; }
    .c.next { background: #2563eb; }
    .c.omit { border: 2px dashed #94a3b8; }
    .b { width: 4px; height: .9rem; background: #d97706; border-radius: 2px; display: inline-block; }
    .x { color: #dc2626; font-weight: 800; font-style: normal; }
    .t { width: 1.4rem; height: 5px; border-radius: 3px; display: inline-block; }
    .t.ok { background: #16a34a; }
    .t.cancel { background: repeating-linear-gradient(90deg, #94a3b8 0 4px, transparent 4px 8px); }
  `,
})
export class Canicas {
  readonly registro = input.required<RegistroCanicas>();
  /** Duración mínima del eje, en ms. El eje crece si los eventos la superan. */
  readonly ventana = input(4000);

  protected readonly ancho = 820;
  protected readonly izq = 190;
  protected readonly paso = 56;
  /**
   * Disposición vertical. Las consultas que se solapan en el tiempo se dibujan
   * en carriles distintos de la misma fila, para que se vean las dos barras.
   */
  protected readonly diseno = computed(() => {
    let y = 8;
    const filas = this.registro().filas().map((f) => {
      const finales: number[] = [];
      const carriles = f.tramos.map((tr) => {
        let k = finales.findIndex((fin) => fin <= tr.t0);
        if (k < 0) { k = finales.length; finales.push(0); }
        finales[k] = tr.t1 ?? Infinity;
        return k;
      });
      const alto = this.paso + Math.max(0, finales.length - 1) * 16;
      const fila = { y, alto, carriles };
      y += alto;
      return fila;
    });
    return { filas, total: y };
  });
  protected readonly alto = computed(() => this.diseno().total + 26);

  protected readonly limite = computed(() => {
    let max = 0;
    for (const f of this.registro().filas()) {
      for (const e of f.eventos) max = Math.max(max, e.t);
      for (const tr of f.tramos) max = Math.max(max, tr.t1 ?? tr.t0);
    }
    return Math.max(this.ventana(), Math.ceil((max * 1.08) / 500) * 500);
  });

  /**
   * Posición horizontal de cada evento. Si varios ocurren en el mismo instante
   * (from emite todo junto) se separan 24 px para que se vean uno por uno.
   */
  protected readonly px = computed(() =>
    this.registro().filas().map((f) => {
      let ultimo = -Infinity;
      return f.eventos.map((e) => {
        const xx = Math.min(Math.max(this.x(e.t), ultimo + 24), this.ancho - 20);
        ultimo = xx;
        return xx;
      });
    }),
  );

  protected readonly marcas = computed(() => {
    const lim = this.limite();
    const intervalo = lim > 6000 ? 2000 : lim > 3000 ? 1000 : 500;
    const m: number[] = [];
    for (let t = 0; t <= lim; t += intervalo) m.push(t);
    return m;
  });

  protected readonly resumen = computed(() => {
    const filas = this.registro().filas();
    const partes = filas.map((f) => `${f.nombre}: ${f.eventos.filter((e) => e.tipo === 'next').length} valores, ${f.tramos.length} consultas`);
    return `Diagrama de canicas. ${partes.join('. ')}.`;
  });

  protected x(t: number): number {
    return this.izq + (t / this.limite()) * (this.ancho - this.izq - 24);
  }
  protected segundos(ms: number): string {
    return ms === 0 ? '0 s' : `${(ms / 1000).toLocaleString('es-CO')} s`;
  }
  protected corto(s: string): string {
    return s.length > 5 ? s.slice(0, 4) + '…' : s;
  }
  protected paleta(i: number): string {
    return COLORES[i % COLORES.length];
  }
  protected color(e: EstadoTramo): string {
    return e === 'ok' ? '#16a34a' : e === 'error' ? '#dc2626' : e === 'cancelada' ? '#94a3b8' : '#2563eb';
  }
  protected cruz(cx: number, cy: number): string {
    return `M${cx - 8} ${cy - 8} l16 16 M${cx + 8} ${cy - 8} l-16 16`;
  }
}
