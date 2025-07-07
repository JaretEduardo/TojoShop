import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nfc',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nfc.component.html',
  styleUrl: './nfc.component.css'
})
export class NfcComponent {
  isScanning = false;
  statusMessage = 'Selecciona un método para conectar';

  constructor(private router: Router) {}

  activateNFC() {
    this.isScanning = true;
    this.statusMessage = 'Aproxima tu dispositivo al sensor NFC...';
    
    // Simular proceso de escaneo
    setTimeout(() => {
      this.statusMessage = 'Conexión establecida. Redirigiendo...';
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1500);
    }, 3000);
  }

  activateCamera() {
    this.isScanning = true;
    this.statusMessage = 'Preparando cámara para escanear QR...';
    
    // Simular proceso de escaneo
    setTimeout(() => {
      this.statusMessage = 'Código QR detectado. Procesando...';
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1500);
    }, 3000);
  }
}
