import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalDataComponent } from '../modal-data/modal-data.component';
import { IoTService, CreateFeedRequest, UpdateFeedRequest } from '../../../services/IoTService/io-t.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalDataComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css'
})
export class FeedComponent implements OnInit {
  sensores: string[] = [];
  // Keys reales correspondientes (mismo índice que sensores)
  sensorKeys: string[] = [];
  // Datos completos de sensores para usar en edición
  sensoresCompletos: any[] = [];
  sensoresActivos = 0;
  sensoresInactivos = 0;
  
  // Estado de cada sensor (true = activo, false = inactivo)
  estadoSensores: boolean[] = [];
  
  // Filtro actual: 'todos', 'activos', 'inactivos'
  filtroActual = 'activos';


  // Variables para el modal
  modalVisible = false;
  sensorSeleccionado = {
    id: '',
    nombre: ''
  };

  // Modal eliminar
  showDeleteModal = false;
  deleting = false;
  sensorAEliminar: { nombre: string, index: number, key: string } | null = null;
  copiedKeyIndex: number | null = null;

  // ===== Modal editar sensor =====
  showEditSensorModal = false;
  editingSensor = false;
  sensorAEditar: { index: number, key: string } | null = null;
  editarSensor = {
    key: '',
    nombre: '',
    activo: true,
    tipoDato: 'temperatura',
    minValue: null as number | null,
    maxValue: null as number | null
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

  // Determina si el tipo seleccionado es de naturaleza booleana (no requiere rangos)
  isTipoBooleano(tipo: string): boolean {
    return tipo === 'presencia';
  }

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

  ngOnInit(): void {
    this.cargarSensores();
  }

  private cargarSensores() {
    this.iot.AllFeeds().subscribe({
      next: resp => {
        const lista = Array.isArray(resp.data) ? resp.data : [];
        this.sensores = lista.map(s => s.name || s.key);
        this.sensorKeys = lista.map(s => s.key);
        this.sensoresCompletos = lista; // Guardar datos completos
        // Mapear estados (fallback). Si API devuelve 'status' boolean preferirlo; si state string usarlo.
        this.estadoSensores = lista.map(s => {
          const raw: any = s;
          // Preferir status boolean; fallback a state string
            if (typeof raw.status !== 'undefined') return !!raw.status;
            if (typeof raw.state === 'string') return raw.state.toLowerCase() === 'activo';
            return true; // default activo si falta
        });
        this.actualizarContadores();
      },
      error: err => {
        console.error('Error cargando sensores', err);
      }
    });
  }

  guardarNuevoSensor() {
    if (this.savingSensor) return;
    const { key, nombre, tipoDato, activo, minValue, maxValue } = this.nuevoSensor;
    if (!key.trim() || !nombre.trim()) return;
    if (this.sensores.map(s => s.toLowerCase()).includes(nombre.toLowerCase())) return;
    // Validación rango (si ambos definidos y el tipo NO es booleano)
    if (!this.isTipoBooleano(tipoDato) && minValue != null && maxValue != null && minValue > maxValue) return;
    this.savingSensor = true;

    // Forzar null en min/max si es booleano
    const payload: CreateFeedRequest = {
      key,
      nombre,
      tipoDato,
      activo,
      minValue: this.isTipoBooleano(tipoDato) ? null : minValue,
      maxValue: this.isTipoBooleano(tipoDato) ? null : maxValue
    };
    this.iot.CreateFeed(payload).subscribe({
      next: (resp) => {
        // Actualizar lista local (optimista)
        this.sensores.push(nombre);
        this.sensorKeys.push(key);
        this.sensoresCompletos.push(resp.data); // Añadir datos completos desde respuesta
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
    let base: string[];
    if (this.filtroActual === 'activos') {
      base = this.sensores.filter((_, index) => this.estadoSensores[index]);
    } else if (this.filtroActual === 'inactivos') {
      base = this.sensores.filter((_, index) => !this.estadoSensores[index]);
    } else {
      base = this.sensores;
    }
  return base;
  }

  // (cambiarFiltro original eliminado; se redefine más abajo con soporte de paginación)

  // Activa o desactiva un sensor
  toggleSensor(index: number): void {
    const sensoresPagina = this.getSensoresFiltrados();
    const sensorNombre = sensoresPagina[index];
    const indiceOriginal = this.sensores.indexOf(sensorNombre);
    
    if (indiceOriginal < 0) return; // Sensor no encontrado
    
    // Obtener datos del sensor para enviar solo el campo status actualizado
    const sensorCompleto = this.sensoresCompletos[indiceOriginal];
    const key = this.sensorKeys[indiceOriginal];
    const nuevoEstado = !this.estadoSensores[indiceOriginal];
    
    // Crear payload con todos los datos actuales, cambiando solo el estado
    const payload: UpdateFeedRequest = {
      key: key,
      nombre: sensorCompleto?.name || sensorNombre,
      tipoDato: sensorCompleto?.type_data || 'temperatura',
      activo: nuevoEstado, // Solo este campo cambia
      minValue: sensorCompleto?.min_value || null,
      maxValue: sensorCompleto?.max_value || null
    };
    
    // Actualizar inmediatamente en la UI (optimistic update)
    const estadoAnterior = this.estadoSensores[indiceOriginal];
    this.estadoSensores[indiceOriginal] = nuevoEstado;
    this.actualizarContadores();
    
    // Llamar al backend para persistir el cambio
    this.iot.UpdateFeed(key, payload).subscribe({
      next: (resp) => {
        // Actualizar datos completos con respuesta del servidor
        this.sensoresCompletos[indiceOriginal] = resp.data;
        
        // Cambiar automáticamente al filtro correspondiente al nuevo estado
        if (this.filtroActual !== 'todos') {
          if (estadoAnterior === false && nuevoEstado === true) {
            // Se activó un sensor inactivo -> cambiar a filtro "activos"
            this.filtroActual = 'activos';
          } else if (estadoAnterior === true && nuevoEstado === false) {
            // Se desactivó un sensor activo -> cambiar a filtro "inactivos"
            this.filtroActual = 'inactivos';
          }
        }
      },
      error: (err) => {
        console.error('Error actualizando estado del sensor', err);
        // Revertir el cambio en caso de error
        this.estadoSensores[indiceOriginal] = estadoAnterior;
        this.actualizarContadores();
      }
    });
  }

  // Actualiza los contadores basado en el estado actual
  private actualizarContadores(): void {
    this.sensoresActivos = this.estadoSensores.filter(estado => estado).length;
    this.sensoresInactivos = this.estadoSensores.filter(estado => !estado).length;
  }

  // Verifica si un sensor está activo
  isSensorActivo(index: number): boolean {
  const sensoresPagina = this.getSensoresFiltrados();
  const sensorNombre = sensoresPagina[index];
  const indiceOriginal = this.sensores.indexOf(sensorNombre);
  return indiceOriginal >= 0 ? this.estadoSensores[indiceOriginal] : false;
  }

  // Mapea la posición del sensor a la clase de tarjeta correspondiente
  // Eliminado getTarjetaClass y paginación: la grilla ahora muestra todos

  cambiarFiltro(filtro: string): void {
    if (this.filtroActual === filtro) {
      this.filtroActual = 'todos';
    } else {
      this.filtroActual = filtro;
    }
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

  // ====== Eliminar (solo UI por ahora) ======
  openDeleteModal(index: number) {
  const filtrados = this.getSensoresFiltrados();
  const nombre = filtrados[index];
  const originalIndex = this.sensores.indexOf(nombre);
  const key = originalIndex > -1 ? this.sensorKeys[originalIndex] : nombre; // fallback si algo falla
  this.sensorAEliminar = { nombre, index: originalIndex, key };
    this.showDeleteModal = true;
  }

  cancelDelete() {
    if (this.deleting) return;
    this.showDeleteModal = false;
    this.sensorAEliminar = null;
  }

  confirmDelete() {
    if (!this.sensorAEliminar) return;
    const idx = this.sensorAEliminar.index;
    if (idx < 0 || idx >= this.sensores.length) return;
    const key = this.sensorAEliminar.key || this.sensorKeys[idx] || this.sensores[idx];
    this.deleting = true;
    this.iot.DeleteFeed(key).subscribe({
      next: resp => {
        // Éxito: remover local
        this.sensores.splice(idx, 1);
        this.sensorKeys.splice(idx, 1);
        this.sensoresCompletos.splice(idx, 1); // También remover de datos completos
        this.estadoSensores.splice(idx, 1);
        this.actualizarContadores();
        this.deleting = false;
        this.showDeleteModal = false;
        this.sensorAEliminar = null;
      },
      error: err => {
        console.error('Error eliminando sensor', err);
        this.deleting = false;
      }
    });
  }

  // Obtener key real dado índice en lista filtrada
  getSensorKey(indexFiltrado: number): string {
    const filtrados = this.getSensoresFiltrados();
    const nombre = filtrados[indexFiltrado];
    const originalIndex = this.sensores.indexOf(nombre);
    if (originalIndex > -1) return this.sensorKeys[originalIndex];
    return nombre; // fallback
  }

  copyKey(indexFiltrado: number) {
    const key = this.getSensorKey(indexFiltrado);
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(key).then(() => {
        this.copiedKeyIndex = indexFiltrado;
        setTimeout(() => {
          if (this.copiedKeyIndex === indexFiltrado) this.copiedKeyIndex = null;
        }, 1800);
      }).catch(() => {
        // fallback silencioso
      });
    }
  }

  // ====== Editar sensor ======
  openEditModal(index: number) {
    const filtrados = this.getSensoresFiltrados();
    const nombre = filtrados[index];
    const originalIndex = this.sensores.indexOf(nombre);
    const key = originalIndex > -1 ? this.sensorKeys[originalIndex] : nombre;
    
    this.sensorAEditar = { index: originalIndex, key };
    
    // Obtener datos completos del sensor actual
    const sensorCompleto = originalIndex > -1 ? this.sensoresCompletos[originalIndex] : null;
    
    // Pre-llenar formulario con datos reales actuales
    this.editarSensor = {
      key: key,
      nombre: nombre,
      activo: originalIndex > -1 ? this.estadoSensores[originalIndex] : true,
      tipoDato: sensorCompleto?.type_data || 'temperatura',
      minValue: sensorCompleto?.min_value || null,
      maxValue: sensorCompleto?.max_value || null
    };
    
    this.showEditSensorModal = true;
  }

  closeEditSensorModal() {
    if (this.editingSensor) return;
    this.showEditSensorModal = false;
    this.sensorAEditar = null;
  }

  private resetEditarSensor() {
    this.editarSensor = {
      key: '',
      nombre: '',
      activo: true,
      tipoDato: 'temperatura',
      minValue: null,
      maxValue: null
    };
  }

  guardarEdicionSensor() {
    if (this.editingSensor) return;
    const { key, nombre, tipoDato, activo, minValue, maxValue } = this.editarSensor;
    if (!key.trim() || !nombre.trim()) return;
    
    // Validación rango (si ambos definidos y el tipo NO es booleano)
    if (!this.isTipoBooleano(tipoDato) && minValue != null && maxValue != null && minValue > maxValue) return;
    
    this.editingSensor = true;
    
    // Preparar payload para el servicio
    const payload: UpdateFeedRequest = {
      key,
      nombre,
      tipoDato,
      activo,
      minValue: this.isTipoBooleano(tipoDato) ? null : minValue,
      maxValue: this.isTipoBooleano(tipoDato) ? null : maxValue
    };
    
    this.iot.UpdateFeed(key, payload).subscribe({
      next: (resp) => {
        // Actualizar datos locales con la respuesta del servidor
        if (this.sensorAEditar) {
          const idx = this.sensorAEditar.index;
          if (idx >= 0 && idx < this.sensores.length) {
            this.sensores[idx] = nombre;
            this.estadoSensores[idx] = activo;
            this.sensoresCompletos[idx] = resp.data; // Actualizar datos completos con respuesta
            this.actualizarContadores();
          }
        }
        
        this.editingSensor = false;
        this.showEditSensorModal = false;
        this.sensorAEditar = null;
      },
      error: (err) => {
        console.error('Error actualizando sensor', err);
        this.editingSensor = false;
      }
    });
  }
}
