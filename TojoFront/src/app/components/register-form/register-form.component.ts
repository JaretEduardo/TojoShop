import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css'
})
export class RegisterFormComponent {
  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  acceptTerms = false;
  showPassword = false;
  showConfirmPassword = false;
  showTermsModal = false;
  isSubmitting = false;
  constructor(private alertService: AlertService, private authService: AuthService) { }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  showTermsWarning() {
    this.showTermsModal = true;
  }

  closeTermsModal() {
    this.showTermsModal = false;
  }

  onSubmit() {
    // Validar que el nombre no esté vacío
    if (!this.registerData.name.trim()) {
      this.alertService.showWarning(
        'Por favor ingresa tu nombre completo',
        'Campo requerido'
      );
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.alertService.showError(
        'Por favor ingresa un email válido',
        'Email inválido'
      );
      return;
    }

    // Validar contraseña (debe ser >= 8 como en el backend)
    if (this.registerData.password.length < 8) {
      this.alertService.showWarning(
        'La contraseña debe tener al menos 8 caracteres',
        'Contraseña muy corta'
      );
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.alertService.showError(
        'Las contraseñas no coinciden. Verifique los datos ingresados.',
        'Error de validación'
      );
      return;
    }

    if (!this.acceptTerms) {
      this.showTermsWarning();
      return;
    }
    // Llamar al backend
    this.isSubmitting = true;
    const payload = {
      name: this.registerData.name.trim(),
      email: this.registerData.email.trim(),
      password: this.registerData.password,
      password_confirmation: this.registerData.confirmPassword,
      role: 'usuario' as const,
    };

    this.authService.Register(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        // El interceptor global mostrará el mensaje de éxito
        // Limpiar campos sensibles
        this.registerData.password = '';
        this.registerData.confirmPassword = '';
      },
      error: () => {
        this.isSubmitting = false;
        // El interceptor global mostrará el mensaje de error
      }
    });
  }

  // Método para demostrar diferentes tipos de alertas
  testAlerts() {
    this.alertService.showInfo(
      'Esta es una alerta informativa para mostrar información general.',
      'Información'
    );
  }
}
