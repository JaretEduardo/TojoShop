import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';
import { IoTService, SensorDataReading } from '../../../services/IoTService/io-t.service';
import { AuthService } from '../../../services/auth/auth.service';

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
}

@Component({
  selector: 'app-identity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './identity.component.html',
  styleUrl: './identity.component.css'
})
export class IdentityComponent implements OnInit {
  // Lista de escaneos RFID no asignados
  escaneosRFID: EscaneoRFID[] = [];
  
  // Loading state
  loadingRFID: boolean = false;

  // Formulario de empleado
  empleadoForm: EmpleadoForm = {
    nombre: '',
    correo: '',
    password: '',
    tipoEmpleado: ''
  };

  // Opciones para los selectores
  tiposEmpleado = [
    { value: 'empleado', label: 'Empleado' },
    { value: 'encargado', label: 'Encargado' }
  ];



  // RFID seleccionado para asignar
  rfidSeleccionado: string = '';

  constructor(
    private alertService: AlertService,
    private iotService: IoTService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatosRFID();
  }

  // Cargar datos RFID no vinculados desde el backend
  cargarDatosRFID(): void {
    this.loadingRFID = true;
    this.iotService.GetFeedData('rfid-uid').subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.escaneosRFID = response.data.map((rfidData: SensorDataReading) => ({
            id: rfidData.value,
            fecha: new Date(rfidData.received_at),
            asignado: false
          }));
        }
        this.loadingRFID = false;
      },
      error: (error) => {
        console.error('Error al cargar datos RFID:', error);
        this.alertService.showError('Error al cargar los datos RFID', 'Error');
        this.loadingRFID = false;
      }
    });
  }

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

    if (this.empleadoForm.password.length < 8) {
      this.alertService.showWarning(
        'La contraseña debe tener al menos 8 caracteres',
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

    // Validar RFID seleccionado
    if (!this.rfidSeleccionado) {
      this.alertService.showError(
        'Por favor selecciona un RFID para asignar al empleado',
        'RFID requerido'
      );
      return;
    }

    // Guardar datos para el mensaje antes de procesar
    const nombreEmpleado = this.empleadoForm.nombre;
    const rfidAsignado = this.rfidSeleccionado;

    // Preparar payload para registro de usuario
    const registerPayload = {
      name: this.empleadoForm.nombre.trim(),
      email: this.empleadoForm.correo.trim(),
      password: this.empleadoForm.password,
      password_confirmation: this.empleadoForm.password,
      role: this.empleadoForm.tipoEmpleado as 'empleado' | 'encargado'
    };

    // Registrar usuario primero
    this.authService.Register(registerPayload).subscribe({
      next: (response: any) => {
        // Una vez registrado el usuario, vincular el RFID
        const userId = response.user?.id || response.data?.id;
        if (userId) {
          this.vincularRFIDConUsuario(userId, rfidAsignado, nombreEmpleado);
        } else {
          this.alertService.showError(
            'Error al obtener el ID del usuario registrado',
            'Error de registro'
          );
        }
      },
      error: (error) => {
        console.error('Error al registrar usuario:', error);
        this.alertService.showError(
          'Error al registrar el empleado. Verifique los datos e intente nuevamente.',
          'Error de registro'
        );
      }
    });
  }

  // Método auxiliar para vincular RFID con usuario
  private vincularRFIDConUsuario(userId: number, rfidValue: string, nombreEmpleado: string): void {
    const vincularPayload = {
      user_id: userId,
      rfid_value: rfidValue
    };

    this.iotService.VincularRFID(vincularPayload).subscribe({
      next: (response) => {
        // Marcar el RFID como asignado
        const escaneo = this.escaneosRFID.find(e => e.id === rfidValue);
        if (escaneo) {
          escaneo.asignado = true;
        }

        // Limpiar formulario
         this.empleadoForm = {
           nombre: '',
           correo: '',
           password: '',
           tipoEmpleado: ''
         };
        this.rfidSeleccionado = '';

        // Mostrar confirmación de éxito
        this.alertService.showSuccess(
          `El empleado ${nombreEmpleado} ha sido registrado exitosamente con el RFID ${rfidValue}`,
          'Empleado registrado'
        );
      },
      error: (error) => {
        console.error('Error al vincular RFID:', error);
        this.alertService.showError(
          'El usuario fue registrado pero hubo un error al vincular el RFID. Contacte al administrador.',
          'Error de vinculación RFID'
        );
      }
    });
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
