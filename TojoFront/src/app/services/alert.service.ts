import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AlertData } from '../interfaces/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new BehaviorSubject<AlertData | null>(null);
  public alert$ = this.alertSubject.asObservable();

  showAlert(alertData: AlertData) {
    this.alertSubject.next(alertData);
  }

  showSuccess(message: string, title: string = 'Éxito', duration: number = 0, statusCode?: number) {
    this.showAlert({
      type: 'success',
      title,
      message,
      statusCode,
      duration
    });
  }

  showError(message: string, title: string = 'Error', statusCode?: number, duration?: number) {
    this.showAlert({
      type: 'error',
      title,
      message,
      statusCode,
      duration
    });
  }

  showWarning(message: string, title: string = 'Advertencia', duration: number = 4000) {
    this.showAlert({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  showInfo(message: string, title: string = 'Información', duration: number = 3000) {
    this.showAlert({
      type: 'info',
      title,
      message,
      duration
    });
  }

  hideAlert() {
    this.alertSubject.next(null);
  }
}
