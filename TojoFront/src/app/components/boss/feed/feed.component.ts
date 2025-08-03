import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule],
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
}
