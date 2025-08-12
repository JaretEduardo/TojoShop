import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalDataComponent } from '../modal-data/modal-data.component';
import { IoTService, CreateFeedRequest } from '../../../services/IoTService/io-t.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalDataComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css'
})
export class FeedComponent {
  sensores = ['RFID', 'Temperatura', 'Peso', 'Presencia', 'Apertura', 'Gas'];
  sensoresActivos = 4; // Valor fijo para evitar el error
  sensoresInactivos = 2; // Valor fijo para evitar el error
  
  // Estado de cada sensor (true = activo, false = inactivo)
  estadoSensores = [true, true, false, true, false, true]; // 4 activos, 2 inactivos
  
  // Filtro actual: 'todos', 'activos', 'inactivos'
  filtroActual = 'activos';

  // Variables para el modal
  modalVisible = false;
  sensorSeleccionado = {
    id: '',
    nombre: ''
  };

  // ===== Modal agregar nuevo sensor =====
  showAddSensorModal = false;
  savingSensor = false;
  nuevoSensor = {
    key: '',
    nombre: '',
    activo: true,
  tipoDato: 'temperatura',
  minValue: null as number | null,
  maxValue: null as number | null
  };
  tiposDato = [
    { value: 'temperatura', label: 'Temperatura (°C)' },
    { value: 'distancia', label: 'Distancia (cm)' },
    { value: 'humedad', label: 'Humedad (%)' },
    { value: 'peso', label: 'Peso (g)' },
    { value: 'gas', label: 'Gas (ppm)' },
    { value: 'presencia', label: 'Presencia (bool)' }
  ];

  openAddSensorModal() {
    this.resetNuevoSensor();
    this.showAddSensorModal = true;
  }

  closeAddSensorModal() {
    if (this.savingSensor) return;
    this.showAddSensorModal = false;
  }

  private resetNuevoSensor() {
    this.nuevoSensor = {
      key: '',
      nombre: '',
      activo: true,
  tipoDato: 'temperatura',
  minValue: null,
  maxValue: null
    };
  }

  constructor(private iot: IoTService) {}

  guardarNuevoSensor() {
    if (this.savingSensor) return;
    const { key, nombre, tipoDato, activo, minValue, maxValue } = this.nuevoSensor;
    if (!key.trim() || !nombre.trim()) return;
    if (this.sensores.map(s => s.toLowerCase()).includes(nombre.toLowerCase())) return;
    // Validación rango (si ambos definidos)
    if (minValue != null && maxValue != null && minValue > maxValue) return;
    this.savingSensor = true;

    const payload: CreateFeedRequest = { key, nombre, tipoDato, activo, minValue, maxValue };
    this.iot.CreateFeed(payload).subscribe({
      next: (resp) => {
        // Actualizar lista local (optimista)
        this.sensores.push(nombre);
        this.estadoSensores.push(activo);
        this.actualizarContadores();
        this.savingSensor = false;
        this.showAddSensorModal = false;
      },
      error: (err) => {
        console.error('Error creando sensor', err);
        this.savingSensor = false;
      }
    });
  }

  getSensoresActivos(): number {
    return this.sensoresActivos;
  }

  getSensoresInactivos(): number {
    return this.sensoresInactivos;
  }

  // Obtiene los sensores filtrados según el filtro actual
  getSensoresFiltrados(): string[] {
    if (this.filtroActual === 'activos') {
      return this.sensores.filter((_, index) => this.estadoSensores[index]);
    } else if (this.filtroActual === 'inactivos') {
      return this.sensores.filter((_, index) => !this.estadoSensores[index]);
    }
    return this.sensores; // 'todos'
  }

  // Cambia el filtro
  cambiarFiltro(filtro: string): void {
    // Si el filtro seleccionado ya está activo, cambiar a 'todos'
    if (this.filtroActual === filtro) {
      this.filtroActual = 'todos';
    } else {
      this.filtroActual = filtro;
    }
  }

  // Activa o desactiva un sensor
  toggleSensor(index: number): void {
    // Obtener el índice original del sensor en el array completo
    const sensoresFiltrados = this.getSensoresFiltrados();
    const sensorNombre = sensoresFiltrados[index];
    const indiceOriginal = this.sensores.indexOf(sensorNombre);
    
    // Obtener el estado actual antes del cambio
    const estadoAnterior = this.estadoSensores[indiceOriginal];
    
    // Cambiar el estado del sensor
    this.estadoSensores[indiceOriginal] = !this.estadoSensores[indiceOriginal];
    
    // Actualizar los contadores
    this.actualizarContadores();
    
    // Cambiar automáticamente al filtro correspondiente al nuevo estado
    if (this.filtroActual !== 'todos') {
      if (estadoAnterior === false && this.estadoSensores[indiceOriginal] === true) {
        // Se activó un sensor inactivo -> cambiar a filtro "activos"
        this.filtroActual = 'activos';
      } else if (estadoAnterior === true && this.estadoSensores[indiceOriginal] === false) {
        // Se desactivó un sensor activo -> cambiar a filtro "inactivos"
        this.filtroActual = 'inactivos';
      }
    }
  }

  // Actualiza los contadores basado en el estado actual
  private actualizarContadores(): void {
    this.sensoresActivos = this.estadoSensores.filter(estado => estado).length;
    this.sensoresInactivos = this.estadoSensores.filter(estado => !estado).length;
  }

  // Verifica si un sensor está activo
  isSensorActivo(index: number): boolean {
    // Necesitamos mapear el índice del array filtrado al índice original
    const sensoresFiltrados = this.getSensoresFiltrados();
    const sensorNombre = sensoresFiltrados[index];
    const indiceOriginal = this.sensores.indexOf(sensorNombre);
    return this.estadoSensores[indiceOriginal];
  }

  // Mapea la posición del sensor a la clase de tarjeta correspondiente (div4-div9)
  getTarjetaClass(index: number): string {
    const clases = ['div4', 'div5', 'div6', 'div7', 'div8', 'div9'];
    return clases[index] || '';
  }

  // Abrir modal con datos del sensor
  verDatosSensor(index: number): void {
    const sensoresFiltrados = this.getSensoresFiltrados();
    const sensorNombre = sensoresFiltrados[index];
    
    this.sensorSeleccionado = {
      id: sensorNombre.toLowerCase(),
      nombre: sensorNombre
    };
    
    this.modalVisible = true;
  }

  // Cerrar modal
  cerrarModal(): void {
    this.modalVisible = false;
    this.sensorSeleccionado = {
      id: '',
      nombre: ''
    };
  }

  // Manejar actualización de datos del sensor
  onDatosActualizados(data: any): void {
    console.log('Datos del sensor actualizados:', data);
    // Aquí puedes implementar la lógica para actualizar los datos en el backend
  }
}
