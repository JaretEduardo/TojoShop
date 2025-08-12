import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AlertService } from '../services/alert.service';
import { ApiResponse, ApiError, ApiSuccess } from '../interfaces/api-response.interface';
import { Router } from '@angular/router';

@Injectable()
export class ApiResponseInterceptor implements HttpInterceptor {

    constructor(private alertService: AlertService, private router: Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Interceptar métodos que modifican estado (POST, PUT, PATCH, DELETE) para mostrar alertas
        const methodsToHandle = ['POST', 'PUT', 'PATCH', 'DELETE'];
        const shouldHandle = methodsToHandle.includes(req.method);
        if (!shouldHandle) {
            return next.handle(req);
        }

        return next.handle(req).pipe(
            tap(event => {
                // Manejar respuestas exitosas
                if (event instanceof HttpResponse) {
                    this.handleSuccessResponse(event, req.method);
                }
            }),
            catchError((error: HttpErrorResponse) => {
                // Manejar errores
                this.handleErrorResponse(error);
                return throwError(error);
            })
        );
    }

    private handleSuccessResponse(response: HttpResponse<any>, method: string) {
        const body = response.body;

        // Mostrar alertas SOLO si el body tiene un 'message' string
        if (response.status >= 200 && response.status < 300) {
            const hasBodyObject = body && typeof body === 'object';
            const hasMessage = hasBodyObject && typeof body.message === 'string';
            if (hasMessage) {
                // Personalizar título según método
                let title = 'Éxito';
                switch (method) {
                    case 'DELETE': title = 'Eliminado'; break;
                    case 'PUT':
                    case 'PATCH': title = 'Actualizado'; break;
                    case 'POST': title = response.status === 201 ? 'Creado' : 'Procesado'; break;
                }
                this.alertService.showSuccess(body.message, title, 0, response.status);
            }
            // Redirección: distinguir register (201) vs login (200)
            const hasAuth = hasBodyObject && typeof body.access_token === 'string' && typeof body.role === 'string';
            if (hasAuth) {
                const role = (body.role || '').toLowerCase();
                if (response.status === 201) {
                    // Después de registrar, ir al login
                    this.router.navigate(['/auth/login']);
                } else {
                    // Después de login, redirigir por rol
                    if (role === 'usuario') this.router.navigate(['/home']);
                    else if (role === 'empleado') this.router.navigate(['/pos']);
                    else if (role === 'encargado') this.router.navigate(['/feed']);
                }
            }
        }
    }

    private handleErrorResponse(error: HttpErrorResponse) {
        let errorMessage = 'Ha ocurrido un error inesperado';
        let errorTitle = 'Error';
        let statusCode = error.status;

        // Intentar extraer información del error del backend
        if (error.error && this.isApiError(error.error)) {
            const apiError = error.error as ApiError;
            errorMessage = apiError.message || errorMessage;
            errorTitle = this.getErrorTitle(apiError.statusCode);
            statusCode = apiError.statusCode;
        } else if (error.error && typeof error.error.message === 'string') {
            // Si el backend devuelve { message: '...' } sin campos extra
            errorMessage = error.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        // Sólo mostrar alerta si tenemos un mensaje específico del backend o algo significativo
        if (errorMessage) {
            this.alertService.showError(
                errorMessage,
                this.getErrorTitle(statusCode),
                statusCode
            );
        }
    }

    private isApiResponse(obj: any): obj is ApiResponse {
        return obj &&
            typeof obj.statusCode === 'number' &&
            typeof obj.message === 'string';
    }

    private isApiError(obj: any): obj is ApiError {
        return obj &&
            typeof obj.statusCode === 'number' &&
            typeof obj.message === 'string' &&
            typeof obj.error === 'string';
    }

    private getErrorTitle(statusCode: number): string {
        switch (Math.floor(statusCode / 100)) {
            case 4:
                if (statusCode === 400) return 'Solicitud Incorrecta';
                if (statusCode === 401) return 'No Autorizado';
                if (statusCode === 403) return 'Acceso Denegado';
                if (statusCode === 404) return 'No Encontrado';
                if (statusCode === 422) return 'Datos Inválidos';
                return 'Error del Cliente';
            case 5:
                return 'Error del Servidor';
            default:
                return 'Error';
        }
    }
}
