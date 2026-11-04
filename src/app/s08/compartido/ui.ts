import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Producto, normalizar, pesos } from '../inventario';

// =============================================================================
//  S08 · Piezas visuales compartidas por los ejemplos
// -----------------------------------------------------------------------------
//    app-producto       tarjeta de producto del catálogo: nombre con la
//                       coincidencia resaltada, categoría, precio y barra de
//                       existencias (agotado, bajo o disponible, como en la S03)
//    app-guia-ejemplo   cuadros «Qué observar» y «En su proyecto»
//    app-indicador      tarjeta de cifra (total, valor, agotados...)
//    app-cargando       indicador de carga animado
//  Sin librerías: solo CSS. Los colores indican estado y siempre van con texto.
// =============================================================================

export type EstadoStock = 'agotado' | 'bajo' | 'disponible';

/** Regla de la S03: 0 agotado · 1 o 2 bajo · 3 o más disponible. */
export function estadoStock(cantidad: number): EstadoStock {
  return cantidad === 0 ? 'agotado' : cantidad <= 2 ? 'bajo' : 'disponible';
}

/** Parte un texto en antes, coincidencia y después, ignorando tildes y mayúsculas. */
export function segmentos(texto: string, patron: string): { antes: string; coincide: string; despues: string } {
  const base = (s: string) => [...s].map((c) => c.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()).join('');
  const p = normalizar(patron);
  const i = p ? base(texto).indexOf(p) : -1;
  if (i < 0) return { antes: texto, coincide: '', despues: '' };
  return { antes: texto.slice(0, i), coincide: texto.slice(i, i + p.length), despues: texto.slice(i + p.length) };
}

@Component({
  selector: 'app-producto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article [class]="'tarjeta ' + estado()">
      <header>
        <h5>{{ partes().antes }}@if (partes().coincide) {<mark>{{ partes().coincide }}</mark>}{{ partes().despues }}</h5>
        <span class="cat">{{ producto().categoria }}</span>
      </header>
      <p class="precio">{{ pesos(producto().precio) }}</p>
      <div class="barra" role="img" [attr.aria-label]="producto().cantidad + (producto().cantidad === 1 ? ' unidad, ' : ' unidades, ') + estado()">
        <span [style.width.%]="porcentaje()"></span>
      </div>
      <p class="stock">{{ producto().cantidad }} {{ producto().cantidad === 1 ? 'unidad' : 'unidades' }} · <strong>{{ estado() }}</strong></p>
    </article>
  `,
  styles: `
    .tarjeta { border: 1px solid #e2e8f0; border-top: 4px solid #16a34a; border-radius: .6rem; background: #fff; padding: .55rem .7rem; font-size: .8rem; }
    .tarjeta.bajo { border-top-color: #d97706; }
    .tarjeta.agotado { border-top-color: #dc2626; background: #fef2f2; }
    header { display: flex; justify-content: space-between; align-items: baseline; gap: .4rem; }
    h5 { font-size: .9rem; font-weight: 700; color: #0f172a; }
    mark { background: #fde68a; color: inherit; border-radius: .2rem; padding: 0 .1rem; }
    .cat { font-size: .65rem; text-transform: uppercase; letter-spacing: .08em; color: #64748b; }
    .precio { margin: .15rem 0 .35rem; font-weight: 600; color: #334155; }
    .barra { height: .5rem; border-radius: 1rem; background: #e2e8f0; overflow: hidden; }
    .barra span { display: block; height: 100%; background: #16a34a; border-radius: 1rem; transition: width .3s; }
    .bajo .barra span { background: #d97706; }
    .agotado .barra span { background: #dc2626; }
    .stock { margin-top: .3rem; color: #475569; }
    .agotado strong { color: #b91c1c; }
    .bajo strong { color: #b45309; }
    .disponible strong { color: #15803d; }
  `,
})
export class TarjetaProducto {
  readonly producto = input.required<Producto>();
  readonly resaltar = input('');
  protected readonly pesos = pesos;
  protected readonly estado = computed(() => estadoStock(this.producto().cantidad));
  protected readonly partes = computed(() => segmentos(this.producto().nombre, this.resaltar()));
  protected readonly porcentaje = computed(() => Math.min(100, (this.producto().cantidad / 30) * 100));
}

@Component({
  selector: 'app-guia-ejemplo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="guia">
      <section class="observar">
        <h6>Qué observar</h6>
        <ul>@for (linea of observar(); track $index) { <li>{{ linea }}</li> }</ul>
      </section>
      <section class="proyecto">
        <h6>En su proyecto</h6>
        <p>{{ proyecto() }}</p>
      </section>
    </div>
  `,
  styles: `
    .guia { display: grid; grid-template-columns: 3fr 2fr; gap: .7rem; margin: .2rem 0 .9rem; }
    @media (max-width: 40rem) { .guia { grid-template-columns: 1fr; } }
    section { border-radius: .5rem; padding: .55rem .8rem; font-size: .8rem; line-height: 1.45; }
    .observar { background: #eff6ff; border-left: 4px solid #2563eb; }
    .proyecto { background: #fffbeb; border-left: 4px solid #d97706; }
    h6 { font-size: .68rem; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; margin-bottom: .2rem; }
    .observar h6 { color: #1d4ed8; }
    .proyecto h6 { color: #b45309; }
    ul { padding-left: 1rem; list-style: disc; }
  `,
})
export class GuiaEjemplo {
  readonly observar = input.required<string[]>();
  readonly proyecto = input.required<string>();
}

@Component({
  selector: 'app-indicador',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="'ind ' + tono()">
      <span class="cifra">{{ valor() }}</span>
      <span class="rotulo">{{ rotulo() }}</span>
    </div>
  `,
  styles: `
    .ind { border-radius: .6rem; padding: .5rem .8rem; background: #f1f5f9; border: 1px solid #e2e8f0; min-width: 7rem; }
    .cifra { display: block; font-size: 1.35rem; font-weight: 800; color: #0f172a; line-height: 1.2; }
    .rotulo { font-size: .68rem; text-transform: uppercase; letter-spacing: .08em; color: #64748b; }
    .ind.alerta { background: #fef2f2; border-color: #fecaca; } .alerta .cifra { color: #b91c1c; }
    .ind.aviso { background: #fffbeb; border-color: #fde68a; } .aviso .cifra { color: #b45309; }
    .ind.bien { background: #f0fdf4; border-color: #bbf7d0; } .bien .cifra { color: #15803d; }
  `,
})
export class Indicador {
  readonly valor = input.required<string | number>();
  readonly rotulo = input.required<string>();
  readonly tono = input<'neutro' | 'alerta' | 'aviso' | 'bien'>('neutro');
}

@Component({
  selector: 'app-cargando',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="cargando" role="status"><i class="rueda"></i>{{ texto() }}</span>`,
  styles: `
    .cargando { display: inline-flex; align-items: center; gap: .45rem; font-size: .82rem; color: #92400e; }
    .rueda { width: .9rem; height: .9rem; border: 2px solid #fcd34d; border-top-color: #b45309; border-radius: 50%; animation: gira .8s linear infinite; }
    @keyframes gira { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { .rueda { animation-duration: 3s; } }
  `,
})
export class Cargando {
  readonly texto = input('Buscando…');
}
