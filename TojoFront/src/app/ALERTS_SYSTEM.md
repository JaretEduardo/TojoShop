# Sistema de Alertas Cyberpunk - Documentación

## Descripción General

Este sistema de alertas reemplaza las alertas nativas del navegador (`alert()`, `confirm()`) con modales personalizados que mantienen la estética cyberpunk del sitio. El sistema incluye:

- **Componente de alertas**: Modal personalizado con estilos cyberpunk
- **Servicio de alertas**: Gestión del estado y tipos de alerta
- **Interceptor HTTP**: Captura automática de respuestas del backend
- **Interfaces TypeScript**: Tipado fuerte para respuestas de API

## Componentes del Sistema

### 1. Interfaces (`/interfaces/api-response.interface.ts`)

```typescript
// Respuesta genérica de API
interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
  path?: string;
}

// Datos de alerta
interface AlertData {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  statusCode?: number;
  duration?: number;
}
```

### 2. Servicio de Alertas (`/services/alert.service.ts`)

El servicio proporciona métodos para mostrar diferentes tipos de alertas:

```typescript
// Inyectar el servicio
constructor(private alertService: AlertService) {}

// Tipos de alertas disponibles
alertService.showSuccess(message, title?, duration?)
alertService.showError(message, title?, statusCode?, duration?)
alertService.showWarning(message, title?, duration?)
alertService.showInfo(message, title?, duration?)
```

### 3. Interceptor HTTP (`/interceptors/api-response.interceptor.ts`)

Captura automáticamente las respuestas de peticiones POST y muestra alertas según el resultado:

- **Respuestas exitosas (200-299)**: Alerta de éxito automática
- **Errores del cliente (400-499)**: Alerta de error específica
- **Errores del servidor (500-599)**: Alerta de error del servidor

### 4. Componente de Alertas (`/shared/alerts/alerts.component.*`)

Modal personalizado con estilos cyberpunk que se integra globalmente en la aplicación.

## Configuración

### 1. Instalar en app.config.ts

```typescript
import { ApiResponseInterceptor } from './interceptors/api-response.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... otros providers
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiResponseInterceptor,
      multi: true
    }
  ]
};
```

### 2. Agregar al layout principal (app.component.html)

```html
<router-outlet />
<app-alerts></app-alerts>
```

## Uso del Sistema

### Uso Manual del Servicio

```typescript
import { AlertService } from '../services/alert.service';

@Component({...})
export class MiComponente {
  constructor(private alertService: AlertService) {}

  // Validación de formulario
  validarFormulario() {
    if (!this.email) {
      this.alertService.showWarning(
        'Por favor ingresa tu email',
        'Campo requerido'
      );
      return;
    }

    if (!this.emailValido(this.email)) {
      this.alertService.showError(
        'El formato del email no es válido',
        'Email inválido'
      );
      return;
    }

    this.alertService.showSuccess(
      'Formulario validado correctamente',
      'Éxito'
    );
  }

  // Información general
  mostrarInfo() {
    this.alertService.showInfo(
      'Esta función estará disponible próximamente',
      'Información'
    );
  }
}
```

### Uso Automático con HTTP

El interceptor captura automáticamente las respuestas de peticiones POST:

```typescript
// En un servicio
register(userData: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
  return this.http.post<ApiResponse<AuthResponse>>('/api/register', userData);
  // El interceptor manejará automáticamente las alertas de éxito/error
}

// En un componente
registrarUsuario() {
  this.authService.register(this.userData).subscribe({
    next: (response) => {
      // La alerta de éxito se muestra automáticamente
      console.log('Usuario registrado:', response);
    },
    error: (error) => {
      // La alerta de error se muestra automáticamente
      console.error('Error en registro:', error);
    }
  });
}
```

## Tipos de Alertas

### 1. Success (Éxito)
- **Color**: Verde (`#22c55e`)
- **Uso**: Operaciones completadas exitosamente
- **Duración por defecto**: 3 segundos

### 2. Error
- **Color**: Rojo (`#ef4444`)
- **Uso**: Errores de validación, errores del servidor
- **Duración por defecto**: 5 segundos

### 3. Warning (Advertencia)
- **Color**: Amarillo (`#fbbf24`)
- **Uso**: Validaciones, campos requeridos
- **Duración por defecto**: 4 segundos

### 4. Info (Información)
- **Color**: Azul (`#3b82f6`)
- **Uso**: Información general, tips
- **Duración por defecto**: 3 segundos

## Personalización

### Duración Personalizada

```typescript
// Alerta que se cierra automáticamente en 10 segundos
this.alertService.showSuccess(
  'Operación completada',
  'Éxito',
  10000 // 10 segundos
);

// Alerta que no se cierra automáticamente
this.alertService.showError(
  'Error crítico',
  'Error',
  500,
  0 // Sin auto-close
);
```

### Códigos de Estado

```typescript
// Mostrar código de estado específico
this.alertService.showError(
  'No tienes permisos para esta acción',
  'Acceso Denegado',
  403
);
```

## Estructura del Backend Esperada

El interceptor espera respuestas con la siguiente estructura:

### Respuesta Exitosa
```json
{
  "statusCode": 200,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {...},
    "token": "..."
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Respuesta de Error
```json
{
  "statusCode": 422,
  "message": "Los datos proporcionados no son válidos",
  "error": "Validation Error",
  "details": {
    "email": ["El email ya está en uso"]
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Ventajas del Sistema

1. **Consistencia Visual**: Mantiene la estética cyberpunk en toda la aplicación
2. **Automatización**: Manejo automático de respuestas HTTP
3. **Tipado Fuerte**: Interfaces TypeScript para mayor seguridad
4. **Flexibilidad**: Uso manual y automático según necesidades
5. **UX Mejorada**: Mejor experiencia que las alertas nativas del navegador
6. **Responsivo**: Adapta a diferentes tamaños de pantalla
7. **Accesibilidad**: Mejor soporte para lectores de pantalla

## Ejemplos de Integración

Ver implementaciones en:
- `components/register-form/register-form.component.ts` - Validación manual y registro automático
- `services/auth.service.ts` - Servicio con peticiones HTTP
- `shared/alerts/alerts.component.*` - Componente de alertas
