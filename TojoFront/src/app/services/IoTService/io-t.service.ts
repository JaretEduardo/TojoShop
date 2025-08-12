import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';

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
  state: string; // 'activo' | 'inactivo'
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

@Injectable({ providedIn: 'root' })
export class IoTService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get Last Data
  GetLastData(): void { }

  // Create Data
  CreateData(): void { }

  // Update Data Point
  UpdateDataPoint(): void { }

  // Delete Data Point
  DeleteDataPoint(): void { }

  // Get Feed Data
  GetFeedData(): void { }

  // Chart Feed Data
  ChartFeedData(): void { }

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

  // Get Feed
  GetFeed(): void { }

  // Update Feed
  UpdateFeed(): void { }

  // Delete Feed by key
  DeleteFeed(key: string): Observable<ApiDeleteSensorResponse> {
    return this.http.delete<ApiDeleteSensorResponse>(`${this.baseUrl}${environment.endpoints.bossendpoints.deletefeed}/${encodeURIComponent(key)}`);
  }
}
