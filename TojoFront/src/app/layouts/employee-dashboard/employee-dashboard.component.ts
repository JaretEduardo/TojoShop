import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { TasksComponent } from '../../components/employee/tasks/tasks.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TasksComponent],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.css'
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
  // Propiedades del usuario
  userName: string = 'Juan Pérez';
  userRole: string = 'Empleado';
  
  // Propiedades de navegación
  activeTab: string = 'pos';
  
  // Propiedades de notificaciones
  notificationCount: number = 3;
  alertCount: number = 2;

  private routerSubscription: Subscription = new Subscription();

  constructor(private router: Router) {}

  ngOnInit() {
    // Detectar la ruta actual al iniciar
    this.updateActiveTabFromRoute();
    
    // Escuchar cambios en la navegación
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateActiveTabFromRoute();
      });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

  private updateActiveTabFromRoute() {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/pos')) {
      this.activeTab = 'pos';
    } else if (currentUrl.includes('/tasks')) {
      this.activeTab = 'tasks';
    } else if (currentUrl.includes('/alerts')) {
      this.activeTab = 'alerts';
    } else if (currentUrl.includes('/inventory')) {
      this.activeTab = 'inventory';
    }
  }

  // Métodos de navegación
  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.router.navigate([tab]);
  }

  openNotifications() {
    console.log('Abrir notificaciones');
    // Aquí implementarías la lógica para mostrar las notificaciones
  }
}
