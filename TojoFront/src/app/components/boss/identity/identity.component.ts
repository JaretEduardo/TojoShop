import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';

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

  constructor(private alertService: AlertService) {}

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
    // Validar nombre
    if (!this.empleadoForm.nombre.trim()) {
      this.alertService.showWarning(
        'Por favor ingresa el nombre completo del empleado',
        'Campo requerido'
      );
      return;
    }

    // Validar correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.empleadoForm.correo.trim()) {
      this.alertService.showWarning(
        'Por favor ingresa el correo electrónico del empleado',
        'Campo requerido'
      );
      return;
    }

    if (!emailRegex.test(this.empleadoForm.correo)) {
      this.alertService.showError(
        'Por favor ingresa un correo electrónico válido',
        'Email inválido'
      );
      return;
    }

    // Validar contraseña
    if (!this.empleadoForm.password.trim()) {
      this.alertService.showWarning(
        'Por favor asigna una contraseña al empleado',
        'Campo requerido'
      );
      return;
    }

    if (this.empleadoForm.password.length < 6) {
      this.alertService.showWarning(
        'La contraseña debe tener al menos 6 caracteres',
        'Contraseña muy corta'
      );
      return;
    }

    // Validar tipo de empleado
    if (!this.empleadoForm.tipoEmpleado) {
      this.alertService.showWarning(
        'Por favor selecciona el tipo de empleado',
        'Campo requerido'
      );
      return;
    }

    // Validar sucursal
    if (!this.empleadoForm.sucursal) {
      this.alertService.showWarning(
        'Por favor selecciona la sucursal donde trabajará el empleado',
        'Campo requerido'
      );
      return;
    }

    // Validar RFID seleccionado
    if (!this.rfidSeleccionado) {
      this.alertService.showError(
        'Por favor selecciona un RFID para asignar al empleado',
        'RFID requerido'
      );
      return;
    }

    // Simular registro del empleado
    console.log('Registrando empleado:', {
      ...this.empleadoForm,
      rfidAsignado: this.rfidSeleccionado
    });

    // Guardar datos para el mensaje antes de limpiar
    const nombreEmpleado = this.empleadoForm.nombre;
    const rfidAsignado = this.rfidSeleccionado;

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

    // Mostrar confirmación de éxito
    this.alertService.showSuccess(
      `El empleado ${nombreEmpleado} ha sido registrado exitosamente con el RFID ${rfidAsignado}`,
      'Empleado registrado'
    );
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

  // Métodos auxiliares para demostrar diferentes alertas
  mostrarInfoRFID(): void {
    this.alertService.showInfo(
      'Los RFIDs son tarjetas de identificación únicas que permiten el acceso seguro a las instalaciones. Cada empleado debe tener uno asignado.',
      'Información sobre RFID'
    );
  }

  confirmarEliminacionRFID(rfidId: string): void {
    this.alertService.showWarning(
      `¿Estás seguro de que deseas eliminar el escaneo RFID ${rfidId}? Esta acción no se puede deshacer.`,
      'Confirmar eliminación'
    );
  }

  mostrarEstadisticasRFID(): void {
    const totalRFIDs = this.escaneosRFID.length;
    const asignados = this.escaneosRFID.filter(r => r.asignado).length;
    const disponibles = totalRFIDs - asignados;

    this.alertService.showInfo(
      `Total de RFIDs: ${totalRFIDs} | Asignados: ${asignados} | Disponibles: ${disponibles}`,
      'Estadísticas RFID'
    );
  }
}
