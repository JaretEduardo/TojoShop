import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';
import { SKIP_SPINNER } from '../../interceptors/http-context-tokens';

// Interfaces relacionadas a sensores / feeds
export interface CreateFeedRequest {
  key: string;            // Clave única (coincide con 'key' backend)
  nombre: string;         // Nombre visible (se transformará a 'name')
  activo: boolean;        // Estado (se transformará a 'state')
  tipoDato: string;       // Tipo de dato (se transformará a 'type_data')
  minValue: number | null; // Rango mínimo (se transformará a 'min_value')
  maxValue: number | null; // Rango máximo (se transformará a 'max_value')
}

export interface SensorDto {
  id?: number;
  key: string;
  name: string;
  state: string; // legacy string form 'activo' | 'inactivo' (si se usa)
  status?: boolean; // backend devuelve boolean verdadero/falso
  type_data: string;
  min_value: number | null;
  max_value: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiCreateSensorResponse {
  statusCode: number;
  message: string;
  data: SensorDto;
}

export interface ApiListSensorsResponse {
  statusCode: number;
  message?: string;
  data: SensorDto[];
}

export interface ApiDeleteSensorResponse {
  statusCode: number;
  message: string;
}

export interface UpdateFeedRequest {
  key?: string;           // Key no se cambia, pero puede venir
  nombre: string;         // Nombre visible (se transformará a 'name')
  activo: boolean;        // Estado (se transformará a 'status')
  tipoDato: string;       // Tipo de dato (se transformará a 'type_data')
  minValue: number | null; // Rango mínimo (se transformará a 'min_value')
  maxValue: number | null; // Rango máximo (se transformará a 'max_value')
}

export interface ApiUpdateSensorResponse {
  statusCode: number;
  message: string;
  data: SensorDto;
}

export interface SensorDataReading {
  id: number;
  value: string;
  received_at: string;
  feed_key: string;
}

export interface ApiSensorDataResponse {
  statusCode: number;
  message: string;
  data: SensorDataReading[];
  sensor: {
    key: string;
    name: string;
    type_data: string;
    min_value: number | null;
    max_value: number | null;
  };
}

export interface UpdateDataPointRequest {
  value: string;
  received_at: string;
}

export interface ApiUpdateDataPointResponse {
  statusCode: number;
  message: string;
  data: SensorDataReading;
}

export interface ApiDeleteDataPointResponse {
  statusCode: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class IoTService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get Last Data
  GetLastData(): void { }

  // Create Data
  CreateData(): void { }

  // Update Data Point
  UpdateDataPoint(dataId: number, payload: UpdateDataPointRequest): Observable<ApiUpdateDataPointResponse> {
    return this.http.put<ApiUpdateDataPointResponse>(`${this.baseUrl}${environment.endpoints.bossendpoints.updatedatapoint}/${dataId}`, payload);
  }

  // Delete Data Point
  DeleteDataPoint(dataId: number): Observable<ApiDeleteDataPointResponse> {
    return this.http.delete<ApiDeleteDataPointResponse>(`${this.baseUrl}${environment.endpoints.bossendpoints.deletedatapoint}/${dataId}`);
  }

  // Get Feed Data - obtiene datos RFID no vinculados
  GetFeedData(feedKey: string): Observable<ApiSensorDataResponse> {
    return this.http.get<ApiSensorDataResponse>(`${this.baseUrl}${environment.endpoints.bossendpoints.getfeeddata}/${encodeURIComponent(feedKey)}`);
  }

  // Chart Feed Data - obtiene datos para gráficas de un sensor específico
  ChartFeedData(key: string): Observable<ApiSensorDataResponse> {
    return this.http.get<ApiSensorDataResponse>(`${this.baseUrl}${environment.endpoints.bossendpoints.chartfeed}/${encodeURIComponent(key)}`);
  }

  // All Feeds (lista de sensores)
  AllFeeds(): Observable<ApiListSensorsResponse> {
    return this.http.get<ApiListSensorsResponse>(`${this.baseUrl}${environment.endpoints.bossendpoints.allfeeds}`);
  }

  // Create Feed (nuevo sensor) – transforma nombres del formulario al contrato backend
  CreateFeed(payload: CreateFeedRequest): Observable<ApiCreateSensorResponse> {
    const body = {
      key: payload.key.trim(),
      name: payload.nombre.trim(),
      // Backend ahora espera 'status' boolean y 'type_data'
      status: payload.activo, // true/false
      type_data: payload.tipoDato,
      min_value: payload.minValue,
      max_value: payload.maxValue
    };
    return this.http.post<ApiCreateSensorResponse>(`${this.baseUrl}${environment.endpoints.bossendpoints.createfeed}`, body);
  }

  // Get Feed - obtiene todos los datos históricos de un sensor específico
  GetFeed(key: string): Observable<ApiSensorDataResponse> {
    return this.http.get<ApiSensorDataResponse>(`${this.baseUrl}${environment.endpoints.bossendpoints.getfeed}/${encodeURIComponent(key)}`);
  }

  // Update Feed
  UpdateFeed(key: string, payload: UpdateFeedRequest): Observable<ApiUpdateSensorResponse> {
    const body = {
      name: payload.nombre.trim(),
      status: payload.activo, // true/false
      type_data: payload.tipoDato,
      min_value: payload.minValue,
      max_value: payload.maxValue
    };
    return this.http.put<ApiUpdateSensorResponse>(`${this.baseUrl}${environment.endpoints.bossendpoints.updatefeed}/${encodeURIComponent(key)}`, body);
  }

  // Delete Feed by key
  DeleteFeed(key: string): Observable<ApiDeleteSensorResponse> {
    return this.http.delete<ApiDeleteSensorResponse>(`${this.baseUrl}${environment.endpoints.bossendpoints.deletefeed}/${encodeURIComponent(key)}`);
  }

  // Get Sensor Recent Data
  GetSensorData(key: string, skipSpinner: boolean = false): Observable<ApiSensorDataResponse> {
    const context = skipSpinner ? new HttpContext().set(SKIP_SPINNER, true) : new HttpContext();
    return this.http.get<ApiSensorDataResponse>(`${this.baseUrl}/sensor/${encodeURIComponent(key)}/data`, { context });
  }

  // Vincular RFID
  VincularRFID(payload: { user_id: number; rfid_value: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}${environment.endpoints.bossendpoints.vincularrfid}`, payload);
  }
}
