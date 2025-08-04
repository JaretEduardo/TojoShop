import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface EscaneoRFID {
  id: string;
  fecha: Date;
  asignado: boolean;
}

interface EmpleadoForm {
  nombre: string;
  correo: string;
  password: string;
  tipoEmpleado: string;
  sucursal: string;
}

@Component({
  selector: 'app-identity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './identity.component.html',
  styleUrl: './identity.component.css'
})
export class IdentityComponent {
  // Lista de escaneos RFID no asignados
  escaneosRFID: EscaneoRFID[] = [
    { id: 'RFID001', fecha: new Date('2025-08-04T08:30:00'), asignado: false },
    { id: 'RFID002', fecha: new Date('2025-08-04T09:15:00'), asignado: false },
    { id: 'RFID003', fecha: new Date('2025-08-04T10:45:00'), asignado: false },
    { id: 'RFID004', fecha: new Date('2025-08-04T11:20:00'), asignado: false },
    { id: 'RFID005', fecha: new Date('2025-08-04T14:30:00'), asignado: false },
    { id: 'RFID006', fecha: new Date('2025-08-04T15:45:00'), asignado: false }
  ];

  // Formulario de empleado
  empleadoForm: EmpleadoForm = {
    nombre: '',
    correo: '',
    password: '',
    tipoEmpleado: '',
    sucursal: ''
  };

  // Opciones para los selectores
  tiposEmpleado = [
    { value: 'empleado', label: 'Empleado' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'gerente', label: 'Gerente' }
  ];

  sucursales = [
    { value: 'sucursal1', label: 'Sucursal Centro' },
    { value: 'sucursal2', label: 'Sucursal Norte' },
    { value: 'sucursal3', label: 'Sucursal Sur' },
    { value: 'sucursal4', label: 'Sucursal Oriente' }
  ];

  // RFID seleccionado para asignar
  rfidSeleccionado: string = '';

  // Obtener escaneos no asignados
  getEscaneosNoAsignados(): EscaneoRFID[] {
    return this.escaneosRFID.filter(escaneo => !escaneo.asignado);
  }

  // Seleccionar un escaneo RFID
  seleccionarRFID(id: string): void {
    this.rfidSeleccionado = id;
  }

  // Validar formulario
  validarFormulario(): boolean {
    return this.empleadoForm.nombre.trim() !== '' &&
           this.empleadoForm.correo.trim() !== '' &&
           this.empleadoForm.password.trim() !== '' &&
           this.empleadoForm.tipoEmpleado !== '' &&
           this.empleadoForm.sucursal !== '' &&
           this.rfidSeleccionado !== '';
  }

  // Dar de alta al empleado
  darDeAltaEmpleado(): void {
    if (!this.validarFormulario()) {
      alert('Por favor, complete todos los campos y seleccione un RFID');
      return;
    }

    // Simular registro del empleado
    console.log('Registrando empleado:', {
      ...this.empleadoForm,
      rfidAsignado: this.rfidSeleccionado
    });

    // Marcar el RFID como asignado
    const escaneo = this.escaneosRFID.find(e => e.id === this.rfidSeleccionado);
    if (escaneo) {
      escaneo.asignado = true;
    }

    // Limpiar formulario
    this.empleadoForm = {
      nombre: '',
      correo: '',
      password: '',
      tipoEmpleado: '',
      sucursal: ''
    };
    this.rfidSeleccionado = '';

    alert('Empleado registrado exitosamente');
  }

  // Formatear fecha para mostrar
  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
