import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IoTService, TimeRecord as ApiTimeRecord } from '../../../services/IoTService/io-t.service';

interface TimeRecord {
  employeeId: string;
  employeeName: string;
  entryTime: Date;
  exitTime: Date | null;
  totalHours: number;
  rfidValue?: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  timeRecords: TimeRecord[] = [];
  selectedDate: string = '';
  maxDate: string = '';

  constructor(private iotService: IoTService) {
    console.log('CheckoutComponent inicializado');
    this.initializeDates();
  }

  ngOnInit() {
    this.loadTimeRecords();
  }

  private initializeDates() {
    const today = new Date();
    this.selectedDate = this.formatDateForInput(today);
    this.maxDate = this.formatDateForInput(today);
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onDateChange() {
    console.log('Fecha seleccionada:', this.selectedDate);
    this.loadTimeRecords();
  }

  private loadTimeRecords() {
    if (!this.selectedDate) {
      console.warn('No hay fecha seleccionada');
      return;
    }

    console.log('Cargando registros de tiempo para:', this.selectedDate);
    
    this.iotService.GetLastData(this.selectedDate).subscribe({
      next: (response) => {
        console.log('Datos recibidos del backend:', response);
        
        // Convertir los datos del API al formato local
        this.timeRecords = response.data.map(record => ({
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          entryTime: new Date(record.entryTime),
          exitTime: record.exitTime ? new Date(record.exitTime) : null,
          totalHours: record.totalHours,
          rfidValue: record.rfidValue
        }));
        
        // Calcular horas actuales para empleados que siguen trabajando
        this.calculateCurrentWorkingHours();
      },
      error: (error) => {
        console.error('Error al cargar registros de tiempo:', error);
        // En caso de error, mostrar array vacío
        this.timeRecords = [];
      }
    });
  }

  private calculateCurrentWorkingHours() {
    const currentTime = new Date();
    const today = this.formatDateForInput(currentTime);
    
    // Solo calcular horas actuales si estamos viendo el día de hoy
    if (this.selectedDate === today) {
      this.timeRecords.forEach(record => {
        if (!record.exitTime) {
          const timeDiff = currentTime.getTime() - record.entryTime.getTime();
          record.totalHours = Math.max(0, timeDiff / (1000 * 60 * 60)); // Convert to hours
        }
      });
    }
  }

  formatTotalTime(hours: number): string {
    if (hours === 0) return '0:00';
    
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  }

  trackByEmployee(index: number, record: TimeRecord): string {
    return record.employeeId;
  }
}
