import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  loginData = {
    email: '',
    password: ''
  };
  
  rememberMe = false;
  showPassword = false;
  isSubmitting = false;

  constructor(private alertService: AlertService, private authService: AuthService) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.loginData.email)) {
      this.alertService.showError(
        'Por favor ingresa un email válido',
        'Email inválido'
      );
      return;
    }

    // Validar contraseña (>= 8)
    if (!this.loginData.password || this.loginData.password.length < 8) {
      this.alertService.showWarning(
        'La contraseña debe tener al menos 8 caracteres',
        'Contraseña muy corta'
      );
      return;
    }

    // Aquí irá la lógica de autenticación (AuthService.Login)
    this.isSubmitting = true;
    const payload = {
      email: this.loginData.email.trim(),
      password: this.loginData.password,
    };

    this.authService.Login(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
        // El interceptor global mostrará el mensaje de error
      }
    });
  }
}
