import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SensorDataItem {
  id: number;
  value: number;
  timestamp: Date;
  status: 'normal' | 'warning' | 'critical';
  sensorType: string;
}

@Component({
  selector: 'app-modal-data',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-data.component.html',
  styleUrl: './modal-data.component.css'
})
export class ModalDataComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Input() sensorId: string = '';
  @Input() sensorName: string = '';
  @Input() sensorData: SensorDataItem[] = [];
  @Output() closeModal = new EventEmitter<void>();
  @Output() dataUpdated = new EventEmitter<SensorDataItem[]>();

  // Control de vista
  viewMode: 'list' | 'chart' = 'list';
  
  // Variables para edición
  editingItem: SensorDataItem | null = null;
  editValue: number = 0;
  editDate: string = '';

  ngOnInit() {
    // Simular datos si no se proporcionan
    if (this.sensorData.length === 0) {
      this.generateMockData();
    }
  }

  // Generar datos simulados para el sensor
  generateMockData() {
    const baseValue = 50;
    const mockData: SensorDataItem[] = [];
    
    for (let i = 0; i < 20; i++) {
      const timestamp = new Date();
      timestamp.setMinutes(timestamp.getMinutes() - (i * 5));
      
      const variation = (Math.random() - 0.5) * 20;
      const value = baseValue + variation;
      
      let status: 'normal' | 'warning' | 'critical' = 'normal';
      if (value > 70) status = 'warning';
      if (value > 85 || value < 15) status = 'critical';

      mockData.push({
        id: Date.now() - i,
        value: Math.round(value * 100) / 100,
        timestamp: timestamp,
        status: status,
        sensorType: this.sensorId
      });
    }
    
    this.sensorData = mockData;
  }

  // Cerrar modal
  onCloseModal() {
    this.closeModal.emit();
    this.editingItem = null;
  }

  // Alternar vista entre lista y gráfica
  toggleViewMode() {
    this.viewMode = this.viewMode === 'list' ? 'chart' : 'list';
  }

  // Eliminar elemento
  deleteItem(item: SensorDataItem) {
    const index = this.sensorData.findIndex(d => d.id === item.id);
    if (index !== -1) {
      this.sensorData.splice(index, 1);
      this.dataUpdated.emit(this.sensorData);
    }
  }

  // Iniciar edición
  startEdit(item: SensorDataItem) {
    this.editingItem = item;
    this.editValue = item.value;
    this.editDate = this.formatDateForInput(item.timestamp);
  }

  // Cancelar edición
  cancelEdit() {
    this.editingItem = null;
    this.editValue = 0;
    this.editDate = '';
  }

  // Guardar edición
  saveEdit() {
    if (this.editingItem) {
      this.editingItem.value = this.editValue;
      this.editingItem.timestamp = new Date(this.editDate);
      
      // Recalcular estado basado en el nuevo valor
      if (this.editValue > 70) {
        this.editingItem.status = 'warning';
      } else if (this.editValue > 85 || this.editValue < 15) {
        this.editingItem.status = 'critical';
      } else {
        this.editingItem.status = 'normal';
      }
      
      this.dataUpdated.emit(this.sensorData);
      this.editingItem = null;
    }
  }

  // Formatear fecha para input datetime-local
  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Obtener ícono de estado
  getStatusIcon(status: string): string {
    switch (status) {
      case 'normal': return '🟢';
      case 'warning': return '🟡';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  }

  // Obtener texto de estado
  getStatusText(status: string): string {
    switch (status) {
      case 'normal': return 'Normal';
      case 'warning': return 'Advertencia';
      case 'critical': return 'Crítico';
      default: return 'Desconocido';
    }
  }

  // Datos para la gráfica (coordenadas simples)
  getChartData() {
    return this.sensorData
      .slice(0, 10) // Últimos 10 datos
      .reverse() // Orden cronológico
      .map((item, index) => ({
        x: index * 50 + 50, // Posición X
        y: 200 - (item.value * 2), // Posición Y (invertida)
        value: item.value,
        timestamp: item.timestamp
      }));
  }

  // Crear path SVG para la línea de la gráfica
  getChartPath(): string {
    const points = this.getChartData();
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  }

  // Función trackBy para optimizar ngFor
  trackByItemId(index: number, item: SensorDataItem): number {
    return item.id;
  }

  // Funciones para estadísticas (para usar en template)
  getAverageValue(): number {
    if (this.sensorData.length === 0) return 0;
    const sum = this.sensorData.reduce((acc, item) => acc + item.value, 0);
    return Math.round((sum / this.sensorData.length) * 10) / 10;
  }

  getMaxValue(): number {
    if (this.sensorData.length === 0) return 0;
    return Math.round(Math.max(...this.sensorData.map(item => item.value)) * 10) / 10;
  }

  getMinValue(): number {
    if (this.sensorData.length === 0) return 0;
    return Math.round(Math.min(...this.sensorData.map(item => item.value)) * 10) / 10;
  }

  // Obtener ícono específico según el tipo de sensor
  getSensorIcon(): string {
    switch (this.sensorId.toLowerCase()) {
      case 'rfid': return '📡';
      case 'temperatura': return '🌡️';
      case 'peso': return '⚖️';
      case 'presencia': return '👁️';
      case 'apertura': return '🚪';
      case 'gas': return '💨';
      default: return '📊';
    }
  }
}
