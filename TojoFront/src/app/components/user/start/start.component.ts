import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './start.component.html',
  styleUrl: './start.component.css'
})
export class StartComponent {
  userName = 'Usuario'; // Esto vendrá del servicio de autenticación
  notificationCount = 3; // Número de notificaciones

  constructor(private router: Router) {}

  // Navegación a diferentes secciones
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
    // Aquí implementarás la lógica de logout
    console.log('Cerrando sesión...');
    this.router.navigate(['/auth/login']);
  }

  openNotifications() {
    // Aquí implementarás la lógica de notificaciones
    console.log('Abriendo notificaciones...');
  }
}
