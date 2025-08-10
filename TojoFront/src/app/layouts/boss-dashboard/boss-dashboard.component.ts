import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-boss-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './boss-dashboard.component.html',
  styleUrl: './boss-dashboard.component.css'
})
export class BossDashboardComponent implements OnInit, OnDestroy {
// Propiedades del usuario
  userName: string = 'Ana García';
  userRole: string = 'Gerente General';
  
  // Propiedades de navegación
  activeTab: string = 'feed';
  
  // Propiedades de notificaciones
  notificationCount: number = 5;

  private routerSubscription: Subscription = new Subscription();

  constructor(private router: Router) {}

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
}
