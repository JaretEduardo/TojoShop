import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TimeRecord {
  employeeId: string;
  employeeName: string;
  entryTime: Date;
  exitTime: Date | null;
  totalHours: number;
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

  constructor() {
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
    // Simulación de datos - en producción vendría del backend
    const mockData: TimeRecord[] = [
      {
        employeeId: 'EMP001',
        employeeName: 'Ana García López',
        entryTime: new Date(`${this.selectedDate}T08:00:00`),
        exitTime: new Date(`${this.selectedDate}T17:00:00`),
        totalHours: 9
      },
      {
        employeeId: 'EMP002',
        employeeName: 'Carlos Martín Silva',
        entryTime: new Date(`${this.selectedDate}T09:15:00`),
        exitTime: new Date(`${this.selectedDate}T18:30:00`),
        totalHours: 9.25
      },
      {
        employeeId: 'EMP003',
        employeeName: 'María Elena Torres',
        entryTime: new Date(`${this.selectedDate}T07:45:00`),
        exitTime: null,
        totalHours: 0
      },
      {
        employeeId: 'EMP004',
        employeeName: 'José Luis Hernández',
        entryTime: new Date(`${this.selectedDate}T08:30:00`),
        exitTime: new Date(`${this.selectedDate}T16:45:00`),
        totalHours: 8.25
      },
      {
        employeeId: 'EMP005',
        employeeName: 'Laura Patricia Ruiz',
        entryTime: new Date(`${this.selectedDate}T09:00:00`),
        exitTime: new Date(`${this.selectedDate}T17:15:00`),
        totalHours: 8.25
      }
    ];

    this.timeRecords = mockData;
    this.calculateCurrentWorkingHours();
  }

  private calculateCurrentWorkingHours() {
    const currentTime = new Date();
    
    this.timeRecords.forEach(record => {
      if (!record.exitTime) {
        const timeDiff = currentTime.getTime() - record.entryTime.getTime();
        record.totalHours = Math.max(0, timeDiff / (1000 * 60 * 60)); // Convert to hours
      }
    });
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
