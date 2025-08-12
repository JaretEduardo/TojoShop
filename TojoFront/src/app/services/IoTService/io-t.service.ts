import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment.example';

// Interfaces relacionadas a sensores / feeds
export interface CreateFeedRequest {
  key: string;            // Clave única (coincide con 'key' backend)
  nombre: string;         // Nombre visible (se transformará a 'name')
  activo: boolean;        // Estado (se transformará a 'state')
  tipoDato: string;       // Tipo de dato (se transformará a 'type_data')
  minValue: number | null; // Rango mínimo (se transformará a 'min_value')
  maxValue: number | null; // Rango máximo (se transformará a 'max_value')
  unidad?: string | null; // Unidad física (unit)
  formato?: string | null; // data_format (number, boolean, string, id)
}

export interface SensorDto {
  id?: number;
  key: string;
  name: string;
  status: boolean;
  type_data: string;
  unit?: string | null;
  data_format?: string | null;
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

  // All Feeds
  AllFeeds(): void { }

  // Create Feed (nuevo sensor) – transforma nombres del formulario al contrato backend
  CreateFeed(payload: CreateFeedRequest): Observable<ApiCreateSensorResponse> {
    // Inferir unidad y formato si no vienen explícitos
    const mapUnidad: Record<string,string> = {
      temperatura: '°C',
      distancia: 'cm',
      humedad: '%',
      peso: 'g',
      gas: 'ppm',
      presencia: 'bool',
      puerta: 'grados',
      rfid: 'id'
    };
    const mapFormato: Record<string,string> = {
      temperatura: 'number', distancia: 'number', humedad: 'number', peso: 'number', gas: 'number', presencia: 'boolean', puerta: 'number', rfid: 'string', presencia_bool: 'boolean'
    };
    const unit = payload.unidad ?? mapUnidad[payload.tipoDato] ?? null;
    const data_format = payload.formato ?? mapFormato[payload.tipoDato] ?? null;
    const body = {
      key: payload.key.trim(),
      name: payload.nombre.trim(),
      status: payload.activo,
      type_data: payload.tipoDato,
      unit,
      data_format,
      min_value: payload.minValue,
      max_value: payload.maxValue
    };
    return this.http.post<ApiCreateSensorResponse>(`${this.baseUrl}/sensors`, body);
  }

  // Get Feed
  GetFeed(): void { }

  // Update Feed
  UpdateFeed(): void { }

  // Delete Feed
  DeleteFeed(): void { }
}
