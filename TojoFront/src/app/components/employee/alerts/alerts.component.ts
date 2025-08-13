import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IoTService, SensorDto, ApiSensorDataResponse, SensorDataReading } from '../../../services/IoTService/io-t.service';
import { RealtimeService, RealtimeSensorEvent } from '../../../services/realtime/realtime.service';

export interface SensorReading {
  id: number;
  value: number | string; // Soportar tanto números como strings (para RFID UIDs)
  timestamp: Date;
  status: 'normal' | 'warning' | 'critical';
  statusText: string;
}

export interface SensorData {
  name: string;
  icon: string;
  minValue: number;
  maxValue: number;
  unit: string;
  status: 'online' | 'offline' | 'warning';
  statusText: string;
  readings: SensorReading[];
}

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.css'
})
export class AlertsComponent implements OnInit, OnDestroy {
  selectedSensor: string = '';
  loading = false;
  error: string | null = null;

  sensorsData: { [key: string]: SensorData } = {};
  private pendingEvents: RealtimeSensorEvent[] = []; // eventos recibidos antes de tener el mapa
  private pollInterval: any; // Para el polling automático
  // Mapa simple de iconos por tipo (fallback en caso de no reconocer)
  private typeIcon: Record<string, string> = {
    presencia: '👁️',
    temperatura: '🌡️',
    humedad: '💦',
    puerta: '🚪',
    peso: '⚖️',
    rfid: '🏷️',
    gas: '💨'
  };

