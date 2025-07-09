import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.css'
})
export class EmployeeDashboardComponent {
  // Propiedades del usuario
  userName: string = 'Juan Pérez';
  userRole: string = 'Empleado';
  
  // Propiedades de navegación
  activeTab: string = 'pos';
  
  // Propiedades de notificaciones
  notificationCount: number = 3;
  alertCount: number = 2;

  // Métodos de navegación
  setActiveTab(tab: string) {
    this.activeTab = tab;
    console.log(`Cambio de pestaña a: ${tab}`);
  }

  openNotifications() {
    console.log('Abrir notificaciones');
    // Aquí implementarías la lógica para mostrar las notificaciones
  }
}
