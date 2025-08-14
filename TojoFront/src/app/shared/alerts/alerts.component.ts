import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import { AlertData } from '../../interfaces/api-response.interface';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.css'
})
export class AlertsComponent implements OnInit, OnDestroy {
  currentAlert: AlertData | null = null;
  private alertSubscription: Subscription = new Subscription();

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.alertSubscription = this.alertService.alert$.subscribe(
      alert => {
        this.currentAlert = alert;
      }
    );
  }

  ngOnDestroy() {
    this.alertSubscription.unsubscribe();
  }

  closeAlert() {
    this.alertService.hideAlert();
  }

  getAlertIcon(): string {
    if (!this.currentAlert) return '';
    
    switch (this.currentAlert.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  }

  getAlertClass(): string {
    if (!this.currentAlert) return '';
    return `alert-${this.currentAlert.type}`;
  }

  getStatusLabel(statusCode: number): string {
    if (!statusCode) return '';
    // Mapeos comunes en español
    const common: Record<number, string> = {
      200: 'OK',
      201: 'Creado',
      202: 'Aceptado',
      204: 'Sin Contenido',
      400: 'Solicitud Incorrecta',
      401: 'No Autorizado',
      403: 'Acceso Denegado',
      404: 'No Encontrado',
      409: 'Conflicto',
      422: 'Datos Inválidos',
      429: 'Demasiadas Solicitudes',
      500: 'Error del Servidor',
      502: 'Puerta de Enlace Incorrecta',
      503: 'Servicio No Disponible',
      504: 'Tiempo de Espera Agotado'
    };
    if (common[statusCode]) return common[statusCode];

    const group = Math.floor(statusCode / 100);
    switch (group) {
      case 2: return 'Éxito';
      case 4: return 'Error del Cliente';
      case 5: return 'Error del Servidor';
      default: return 'Estado';
    }
  }
}
