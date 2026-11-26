import { Component, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SesionService } from '../sesion.service';

// =============================================================================
//  S11 · Ejemplo 1 · Inicio de sesión con Reactive Forms · /s11/login · Diapositivas 17 y 18
// -----------------------------------------------------------------------------
//  Qué muestra
//    - Formulario reactivo (S07) con validación: usuario obligatorio, clave de
//      al menos 8 caracteres y duración del token (1 o 30 minutos).
//    - Al enviar: SesionService.iniciar() -> POST /auth/login.
//      200 -> la sesión queda en la signal y se navega a ?volver= (o a /s11/perfil)
//      400 -> se muestra el mensaje del servidor: «Invalid credentials»
//    - ?volver= y ?motivo= llegan como input() gracias a withComponentInputBinding (S09).
//
//  Qué observar
//    - F12 > Red: POST /auth/login con la carga útil { username, password, expiresInMins }.
//    - Abrir /s11/perfil sin sesión: el guard trae aquí con ?volver=%2Fs11%2Fperfil.
//    - Clave «emilys» (6 caracteres): el botón sigue deshabilitado; no sale ninguna petición.
// =============================================================================

@Component({
  selector: 'app-s11-login',
  imports: [ReactiveFormsModule],
  template: `
    <h3 class="text-lg font-bold">Iniciar sesión</h3>
    @if (motivo()) {
      <p class="estado aviso">La sesión se cerró: {{ motivo() }}</p>
    } @else if (volver()) {
      <p class="estado aviso">La ruta {{ volver() }} exige iniciar sesión.</p>
    }

    <form [formGroup]="formulario" (ngSubmit)="enviar()" class="mt-3 grid max-w-sm gap-3">
      <label class="campo">Usuario
        <input formControlName="username" autocomplete="username" />
      </label>
      @if (formulario.controls.username.touched && formulario.controls.username.hasError('required')) {
        <span class="falla">El usuario es obligatorio.</span>
      }
      <label class="campo">Clave
        <input type="password" formControlName="password" autocomplete="current-password" />
      </label>
      @if (formulario.controls.password.touched && formulario.controls.password.invalid) {
        <span class="falla">La clave es obligatoria y tiene al menos 8 caracteres.</span>
      }
      <label class="campo">Duración del token
        <select formControlName="minutos">
          <option [ngValue]="1">1 minuto (para ver el vencimiento)</option>
          <option [ngValue]="30">30 minutos</option>
        </select>
      </label>
      <button type="submit" class="boton" [disabled]="formulario.invalid || enviando()">
        {{ enviando() ? 'Validando…' : 'Entrar' }}
      </button>
      @if (error()) {
        <p class="estado error">{{ error() }}</p>
      }
    </form>
    <p class="mt-4 text-xs text-slate-500">Usuarios de prueba: emilys / emilyspass · michaelw / michaelwpass</p>
  `,
  styles: `
    .campo { display: grid; gap: .25rem; font-size: .85rem; font-weight: 600; color: #334155; }
    .campo input, .campo select { border: 1px solid #cbd5e1; border-radius: .5rem; padding: .4rem .6rem; font-weight: 400; }
    .falla { font-size: .8rem; color: #b91c1c; margin-top: -.5rem; }
    .boton { border-radius: .5rem; background: #1e3a8a; color: #fff; padding: .5rem; font-weight: 600; }
    .boton:disabled { opacity: .4; }
    .estado { margin-top: .75rem; border-radius: .5rem; padding: .6rem .8rem; font-size: .9rem; }
    .aviso { background: #fffbeb; color: #92400e; }
    .error { background: #fef2f2; color: #991b1b; }
  `,
})
export class Login {
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  /** ?volver=/s11/perfil y ?motivo=Token Expired! (withComponentInputBinding) */
  readonly volver = input<string>();
  readonly motivo = input<string>();

  readonly enviando = signal(false);
  readonly error = signal('');

  readonly formulario = inject(FormBuilder).nonNullable.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    minutos: [30],
  });

  enviar(): void {
    const { username, password, minutos } = this.formulario.getRawValue();
    this.enviando.set(true);
    this.error.set('');
    this.sesion.iniciar(username, password, minutos).subscribe({
      next: () => this.router.navigateByUrl(this.volver() || '/s11/perfil'),
      error: (e: HttpErrorResponse) => {
        this.enviando.set(false);
        this.error.set(e.status === 0 ? 'No hay conexión con el servidor.' : (e.error?.message ?? `Error ${e.status}`));
      },
    });
  }
}
