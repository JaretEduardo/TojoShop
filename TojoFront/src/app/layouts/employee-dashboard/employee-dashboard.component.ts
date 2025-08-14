import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { finalize } from 'rxjs/operators';
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
  userName: string = 'Invitado';
  userRole: string = 'Empleado';
  
  // Propiedades de navegación
  activeTab: string = 'pos';
  
  // Propiedades de notificaciones
  notificationCount: number = 3;
  alertCount: number = 2;

  private routerSubscription: Subscription = new Subscription();

  // Logout modal state
  showLogoutModal = false;
  loggingOut = false;

  constructor(private router: Router, private authService: AuthService) {
    // Cargar nombre y rol desde localStorage igual que en navbarauth
    try {
      const storedName = localStorage.getItem('user_name');
      if (storedName && storedName.trim().length > 0) {
        this.userName = storedName;
      }
      const storedRole = localStorage.getItem('user_role');
      if (storedRole && storedRole.trim().length > 0) {
        this.userRole = this.capitalize(storedRole);
      }
    } catch {
      // Ignorar errores de acceso a localStorage
    }
  }

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

  private capitalize(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  // ===== Logout Flow =====
  openLogoutConfirm() {
    this.showLogoutModal = true;
  }

  cancelLogout() {
    if (this.loggingOut) return;
    this.showLogoutModal = false;
  }

  confirmLogout() {
    if (this.loggingOut) return;
    this.loggingOut = true;
    this.authService.Logout()
      .pipe(finalize(() => {
        this.loggingOut = false;
        this.showLogoutModal = false;
      }))
      .subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: () => {
          // En caso de error igualmente limpiamos y redirigimos
          try { localStorage.removeItem('access_token'); } catch {}
          try { localStorage.removeItem('user_role'); } catch {}
          try { localStorage.removeItem('user_name'); } catch {}
          this.router.navigate(['/auth/login']);
        }
      });
  }
}
