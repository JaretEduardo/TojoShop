import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit {
  isLoginPage = true;

  constructor(private router: Router) {}

  ngOnInit() {
    // Detectar la ruta actual inicialmente
    this.updatePageState();

    // Escuchar cambios de navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updatePageState();
    });
  }

  private updatePageState() {
    this.isLoginPage = this.router.url.includes('/login') || this.router.url === '/auth';
  }

  get toggleText() {
    return this.isLoginPage ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?';
  }

  get toggleButtonText() {
    return this.isLoginPage ? 'Registrarse' : 'Iniciar Sesión';
  }

  get toggleRoute() {
    return this.isLoginPage ? '/auth/register' : '/auth/login';
  }
}
