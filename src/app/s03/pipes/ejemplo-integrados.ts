import { Component } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe, KeyValuePipe, UpperCasePipe } from '@angular/common';

// =============================================================================
//  S03 · EJEMPLO 6 · Pipes integrados y configuración regional es-CO
//  Diapositivas 19 a 22
// -----------------------------------------------------------------------------
//  Qué muestra
//    currency, number, date, uppercase y keyvalue sobre datos fijos. A la
//    derecha de cada expresión, el resultado que Angular produce.
//
//  Dos condiciones para que funcione
//    1. Cada pipe se importa en el componente (imports). Si falta:
//           NG8004: No pipe found with name 'currency'
//    2. El formato colombiano ($ 1.800 y 3,14) requiere registrar es-CO. En
//       este proyecto está en src/app/app.config.ts. Sin él, Angular formatea
//       en en-US: $1,800 y 3.14.
//
//  Qué observar
//    - El dato sigue siendo el número 1800: el pipe solo cambia cómo se lee.
//    - keyvalue ordena por clave: guayaba, mango, patilla, no el orden escrito.
// =============================================================================

@Component({
  selector: 'app-ejemplo-integrados',
  imports: [CurrencyPipe, DecimalPipe, DatePipe, UpperCasePipe, KeyValuePipe],
  template: `
    <table class="w-full text-left text-sm">
      <thead class="bg-slate-900 text-xs uppercase text-white">
        <tr><th class="px-3 py-2">Pipe</th><th class="px-3 py-2">Resultado</th></tr>
      </thead>
      <tbody>
        <tr class="border-t border-slate-100">
          <td class="px-3 py-2 font-mono text-xs">precio | currency:'COP':'symbol-narrow':'1.0-0'</td>
          <td class="px-3 py-2 font-semibold">{{ precio | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</td>
        </tr>
        <tr class="border-t border-slate-100">
          <td class="px-3 py-2 font-mono text-xs">pi | number:'1.2-2'</td>
          <td class="px-3 py-2 font-semibold">{{ pi | number: '1.2-2' }}</td>
        </tr>
        <tr class="border-t border-slate-100">
          <td class="px-3 py-2 font-mono text-xs">hoy | date:'fullDate'</td>
          <td class="px-3 py-2 font-semibold">{{ hoy | date: 'fullDate' }}</td>
        </tr>
        <tr class="border-t border-slate-100">
          <td class="px-3 py-2 font-mono text-xs">'mango' | uppercase</td>
          <td class="px-3 py-2 font-semibold">{{ 'mango' | uppercase }}</td>
        </tr>
      </tbody>
    </table>

    <!-- keyvalue convierte un objeto en una lista de pares { key, value } -->
    <p class="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">existencias | keyvalue</p>
    <ul class="mt-1 text-sm">
      @for (par of existencias | keyvalue; track par.key) {
        <li>{{ par.key | uppercase }}: {{ par.value }}</li>
      }
    </ul>
  `,
})
export class EjemploIntegrados {
  precio = 1800;
  pi = 3.14159;
  hoy = new Date();
  existencias = { mango: 12, guayaba: 8, patilla: 2 };
}
