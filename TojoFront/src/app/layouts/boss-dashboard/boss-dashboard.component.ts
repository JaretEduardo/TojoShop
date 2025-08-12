import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-boss-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './boss-dashboard.component.html',
  styleUrl: './boss-dashboard.component.css'
})
export class BossDashboardComponent implements OnInit, OnDestroy {
// Propiedades del usuario
  userName: string = 'Invitado';
  userRole: string = 'Gerente';
  
  // Propiedades de navegación
  activeTab: string = 'feed';
  
  // Propiedades de notificaciones
  notificationCount: number = 5;

  private routerSubscription: Subscription = new Subscription();

  // Logout modal state
  showLogoutModal = false;
  loggingOut = false;

  constructor(private router: Router, private authService: AuthService) {
    // Cargar nombre y rol desde localStorage (igual que employee dashboard)
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
      // ignorar
    }
  }

  ngOnInit() {
    console.log('BossDashboardComponent inicializado');
    // Detectar la ruta actual al iniciar
    this.updateActiveTabFromRoute();
    
    // Si estamos en la raíz del boss dashboard, navegar a feed
    if (this.router.url === '' || this.router.url === '/') {
      this.router.navigate(['feed']);
    }
    
    // Escuchar cambios en la navegación
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        console.log('Navegación detectada:', event.url);
        this.updateActiveTabFromRoute();
      });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

  private updateActiveTabFromRoute() {
    const currentUrl = this.router.url;
    console.log('URL actual:', currentUrl);
    
    if (currentUrl.includes('/feed')) {
      this.activeTab = 'feed';
    } else if (currentUrl.includes('/identity')) {
      this.activeTab = 'identity';
    } else if (currentUrl.includes('/products')) {
      this.activeTab = 'products';
    } else if (currentUrl.includes('/checkout')) {
      this.activeTab = 'checkout';
    } else if (currentUrl.includes('/alertfeed')) {
      this.activeTab = 'alertfeed';
    } else {
      // Default to feed if no specific route
      this.activeTab = 'feed';
      console.log('Estableciendo feed como tab por defecto');
    }
    
    console.log('Active tab:', this.activeTab);
  }

  // Métodos de navegación
  setActiveTab(tab: string) {
    console.log('Navegando a tab:', tab);
    this.activeTab = tab;
    this.router.navigate([tab]);
  }

  openNotifications() {
    console.log('Abrir panel de notificaciones ejecutivas');
    // Implementar modal de notificaciones para gerencia
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
          try { localStorage.removeItem('access_token'); } catch {}
          try { localStorage.removeItem('user_role'); } catch {}
          try { localStorage.removeItem('user_name'); } catch {}
          this.router.navigate(['/auth/login']);
        }
      });
  }
}
