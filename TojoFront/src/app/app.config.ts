import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { SpinnerInterceptor } from './interceptors/spinner.interceptor';
import { ApiResponseInterceptor } from './interceptors/api-response.interceptor';
import { AuthTokenInterceptor } from './interceptors/auth-token.interceptor';

// Limpia localStorage al inicio: mantiene solo 'access_token'
function sanitizeStorageFactory() {
  return () => {
    try {
  const allowed = new Set(['access_token', 'user_name', 'user_role']);
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (!allowed.has(key)) {
          localStorage.removeItem(key);
        }
      }
    } catch {}
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideClientHydration(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: APP_INITIALIZER, useFactory: sanitizeStorageFactory, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthTokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SpinnerInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiResponseInterceptor,
      multi: true
    }
  ]
};
