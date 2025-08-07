import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AlertService } from '../services/alert.service';
import { ApiResponse, ApiError, ApiSuccess } from '../interfaces/api-response.interface';

@Injectable()
export class ApiResponseInterceptor implements HttpInterceptor {

    constructor(private alertService: AlertService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Solo interceptar peticiones POST
        if (req.method !== 'POST') {
            return next.handle(req);
        }

        return next.handle(req).pipe(
            tap(event => {
                // Manejar respuestas exitosas
                if (event instanceof HttpResponse) {
                    this.handleSuccessResponse(event);
                }
            }),
            catchError((error: HttpErrorResponse) => {
                // Manejar errores
                this.handleErrorResponse(error);
                return throwError(error);
            })
        );
    }

    private handleSuccessResponse(response: HttpResponse<any>) {
        const body = response.body;

        // Verificar si la respuesta tiene la estructura esperada
        if (this.isApiResponse(body)) {
            const apiResponse = body as ApiResponse;

            // Mostrar alerta de éxito si el statusCode está en rango 200-299
            if (apiResponse.statusCode >= 200 && apiResponse.statusCode < 300) {
                this.alertService.showSuccess(
                    apiResponse.message || 'Operación realizada exitosamente',
                    'Éxito',
                    3000
                );
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
        } else if (error.message) {
            errorMessage = error.message;
        }

        // Mostrar alerta de error
        this.alertService.showError(
            errorMessage,
            errorTitle,
            statusCode,
            5000 // 5 segundos para errores
        );
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
