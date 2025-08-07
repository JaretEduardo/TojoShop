// Interface para la respuesta base del API
export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
  path?: string;
}

// Interface para los errores específicos
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

// Interface para respuestas exitosas
export interface ApiSuccess<T = any> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

// Interface para los diferentes tipos de alertas
export interface AlertData {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  statusCode?: number;
  duration?: number; // en milisegundos, opcional para auto-close
}

// Interface para configuración del interceptor
export interface InterceptorConfig {
  showSuccessAlerts: boolean;
  showErrorAlerts: boolean;
  autoCloseSuccessAfter?: number; // milisegundos
  autoCloseErrorAfter?: number; // milisegundos
}
