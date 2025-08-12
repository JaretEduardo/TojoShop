import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interceptor que agrega el token Bearer a TODAS las peticiones que:
// - No sean GET
// - No sean endpoints de auth (register, login, logout)
// El token se toma de localStorage (key: 'access_token')
@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  private authPaths = ['/register', '/login', '/logout'];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.method === 'GET') return next.handle(req);

    const lowerUrl = req.url.toLowerCase();
    if (this.authPaths.some(p => lowerUrl.includes(p))) {
      return next.handle(req);
    }

    const token = localStorage.getItem('access_token');
    if (token) {
      const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      return next.handle(cloned);
    }
    return next.handle(req);
  }
}
