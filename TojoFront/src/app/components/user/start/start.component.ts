import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './start.component.html',
  styleUrl: './start.component.css'
})
export class StartComponent implements OnInit {
  userName = 'Usuario';
  notificationCount = 3; // Número de notificaciones

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    try {
      const name = localStorage.getItem('user_name');
      if (name && name.trim().length > 0) {
        this.userName = name;
      }
    } catch {}
  }

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
    this.authService.Logout().subscribe({
      next: () => {
        try { localStorage.removeItem('user_name'); } catch {}
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Si falla, igual limpiamos nombre local y redirigimos
        try { localStorage.removeItem('user_name'); } catch {}
        this.router.navigate(['/auth/login']);
      }
    });
  }

  openNotifications() {
    // Aquí implementarás la lógica de notificaciones
    console.log('Abriendo notificaciones...');
  }
}
