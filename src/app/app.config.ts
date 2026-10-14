import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

// S03 · Configuración regional es-CO (diapositiva 21).
// registerLocaleData carga los datos de formato de Colombia; LOCALE_ID los
// activa en toda la aplicación. Con esto, currency, number y date escriben
// $ 1.800 y 3,14 en lugar de $1,800 y 3.14.
// Si se declara LOCALE_ID sin registerLocaleData, la aplicación no arranca:
//     NG0701: Missing locale data for the locale "es-CO"
registerLocaleData(localeEsCo);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(),
    { provide: LOCALE_ID, useValue: 'es-CO' },
  ]
};
