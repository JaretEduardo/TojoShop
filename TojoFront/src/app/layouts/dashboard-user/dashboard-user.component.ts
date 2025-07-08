import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-dashboard-user',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './dashboard-user.component.html',
  styleUrl: './dashboard-user.component.css'
})
export class DashboardUserComponent {
  userName = 'Usuario';
  notificationCount = 3;

  constructor(private router: Router) {}

  openNotifications() {
    console.log('Abrir notificaciones');
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToFavorites() {
    this.router.navigate(['/favorites']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }

  logout() {
    // Lógica para cerrar sesión
    console.log('Cerrar sesión');
    this.router.navigate(['/auth/login']);
  }
}
