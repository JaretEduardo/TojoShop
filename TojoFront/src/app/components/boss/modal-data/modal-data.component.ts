import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IoTService, UpdateDataPointRequest, ApiDeleteDataPointResponse } from '../../../services/IoTService/io-t.service';

export interface SensorDataItem {
  id: number;
  value: number | string;
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
export class ModalDataComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() sensorId: string = '';
  @Input() sensorName: string = '';
  @Input() sensorData: SensorDataItem[] = [];
  @Output() closeModal = new EventEmitter<void>();
  @Output() dataUpdated = new EventEmitter<SensorDataItem[]>();
  @Output() refreshData = new EventEmitter<void>();

  // Control de vista
  viewMode: 'list' | 'chart' = 'list';
  
  // Variables para edición
  editingItem: SensorDataItem | null = null;
  editValue: number | string = 0;
  editDate: string = '';

  // Variables para eliminación
  showDeleteModal: boolean = false;
  itemToDelete: SensorDataItem | null = null;
  deleting: boolean = false;

  // Información del sensor para gráficas
  sensorInfo: any = null;

  constructor(private iot: IoTService) {}

  ngOnInit() {
    // Solo generar datos simulados si no se proporcionan datos reales
    if (this.sensorData.length === 0) {
      this.generateMockData();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Cuando el modal se abre, cargar información del sensor
    if (changes['isVisible'] && changes['isVisible'].currentValue && this.sensorId) {
      this.viewMode = 'list'; // Resetear a vista de lista al abrir el modal
      this.sensorInfo = null; // Limpiar información del sensor anterior
      this.loadSensorInfo();
    }
    
    // Si cambia el sensorId, también resetear
    if (changes['sensorId'] && this.sensorId) {
      this.viewMode = 'list';
      this.sensorInfo = null;
      if (this.isVisible) {
        this.loadSensorInfo();
      }
    }
  }

  // Cargar información básica del sensor
  private loadSensorInfo() {
    this.iot.ChartFeedData(this.sensorId).subscribe({
      next: (response) => {
        if (response.statusCode === 200 && response.sensor) {
          this.sensorInfo = response.sensor;
        }
      },
      error: (error) => {
        console.error('Error al obtener información del sensor:', error);
      }
    });
  }

  // Generar datos simulados para el sensor (solo si no hay datos reales)
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

  // Solicitar actualización de datos reales del sensor
  refreshSensorData() {
    this.refreshData.emit();
  }

  // Cerrar modal
  onCloseModal() {
    this.closeModal.emit();
    this.editingItem = null;
  }

  // Alternar vista entre lista y gráfica
  toggleViewMode() {
    if (this.viewMode === 'list') {
      // Verificar si el sensor tiene valores mínimos y máximos antes de cambiar a gráfica
      if (this.sensorInfo && this.sensorInfo.min_value !== null && this.sensorInfo.max_value !== null) {
        this.viewMode = 'chart';
        this.loadChartData();
      } else {
        alert('Este sensor no tiene valores mínimos y máximos configurados. No se puede mostrar la gráfica.');
      }
    } else {
      this.viewMode = 'list';
    }
  }

  // Cargar datos históricos para gráfica
  private loadChartData() {
    this.iot.ChartFeedData(this.sensorId).subscribe({
      next: (response) => {
        if (response.statusCode === 200 && response.data) {
          // Almacenar información del sensor
          this.sensorInfo = response.sensor;
          
          // Transformar datos del backend al formato esperado
          this.sensorData = response.data.map((item: any) => ({
            id: item.id,
            value: parseFloat(item.value) || 0,
            timestamp: new Date(item.received_at),
            status: this.determineStatus(parseFloat(item.value) || 0),
            sensorType: 'sensor'
          }));
        } else {
          console.warn('Respuesta inesperada del servidor:', response);
        }
      },
      error: (error) => {
        console.error('Error al obtener datos históricos:', error);
      }
    });
  }

  // Determinar estado basado en el valor y los límites del sensor
  private determineStatus(value: number | string): 'normal' | 'warning' | 'critical' {
    // Para sensores no numéricos (como RFID), siempre retornar normal
    if (typeof value === 'string' || !this.sensorInfo || this.sensorInfo.min_value === null || this.sensorInfo.max_value === null) {
      return 'normal';
    }

    const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
    if (isNaN(numericValue)) {
      return 'normal';
    }

    const minValue = parseFloat(this.sensorInfo.min_value);
    const maxValue = parseFloat(this.sensorInfo.max_value);
    const range = maxValue - minValue;
    const warningThreshold = range * 0.1; // 10% del rango como margen de advertencia

    if (numericValue < minValue + warningThreshold || numericValue > maxValue - warningThreshold) {
      return 'warning';
    } else if (numericValue < minValue || numericValue > maxValue) {
      return 'critical';
    }
    return 'normal';
  }

  // Mostrar modal de confirmación de eliminación
  deleteItem(item: SensorDataItem) {
    this.itemToDelete = item;
    this.showDeleteModal = true;
  }

  // Confirmar eliminación
  confirmDelete() {
    if (!this.itemToDelete) return;

    this.deleting = true;
    this.iot.DeleteDataPoint(this.itemToDelete.id).subscribe({
      next: (response: ApiDeleteDataPointResponse) => {
        if (response.statusCode === 200) {
          // Eliminar del array local
          const index = this.sensorData.findIndex(d => d.id === this.itemToDelete!.id);
          if (index !== -1) {
            this.sensorData.splice(index, 1);
            this.dataUpdated.emit(this.sensorData);
          }
          this.cancelDelete();
        }
      },
      error: (error) => {
        console.error('Error al eliminar punto de datos:', error);
        alert('Error al eliminar el punto de datos. Inténtalo de nuevo.');
        this.deleting = false;
      }
    });
  }

  // Cancelar eliminación
  cancelDelete() {
    this.showDeleteModal = false;
    this.itemToDelete = null;
    this.deleting = false;
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
    this.editValue = '';
    this.editDate = '';
  }

  // Guardar edición
  saveEdit() {
    if (this.editingItem) {
      const updatePayload: UpdateDataPointRequest = {
        value: this.editValue.toString(),
        received_at: new Date(this.editDate).toISOString()
      };

      this.iot.UpdateDataPoint(this.editingItem.id, updatePayload).subscribe({
        next: (response) => {
          if (response.statusCode === 200) {
            // Actualizar el item local con los nuevos valores
            this.editingItem!.value = this.editValue;
            this.editingItem!.timestamp = new Date(this.editDate);
            
            // Recalcular estado basado en el nuevo valor
            this.editingItem!.status = this.determineStatus(this.editValue);
            
            this.dataUpdated.emit(this.sensorData);
            this.cancelEdit();
            
            // Opcional: mostrar mensaje de éxito
            console.log('Dato actualizado correctamente');
          } else {
            console.error('Error al actualizar el dato:', response.message);
          }
        },
        error: (error) => {
          console.error('Error en la solicitud de actualización:', error);
          // Opcional: mostrar mensaje de error al usuario
        }
      });
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

  // Datos para la gráfica (coordenadas basadas en min/max del sensor)
  getChartData() {
    if (!this.sensorInfo || this.sensorInfo.min_value === null || this.sensorInfo.max_value === null) {
      return [];
    }

    const minValue = parseFloat(this.sensorInfo.min_value);
    const maxValue = parseFloat(this.sensorInfo.max_value);
    const range = maxValue - minValue;
    const chartHeight = 180; // Altura disponible para la gráfica

    return this.sensorData
      .slice(0, 10) // Últimos 10 datos
      .reverse() // Orden cronológico
      .map((item, index) => {
        // Normalizar el valor al rango del sensor (0-1)
        const numericItemValue = typeof item.value === 'number' ? item.value : parseFloat(String(item.value));
        const normalizedValue = range > 0 ? (numericItemValue - minValue) / range : 0;
        // Convertir a coordenada Y (invertida, 0 en la parte superior)
        const y = chartHeight - (normalizedValue * chartHeight) + 10;
        
        return {
          x: index * 50 + 50, // Posición X
          y: Math.max(10, Math.min(y, chartHeight + 10)), // Limitar Y entre 10 y chartHeight+10
          value: item.value,
          timestamp: item.timestamp
        };
      });
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
    const numericValues = this.sensorData
      .map(item => typeof item.value === 'number' ? item.value : parseFloat(item.value.toString()))
      .filter(value => !isNaN(value));
    
    if (numericValues.length === 0) return 0;
    const sum = numericValues.reduce((acc, value) => acc + value, 0);
    return Math.round((sum / numericValues.length) * 10) / 10;
  }

  getMaxValue(): number {
    const numericValues = this.sensorData
      .map(item => typeof item.value === 'number' ? item.value : parseFloat(item.value.toString()))
      .filter(value => !isNaN(value));
    
    if (numericValues.length === 0) return 0;
    return Math.round(Math.max(...numericValues) * 10) / 10;
  }

  getMinValue(): number {
    const numericValues = this.sensorData
      .map(item => typeof item.value === 'number' ? item.value : parseFloat(item.value.toString()))
      .filter(value => !isNaN(value));
    
    if (numericValues.length === 0) return 0;
    return Math.round(Math.min(...numericValues) * 10) / 10;
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

  // Obtener unidad del sensor
  getSensorUnit(): string {
    if (!this.sensorInfo || !this.sensorInfo.type_data) {
      return '';
    }
    
    switch (this.sensorInfo.type_data.toLowerCase()) {
      case 'temperatura':
      case 'temperature':
        return '°C';
      case 'humedad':
      case 'humidity':
        return '%';
      case 'presión':
      case 'pressure':
        return 'hPa';
      case 'gas':
        return 'ppm';
      default:
        return '';
    }
  }

  // Etiquetas de la gráfica basadas en min/max del sensor
  getChartMaxLabel(): string {
    if (!this.sensorInfo || this.sensorInfo.max_value === null) {
      return '100';
    }
    return this.sensorInfo.max_value.toString();
  }

  getChartMidLabel(): string {
    if (!this.sensorInfo || this.sensorInfo.min_value === null || this.sensorInfo.max_value === null) {
      return '50';
    }
    const minValue = parseFloat(this.sensorInfo.min_value);
    const maxValue = parseFloat(this.sensorInfo.max_value);
    const midValue = (minValue + maxValue) / 2;
    return midValue.toFixed(1);
  }

  getChartMinLabel(): string {
    if (!this.sensorInfo || this.sensorInfo.min_value === null) {
      return '0';
    }
    return this.sensorInfo.min_value.toString();
  }

  vincularRFID() {
  }
}