  constructor(private iot: IoTService, private realtime: RealtimeService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchSensors();
    this.realtime.init();
    this.realtime.onSensorData().subscribe(evt => this.handleRealtime(evt));
    
    // Iniciar polling automático cada 3 segundos
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  private startAutoRefresh(): void {
    this.pollInterval = setInterval(() => {
      if (this.selectedSensor && !this.loading) {
        console.debug('[AlertsComponent] Auto-refresh para sensor:', this.selectedSensor);
        this.loadSensorData(this.selectedSensor, true); // silent = true para no mostrar loading
      }
    }, 3000); // cada 3 segundos
  }

  private fetchSensors(): void {
    this.loading = true;
    this.error = null;
    this.iot.AllFeeds().subscribe({
      next: resp => {
        const list = resp.data || [];
        const map: { [k: string]: SensorData } = {};
        list.forEach((s: SensorDto) => {
          const type = s.type_data.toLowerCase();
          const isActive = (s as any).status !== undefined ? (s as any).status : (s.state === 'activo');
          map[s.key] = {
            name: s.name,
            icon: this.typeIcon[type] || '🔧',
            minValue: s.min_value ?? 0,
            maxValue: s.max_value ?? 0,
            unit: this.guessUnit(type),
            status: isActive ? 'online' : 'offline',
            statusText: isActive ? 'Activo' : 'Inactivo',
            readings: [] // luego se llenará con endpoint de datos históricos
          };
        });
        this.sensorsData = map;
        // Seleccionar el primero disponible si no hay seleccionado
        if (!this.selectedSensor) {
          const firstKey = Object.keys(this.sensorsData)[0];
          if (firstKey) {
            this.selectedSensor = firstKey;
            this.loadSensorData(firstKey, false); // Cargar datos al autoseleccionar sin silent
          }
        }
        // Procesar eventos pendientes que llegaron antes de terminar el fetch
        if (this.pendingEvents.length) {
          console.debug('[AlertsComponent] Procesando eventos pendientes', this.pendingEvents.length);
          const copy = [...this.pendingEvents];
          this.pendingEvents = [];
          copy.forEach(ev => this.handleRealtime(ev));
        }
        this.loading = false;
      },
      error: err => {
        this.error = 'No se pudieron cargar los sensores';
        this.loading = false;
      }
    });
  }

  private guessUnit(type: string): string {
    switch (type) {
      case 'temperatura': return '°C';
      case 'humedad': return '%';
      case 'gas': return 'ppm';
      case 'peso': return 'g';
      case 'puerta': return '°';
      case 'presencia': return 'cm';
      case 'rfid': return ''; // Sin unidad para RFID, mostrar UID tal como viene
      default: return '';
    }
  }

  selectSensor(sensorKey: string): void {
    this.selectedSensor = sensorKey;
    this.loadSensorData(sensorKey, false); // Carga manual, no silent
    
    // Reiniciar polling para el nuevo sensor
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    this.startAutoRefresh();
  }

  private loadSensorData(sensorKey: string, silent: boolean = false): void {
    // En modo silencioso, saltar el spinner del interceptor
    this.iot.GetSensorData(sensorKey, silent).subscribe({
      next: (resp: ApiSensorDataResponse) => {
        const sensor = this.sensorsData[sensorKey];
        if (sensor) {
          // Convertir datos del backend a formato de lectura
          const readings: SensorReading[] = resp.data.map(item => {
            // Para RFID, mantener el valor como string (UID completo)
            // Para otros sensores, convertir a número
            let value: number | string;
            if (sensor.unit === '' && (sensor.name.toLowerCase().includes('rfid') || sensor.icon === '🏷️')) {
              value = item.value; // Mantener como string para RFID
            } else {
              value = parseFloat(item.value) || 0; // Convertir a número para otros sensores
            }
            
            return {
              id: item.id,
              value: value,
              timestamp: new Date(item.received_at),
              status: 'normal' as const,
              statusText: 'Histórico'
            };
          });
          
          // Ordenar por timestamp descendente (más reciente primero)
          readings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          
          sensor.readings = readings;
          this.cdr.detectChanges(); // Forzar actualización de vista
          
          if (!silent) {
            console.debug('[AlertsComponent] Cargados datos históricos para', sensorKey, readings.length);
          }
        }
      },
      error: err => {
        if (!silent) {
          console.warn('[AlertsComponent] Error cargando datos del sensor', sensorKey, err);
        }
        // Mantener readings existentes (de tiempo real) si falla el histórico
      }
    });
  }

  getSensorName(): string {
    return this.sensorsData[this.selectedSensor]?.name || 'Seleccionar Sensor';
  }

  getSensorIcon(): string {
    return this.sensorsData[this.selectedSensor]?.icon || '❓';
  }

  getSensorData(): SensorData {
    return this.sensorsData[this.selectedSensor] || {
      name: 'Sin Seleccionar',
      icon: '❓',
      minValue: 0,
      maxValue: 0,
      unit: '',
      status: 'offline',
      statusText: 'Desconectado',
      readings: []
    };
  }

  getSensorReadings(): SensorReading[] {
    return this.getSensorData().readings || [];
  }

  getSensorKeys(): string[] {
    return Object.keys(this.sensorsData);
  }

  getTypeClass(key: string): string {
    const type = (this.sensorsData[key]?.unit || '').toLowerCase();
    // Usamos el type_data original si hace falta inferencia: buscar por nombre también
    const sensor = this.sensorsData[key];
    if (!sensor) return '';
    // map simple según icono o heurística de nombre
    const name = sensor.name.toLowerCase();
    if (name.includes('presenc')) return 'presence';
    if (name.includes('temperat')) return 'temperature';
    if (name.includes('humedad')) return 'door'; /* reutilizamos estilo door (verde) */
    if (name.includes('puerta')) return 'door';
    if (name.includes('peso')) return 'weight';
    if (name.includes('rfid')) return 'rfid';
    if (name.includes('gas')) return 'gas';
    return '';
  }

  getStatusIcon(): string {
    const status = this.getSensorData().status;
    switch (status) {
      case 'online': return '🟢';
      case 'warning': return '🟡';
      case 'offline': return '🔴';
      default: return '⚪';
    }
  }

  refreshData(): void {
    if (this.selectedSensor) {
      this.loadSensorData(this.selectedSensor, false); // Refresh manual, no silent
    }
  }

  private handleRealtime(evt: RealtimeSensorEvent): void {
    // Log inicial del evento recibido
    console.debug('[AlertsComponent] Evento realtime recibido', evt);
    const key = evt.feed_key || evt.sensor_key;
    const sensor = this.sensorsData[key];
    if (!sensor) {
  console.warn('[AlertsComponent] Evento para sensor no listado aún, se encola', key);
  this.pendingEvents.push(evt);
  return; // se reprocesará tras fetch
    }
    
    // Para RFID, mantener el valor como string (UID completo)
    // Para otros sensores, convertir a número
    let value: number | string;
    if (sensor.unit === '' && (sensor.name.toLowerCase().includes('rfid') || sensor.icon === '🏷️')) {
      value = evt.value; // Mantener como string para RFID
    } else {
      const numeric = parseFloat(evt.value);
      value = isNaN(numeric) ? 0 : numeric; // Convertir a número para otros sensores
    }
    
    const reading: SensorReading = {
      id: Date.now(),
      value: value,
      timestamp: new Date(evt.received_at),
      status: 'normal',
      statusText: 'En tiempo real'
    };
    // Insertar al inicio y verificar duplicados por timestamp cercano
    const existingIndex = sensor.readings.findIndex(r => 
      Math.abs(r.timestamp.getTime() - reading.timestamp.getTime()) < 1000 &&
      r.value === reading.value
    );
    if (existingIndex === -1) {
      sensor.readings.unshift(reading);
      if (sensor.readings.length > 50) sensor.readings = sensor.readings.slice(0, 50);
      console.debug('[AlertsComponent] Nueva lectura en tiempo real para', key, reading.value);
      
      // Forzar detección de cambios para actualizar la vista inmediatamente
      this.cdr.detectChanges();
    }
    // Si no hay seleccionado aún, seleccionar este
    if (!this.selectedSensor) {
      this.selectedSensor = key;
      console.debug('[AlertsComponent] Autoseleccionado sensor', key);
      this.cdr.detectChanges();
    }
    // Forzar actualización (por si ChangeDetection OnPush se añade en el futuro)
    // (sin OnPush no es estrictamente necesario)
  }
}
