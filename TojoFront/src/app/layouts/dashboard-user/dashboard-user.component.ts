import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

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

  constructor(private router: Router, private authService: AuthService) {}

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
    this.authService.Logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login'])
    });
  }
}
