import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (!this.acceptTerms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }
    
    console.log('Register data:', this.registerData);
    // Aquí irá la lógica de registro
  }
}
