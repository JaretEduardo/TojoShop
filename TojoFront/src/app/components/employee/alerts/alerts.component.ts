import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SensorReading {
  id: number;
  value: number;
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
export class AlertsComponent {
  selectedSensor: string = 'presence';

  // Mock data para los sensores
  sensorsData: { [key: string]: SensorData } = {
    presence: {
      name: 'Sensor de Presencia',
      icon: '👁️',
      minValue: 0,
      maxValue: 100,
      unit: 'cm',
      status: 'online',
      statusText: 'Activo',
      readings: [
        { id: 1, value: 15, timestamp: new Date(), status: 'normal', statusText: 'Normal' },
        { id: 2, value: 8, timestamp: new Date(Date.now() - 30000), status: 'warning', statusText: 'Cerca' },
        { id: 3, value: 25, timestamp: new Date(Date.now() - 60000), status: 'normal', statusText: 'Normal' },
        { id: 4, value: 3, timestamp: new Date(Date.now() - 90000), status: 'critical', statusText: 'Muy Cerca' },
        { id: 5, value: 45, timestamp: new Date(Date.now() - 120000), status: 'normal', statusText: 'Normal' }
      ]
    },
    temperature: {
      name: 'Sensor de Temperatura',
      icon: '🌡️',
      minValue: -10,
      maxValue: 50,
      unit: '°C',
      status: 'online',
      statusText: 'Funcionando',
      readings: [
        { id: 1, value: 22.5, timestamp: new Date(), status: 'normal', statusText: 'Óptima' },
        { id: 2, value: 28.1, timestamp: new Date(Date.now() - 30000), status: 'warning', statusText: 'Alta' },
        { id: 3, value: 21.8, timestamp: new Date(Date.now() - 60000), status: 'normal', statusText: 'Normal' },
        { id: 4, value: 35.2, timestamp: new Date(Date.now() - 90000), status: 'critical', statusText: 'Crítica' },
        { id: 5, value: 19.6, timestamp: new Date(Date.now() - 120000), status: 'normal', statusText: 'Fresca' }
      ]
    },
    door: {
      name: 'Sensor de Apertura',
      icon: '🚪',
      minValue: 0,
      maxValue: 180,
      unit: '°',
      status: 'online',
      statusText: 'Operativo',
      readings: [
        { id: 1, value: 0, timestamp: new Date(), status: 'normal', statusText: 'Cerrada' },
        { id: 2, value: 90, timestamp: new Date(Date.now() - 30000), status: 'warning', statusText: 'Abierta' },
        { id: 3, value: 0, timestamp: new Date(Date.now() - 60000), status: 'normal', statusText: 'Cerrada' },
        { id: 4, value: 45, timestamp: new Date(Date.now() - 90000), status: 'warning', statusText: 'Entreabierta' },
        { id: 5, value: 180, timestamp: new Date(Date.now() - 120000), status: 'critical', statusText: 'Completamente Abierta' }
      ]
    },
    weight: {
      name: 'Sensor de Peso',
      icon: '⚖️',
      minValue: 0,
      maxValue: 1000,
      unit: 'g',
      status: 'warning',
      statusText: 'Calibrando',
      readings: [
        { id: 1, value: 245.7, timestamp: new Date(), status: 'normal', statusText: 'Estable' },
        { id: 2, value: 892.3, timestamp: new Date(Date.now() - 30000), status: 'warning', statusText: 'Pesado' },
        { id: 3, value: 156.2, timestamp: new Date(Date.now() - 60000), status: 'normal', statusText: 'Ligero' },
        { id: 4, value: 999.9, timestamp: new Date(Date.now() - 90000), status: 'critical', statusText: 'Sobrepeso' },
        { id: 5, value: 78.5, timestamp: new Date(Date.now() - 120000), status: 'normal', statusText: 'Normal' }
      ]
    },
    rfid: {
      name: 'Sensor RFID',
      icon: '🏷️',
      minValue: 0,
      maxValue: 1,
      unit: 'tags',
      status: 'online',
      statusText: 'Escaneando',
      readings: [
        { id: 1, value: 1, timestamp: new Date(), status: 'normal', statusText: 'Tag Detectado' },
        { id: 2, value: 0, timestamp: new Date(Date.now() - 30000), status: 'normal', statusText: 'Sin Tag' },
        { id: 3, value: 1, timestamp: new Date(Date.now() - 60000), status: 'normal', statusText: 'Tag Válido' },
        { id: 4, value: 1, timestamp: new Date(Date.now() - 90000), status: 'warning', statusText: 'Tag Desconocido' },
        { id: 5, value: 0, timestamp: new Date(Date.now() - 120000), status: 'normal', statusText: 'Sin Detección' }
      ]
    }
  };

  selectSensor(sensorType: string): void {
    this.selectedSensor = sensorType;
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
    // Simular nueva lectura
    const sensorData = this.getSensorData();
    if (sensorData.readings) {
      const newReading: SensorReading = {
        id: Date.now(),
        value: Math.random() * (sensorData.maxValue - sensorData.minValue) + sensorData.minValue,
        timestamp: new Date(),
        status: Math.random() > 0.7 ? 'warning' : 'normal',
        statusText: Math.random() > 0.7 ? 'Alerta' : 'Normal'
      };
      
      // Agregar al inicio y mantener solo 10 lecturas
      sensorData.readings.unshift(newReading);
      if (sensorData.readings.length > 10) {
        sensorData.readings = sensorData.readings.slice(0, 10);
      }
    }
  }
}
