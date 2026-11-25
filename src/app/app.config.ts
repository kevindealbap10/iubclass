import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

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
    // S09 · withComponentInputBinding: :id y ?categoria= llegan a los input() del componente
    provideRouter(routes, withComponentInputBinding()), provideClientHydration(),
    { provide: LOCALE_ID, useValue: 'es-CO' },
    // S10 · HttpClient. En Angular 22 ya está disponible en root y usa fetch por defecto;
    // provideHttpClient() se declara para configurarlo (interceptores en la S11).
    provideHttpClient(),
  ]
};
