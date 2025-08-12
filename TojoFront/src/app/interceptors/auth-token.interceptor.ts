import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';

// Interceptor que agrega el token Bearer a TODAS las peticiones que:
// - No sean GET
// - No sean endpoints de auth (register, login, logout)
// El token se toma de localStorage (key: 'access_token')
@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
    private authPaths = [
        environment.endpoints.register,
        environment.endpoints.login,
        environment.endpoints.logout,
    ];

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const lowerUrl = req.url.toLowerCase();

        // 1. Endpoints públicos de auth: no token
        if (this.authPaths.some(p => lowerUrl.includes(p))) {
            return next.handle(req);
        }

        // 2. GETs públicos de productos (listar, categorías, búsqueda) sin token
        const publicProductPaths = [
            environment.endpoints.productsIndex,
            environment.endpoints.productsCategories,
            environment.endpoints.productsSearch,
        ];
        const isPublicProductsGet = req.method === 'GET' && publicProductPaths.some(p => lowerUrl.includes(p.toLowerCase()));
        if (isPublicProductsGet) {
            return next.handle(req);
        }

        // 3. Todo lo demás requiere token (incluye otros GETs como /allfeeds)
        const token = localStorage.getItem('access_token');
        if (token) {
            const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
            return next.handle(cloned);
        }
        return next.handle(req);
    }
}
